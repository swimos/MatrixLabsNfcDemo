class NfcDemoScreen {
    
    constructor(parentApp, swimUrl) {
        this.parentDiv = parentApp;
        this.swimUrl = swimUrl;
        this.links = [];
        this.history = [];
    }

    start() {

        this.links['code'] = swim.downlinkValue()
            .hostUri(this.swimUrl)
            .nodeUri(`/nfc`)
            .laneUri("code")
            .didSet((newValue, oldValue) => {
                // console.info('code', newValue);
                if(newValue.isDefined()) {
                    document.getElementById("nfcCode").innerHTML = newValue.stringValue();
                } else {
                    document.getElementById("nfcCode").innerHTML = "No Tags Scanned";
                }
            });        

        this.links['rawTagData'] = swim.downlinkValue()
            .hostUri(this.swimUrl)
            .nodeUri(`/nfc`)
            .laneUri("rawTagData")
            .didSet((newValue, oldValue) => {
                // console.info(newValue.isDefined());
                if(newValue.isDefined()) {
                    // console.info('rawTagData', newValue.toObject());
                    const tagInfo = newValue.get("info");
                    document.getElementById("rawData").innerText = JSON.stringify(newValue.toObject());
                    document.getElementById("nfcType").innerText = tagInfo.get("type").stringValue("");
                    document.getElementById("nfcReadStatus").innerText = tagInfo.get("read_status").stringValue("0");
                }
            });        

        this.links['payload'] = swim.downlinkValue()
            .hostUri(this.swimUrl)
            .nodeUri(`/nfc`)
            .laneUri("payload")
            .didSet((newValue, oldValue) => {
                // console.info('payload', newValue);
                if(newValue.isDefined()) {
                    document.getElementById("nfcPayload").innerHTML = newValue;
                }
            });        

        this.links['history'] = swim.downlinkMap()
            .hostUri(this.swimUrl)
            .nodeUri(`/nfc`)
            .laneUri("history")
            .didUpdate((key, newValue, oldValue) => {
                // console.info('history', key, newValue);
                this.history[key.stringValue()] = newValue;
                this.renderHistory();
            })
            .didRemove((key, oldValue) => {
                delete this.history[key];
                this.renderHistory();
            });        


        for(let key in this.links) {
            this.links[key].open();
        }
    

    }

    stop() {
        for(let key in this.links) {
            this.links[key].close();
        }
    }

    renderHistory() {
        const historyDiv = document.getElementById("tagHistory");
        historyDiv.innerHTML = "";

        for(const historyItem in this.history) {
            const historyData = this.history[historyItem];
            const rowDiv = document.createElement("div");
            const timestamp = new Date(parseInt(historyItem));
            rowDiv.innerHTML = `${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()} ${historyData.get("decodedPayload").stringValue("No Tag")}`;
            historyDiv.appendChild(rowDiv);
            // console.info(historyData.get("decodedPayload").stringValue("No Tag"));

        }
    }
}
