const matrix = require("@matrix-io/matrix-lite");
const swimClient = require('@swim/client');
const nfc = require("@matrix-io/matrix-lite-nfc");
const swim = require("@swim/core");
const swimUi = require("@swim/ui")
const ndef = require('ndef');

class Main {
    constructor() {
        this.swimUrl = "ws://127.0.0.1:9001";
        this.showDebug = true;
        this.everloop = null;
        this.lastColor = null;
        this.mainLoop = null;
        this.mainLoopTimeMS = 20;
        this.animPixelColor = {r:0, g:0, b:0, w:0};
        this.currNfcCode = 0;
        this.rainbowStartIndex = 0;
        this.currentLedAnimation = "default";
        this.currRainbowStep = 0;
        this.isConnected = false;
        this.isFading = false;

        this.colorChange = false;
        this.nfcOptions = {
            rate: 50,    // Read loop speed (Milliseconds)
            // All these options enabled will slow reading speeds
            info: false,  // Generic information for any NFC tag
            pages: false, // All page data
            page: 0,     // A single page(faster than pages)
            ndef: true   // All NDEF data
        }

        this.initialize();
    }

    initialize() {
        if(this.showDebug) {
            console.info('[Main]: initialize');
        }
        this.everloop = new Array(matrix.led.length).fill({});
        this.everloop[0] = this.animPixelColor;
    }

    start() {
        if(this.showDebug) {
            console.info('[Main]: start');
        }
        swimClient.downlinkValue().hostUri(this.swimUrl).nodeUri('/settings/animation').laneUri('ledAnimation')
            .didSet((value)=> {
                if(this.currentLedAnimation != value.stringValue("default")) {
                    this.currentLedAnimation = value.stringValue("default");
                }
            })
            .didConnect(() => {
                console.info("connected");
                this.isConnected = true;
                this.updateColor(); // Init color change
            })
            .didClose(() => {
                console.info("disconnected");
                this.isConnected = false;
            })
            .open();        

        try {
            this.mainLoop = setInterval(() => {
                this.startNfcMonitor();
                this.updateLedAnim();
            }, this.mainLoopTimeMS);
    
        } catch(ex) {
            console.info("Error in startup", ex);
            setTimeout(this.start.bind(this), 1000);
        }
    }

    stop() {
        if(this.showDebug) {
            console.info('[Main]: stop');
        }
        this.everloop = new Array(matrix.led.length).fill({}); // clear LEDs
        matrix.led.set(this.everloop);
        this.stopNfcMonitor();
        clearTimeout(this.mainLoop);
    }

    startNfcMonitor() {
        nfc.read.start(this.nfcOptions, (code, tag) => {
            this.handleNfcMessage(code, tag);
        });        
    }

    stopNfcMonitor() {
        nfc.read.stop();
    }

    handleNfcMessage(code, tag) {
        if(this.currNfcCode !== code) {
            
            if (code === 256){
                console.log(`Tag Was Scanned: ${code}`);
                console.info(tag);
                let records = ndef.decodeMessage(tag.ndef.content);
                console.info("records", records);
                tag["ndefRecords"] = records;
                if(records && records[0] && records[0].value) {
                    tag["decodedPayload"] = records[0].value;
                } else {
                    tag["decodedPayload"] = "No Tag Value Found";
                }
                tag["code"] = code;
                this.doSwimCommand(this.swimUrl, `/nfc`, 'updateNfcData', JSON.stringify(tag));

            } else {
                console.log(`Nothing Was Scanned: ${code}`);
                tag["ndefRecords"] = null;
                tag["decodedPayload"] = null;
            }

            console.info(tag["decodedPayload"]);
            this.currNfcCode = code;
            tag["code"] = code;

            
        }
    }

    /**
       * Connect to swim downlinkValue to grab the latest color and set the color
       */
    updateColor() {
        if(this.isConnected) {
            swimClient.downlinkValue().hostUri(this.swimUrl).nodeUri('/settings/color').laneUri('rgbw')
                .didSet((value)=> {
                    const color = value.toAny();
                    this.setColor(color);
                }).open();
        }
    }

    /**
       * Set new light color
       */
    setColor(newColor) {
        this.colorChange = true;
        this.everloop.forEach((color, i)=> {
            if(color.r !== null && color.r !== undefined) {
                this.everloop[i] = newColor;
                this.colorChange = false;
            }
        });
    }

    /**
       * Looping light animation
       */
    updateLedAnim() {
        switch(this.currentLedAnimation) {
            case "rainbowFadeIn":
                this.rainbows("in");
                break;
            case "rainbowFadeOut":
                this.rainbows("out");
                break;
            default:
                if(!this.colorChange) {
                    this.lastColor = this.everloop.shift();
                    this.everloop.push(this.lastColor);
                    matrix.led.set(this.everloop);
                }
                break;
    
        }

    }

    doSwimCommand(hostUri, nodeUri, laneUri, msg) {
        // make sure we are connected to swim server. if not drop messages until we are.
        if(this.isConnected) {
            try {
                swimClient.command(hostUri, nodeUri, laneUri, msg);
            } catch(ex) {
                console.info(ex);
            }        
    
        } 
    }

    // rainbow LED flash animation (triggered when NFS state changes)
    rainbows(fadeDirection) {
        this.isFading = true;
        const startColor = swimUi.Color.rgb(0, 0, 255, 0.2).hsl();
        const endColor = swimUi.Color.rgb(255, 0, 0, 0.75).hsl();
        
        const maxPixels = matrix.led.length;
        const colorArray = [];


        for(let i=0; i<maxPixels;i++) {
            const newRgb = new swimUi.Color.rgb().hsl();
            newRgb.h = this.interpolate(startColor.h, endColor.h, i, maxPixels);
            newRgb.s = 1;
            newRgb.l = this.currRainbowStep;
            colorArray.push(newRgb.rgb().toString());
        }
        matrix.led.set(colorArray);


        if(fadeDirection === "in") {
            this.currRainbowStep = this.currRainbowStep + 0.02;
        } else {
            this.currRainbowStep = this.currRainbowStep - 0.05;
        }

        if(this.currRainbowStep > 0.5 && fadeDirection === "in") {
            this.doSwimCommand(this.swimUrl, `/settings/animation`, 'setLedAnimation', "rainbowFadeOut");
        } 
        if(this.currRainbowStep < 0) {
            this.doSwimCommand(this.swimUrl, `/settings/animation`, 'setLedAnimation', "default");          
            this.currRainbowStep = 0;
        }
        
        
    }

    interpolate(startValue, endValue, stepNumber, lastStepNumber) {
        return (endValue - startValue) * stepNumber / lastStepNumber + startValue;
    }    

}

// create Main and kick everything off by calling start()
const main = new Main();
main.start();

