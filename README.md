Communicate with the Parrot Flower Power devices using bluetooth and publish it to a local MQTT server.

Based upon: https://github.com/Justinb81/domoticz-flower-power 

## Basic Process

TBD

## Install instructions

```
sudo apt-get install git libdbus-1-dev bluez libdbus-glib-1-dev libglib2.0-dev libical-dev libreadline-dev libudev-dev libusb-dev glib2.0 bluetooth libbluetooth-dev
```

```
bash <(curl -sL https://raw.githubusercontent.com/node-red/raspbian-deb-package/master/resources/update-nodejs-and-nodered)
sudo reboot
sudo hcitool lescan 
```

Note down/copy the flowerpower Mac Adresses somewhere

```
ctrl -c
cd ~
sudo npm install flower-power-ble
sudo npm install hashmap
sudo npm install --save async
```

```
git clone https://github.com/TrebingHimstedt/iot-flowerpower

cd iot-flowerpower

node FP2DOM.js a0143d0877f2 <-- bluetooth mac address without : in lower case format
```
