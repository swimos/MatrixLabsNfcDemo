# Swim + Matrix Creator NFC Demo

Java9+ and NodeJS are required to run the application. Gradle is also required but handled by Gradle wrapper and so will install automatically.
This application also needs to be running on the Matrix Creator device.

## Getting Started

### Device Setup
If you are starting fresh on a new Raspberry Pi, you need to be sure to setup your Matrix Creator device and install the code required for Matrix Lite
* First, walk through the [Matrix Creator Device Setup](https://matrix-io.github.io/matrix-documentation/matrix-creator/device-setup/) page available from [Matrix.one](matrix.one)
* Next you will need install [Matrix HAL](https://matrix-io.github.io/matrix-documentation/matrix-hal/getting-started/) on your Pi. This is required for Matrix Lite which is what we will be using for our data bridge into Swim.
* Now you can install [Matrix Lite](https://matrix-io.github.io/matrix-documentation/matrix-lite/getting-started/javascript/). Be sure to install the JavaScript version since we will be using NodeJS in this example.
* Last you will need to install the [Matrix NFC Library](https://matrix-io.github.io/matrix-documentation/matrix-hal/getting-started/installation-nfc/). 

## Install Java
We need java 9 or higher for swim. On Raspian Stretch we also need to add a new source in order to be able to install the correct version of Java. Follow the instructions below to add the new source.

Add deb source url to source list
```
echo "deb http://deb.debian.org/debian stretch-backports main" | sudo tee /etc/apt/sources.list.d/debian.list
sudo apt update
sudo apt install dirmngr
```

switch to root and add key for deb.debian.org
```
sudo su -
gpg --keyserver keys.gnupg.net --recv-keys 7638D0442B90D010 8B48AD6246925553
gpg --armor --export 7638D0442B90D010 | apt-key add -
gpg --armor --export 8B48AD6246925553 | apt-key add -
exit
```

## Download and Setup App
1. git clone https://github.com/swimos/MatrixLabsNfcDemo.git
2. cd MatrixLabsNfcDemo
4. ./setup.sh

## Running the app
**todo: update to talk about running compiled vs debug**
1. ./runSwim.sh
2. wait for app to start then hit ctrl-c
3. ./runBridge.sh

## Stopping the app
1. ./stopall.sh - this will kill both java and node

**todo: add instr. for  running to do debug/development**

**todo: add instr. for package.sh to compile**


### Notes:
* Log files are written to project base directory. 

## Basic App Folder Structure

* **/bridge** - code for data bridge from Matrix Lite to Swim
* **/server** - Swim Java Application codebase
* **/ui** - codebase for web based UI

## Swim Application Structure
* Main entry point is **/src/main/java/swim/matrixlabs/ApplicationPlane.java**
* WebAgents live in **/src/main/java/swim/matrixlabs/agents**
    * **/agents/NfcAgent.java** is the main WebAgent in the app. The NFCAgent has a variety of lanes to store information about NFC tags that get scanned.

## NFC Bridge
* This demo uses NodeJS to bridge NFC Scan from Matrix Lite NFC into Swim. Data is passed to the NFC WebAgant inside Swim using Swim Commands. 
* The bridge also sets up the LED animation inside updateLedAnim(). 

## Web UI

### Web UI served by swim (not node) and so the pages are at the same address as Swim itself
1. by Default the application runs at http://[device ip]:9001 
2. The Web UI can also be served by NodeJS instead of Swim, however we use Swim in this example to keep things simple.
3. The Swim Javascript Library and UI Components are all vanilla JS with no 3rd party requirements. This makes it easy to integrate into existing code bases and use in the way that works best for your project or environment.

## More Useful Documentation

### Matrix Documentation
* [Matrix Developer's Site](https://www.matrix.one/developers)
* [Matrix Lite JavaScript Reference](https://matrix-io.github.io/matrix-documentation/matrix-lite/js-reference/)
* [Matrix Community](https://community.matrix.one/)

### Swim Documentation
* [Swim Javascript Docs](https://docs.swimos.org/js/latest/index.html)
* [Swim JavaDocs](https://docs.swimos.org/java/latest/index.html)
* [Swim Tutorials](https://github.com/swimos/tutorial)
* [Swim Community](https://gitter.im/swimos/community)
