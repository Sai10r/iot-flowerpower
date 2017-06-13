var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://127.0.01');
var mqttConnected = false;

client.on('connect', function () {
  console.log("connected to MQTT");
  mqttConnected=true;
})

var DomSunlight = 0;
var DomSoilEC = 0;
var DomSoilTemp = 0;
var DomAirTemp = 0;
var DomSoilMoisture = 0;
var DomBatteryLevel = 0;
var DomSystemID = '-';
var SensorID = process.argv[2].toLowerCase();
var requestify = require('requestify'); 
var async = require('async'); 
var HashMap = require('hashmap');
var FlowerPower = require('./indexFP'); 
var hasCalibratedData = false; 
var uuid = "undefined";
var battery = "0"; 
var UpdateSuccess = "0";

console.log('Processing: ' + SensorID);



//Set up domoticz data
var DomoticzIP = "192.168.2.201:8080"


var idConvertion = new HashMap();
//notation: ("flowerpowermac", IDXSUN-IDXSOILEC-IDXSOILTEMP-IDXAirtemp-IDXSoilMoist)
//Genetisch Gemodificeerde Dracaena - Wageningen
idConvertion.set("a0143d0877f2", "524-527-526-514-525");
//Grote Dracaena
idConvertion.set("a0143d0d8a61", "519-516-520-518-521");
//Kleine Dracaena
idConvertion.set("a0143d08b7da", "523-509-511-508-522");

  
  
//for UpdateSuccess
//turn this into function retry
  
  FlowerPower.discoverById(SensorID,function(flowerPower) { 
    async.series([ 
      function(callback) { 
        flowerPower.on('disconnect', function() { 
          console.log('disconnected!'); 
          process.exit(0); 
       
        }); 
  
      flowerPower.on('sunlightChange', function(sunlight) {
        console.log('\tsunlight = ' + sunlight.toFixed(2) + ' mol/m²/d');
      });

       flowerPower.on('soilElectricalConductivityChange', function(soilElectricalConductivity) {
         console.log('soil electrical conductivity = ' + soilElectricalConductivity.toFixed(2));
       });

      flowerPower.on('soilTemperatureChange', function(temperature) {
        console.log('\tsoil temperature = ' + temperature.toFixed(2) + '°C');
      });

      flowerPower.on('airTemperatureChange', function(temperature) {
        console.log('\tair temperature = ' + temperature.toFixed(2) + '°C');
      });

      flowerPower.on('soilMoistureChange', function(soilMoisture) {
        console.log('\tsoil moisture = ' + soilMoisture.toFixed(2) + '%');
      });

      flowerPower.on('calibratedSoilMoistureChange', function(soilMoisture) {
        console.log('\tcalibrated soil moisture = ' + soilMoisture.toFixed(2) + '%');
      });

      flowerPower.on('calibratedAirTemperatureChange', function(temperature) {
        console.log('\tcalibrated air temperature = ' + temperature.toFixed(2) + '°C');
      });

      flowerPower.on('calibratedSunlightChange', function(sunlight) {
        console.log('\tcalibrated sunlight = ' + sunlight.toFixed(2) + ' mol/m²/d');
      });

      flowerPower.on('calibratedEaChange', function(ea) {
        console.log('\tcalibrated EA = ' + ea.toFixed(2));
      });

      flowerPower.on('calibratedEcbChange', function(ecb) {
        console.log('\tcalibrated ECB = ' + ecb.toFixed(2) + ' dS/m');
      });

      flowerPower.on('calibratedEcPorousChange', function(ecPorous) {
        console.log('\tcalibrated EC porous = ' + ecPorous.toFixed(2)+ ' dS/m');
      });

  
        console.log('serial id of this flowerpower : ' + flowerPower.uuid);
        uuid = flowerPower.uuid;
        console.log('connectAndSetup'); 
        flowerPower.connectAndSetup(callback); 
      }, 
      function(callback) { 
        console.log('readSystemId'); 
        flowerPower.readSystemId(function(error, systemId) { 
          console.log('\tsystem id = ' + systemId); 
          DomSystemID  = systemId;
          callback(); 
        }); 
      }, 
      function(callback) { 
        console.log('readSerialNumber'); 
        flowerPower.readSerialNumber(function(error, serialNumber) { 
          console.log('\tserial number = ' + serialNumber); 
          callback(); 
        }); 
      }, 
      function(callback) { 
        console.log('readFirmwareRevision'); 
        flowerPower.readFirmwareRevision(function(error, firmwareRevision) { 
          console.log('\tfirmware revision = ' + firmwareRevision); 
  
          var version = firmwareRevision.split('_')[1].split('-')[1]; 
  
          hasCalibratedData = (version >= '1.1.0'); 
  
          callback(); 
        }); 
      }, 
      function(callback) { 
        console.log('readHardwareRevision'); 
        flowerPower.readHardwareRevision(function(error, hardwareRevision) { 
          console.log('\thardware revision = ' + hardwareRevision); 
          callback(); 
        }); 
      }, 
      function(callback) { 
        console.log('readManufacturerName'); 
        flowerPower.readManufacturerName(function(error, manufacturerName) { 
          console.log('\tmanufacturer name = ' + manufacturerName); 
          callback(); 
        }); 
      }, 
      function(callback) { 
        console.log('readBatteryLevel'); 
        flowerPower.readBatteryLevel(function(error, batteryLevel) { 
          console.log('battery level = ' + batteryLevel); 
          DomBatteryLevel = batteryLevel;
          callback(); 
        }); 
      }, 
  

  
      function(callback) { 
        console.log('readColor'); 
        flowerPower.readColor(function(error, color) { 
          console.log('\tcolor = ' + color); 
  
          callback(); 
        }); 
      }, 
      function(callback) { 
        console.log('readSunlight'); 
        flowerPower.readSunlight(function(error, sunlight) { 
          console.log('sunlight = ' + sunlight.toFixed(2) + ' mol/m²/d'); 
          DomSunlight = sunlight.toFixed(2);
          callback(); 
        }); 
      }, 
       function(callback) { 
         console.log('readSoilElectricalConductivity'); 
         flowerPower.readSoilElectricalConductivity(function(error, soilElectricalConductivity) { 
           console.log('soil electrical conductivity = ' + soilElectricalConductivity.toFixed(2)); 
           DomSoilEC = soilElectricalConductivity.toFixed(2);
           callback(); 
         }); 
       }, 
      function(callback) { 
        console.log('readSoilTemperature'); 
        flowerPower.readSoilTemperature(function(error, temperature) { 
          console.log('soil temperature = ' + temperature.toFixed(2) + '°C'); 
          DomSoilTemp = temperature.toFixed(2);
          callback(); 
        }); 
      }, 
      function(callback) { 
        console.log('readAirTemperature'); 
        flowerPower.readAirTemperature(function(error, temperature) { 
          console.log('air temperature = ' + temperature.toFixed(2) + '°C'); 
          DomAirTemp = temperature.toFixed(2);
          callback(); 
        }); 
      }, 
      function(callback) { 
        console.log('readSoilMoisture'); 
        flowerPower.readSoilMoisture(function(error, soilMoisture) { 
          console.log('soil moisture = ' + soilMoisture.toFixed(2) + '%'); 
          DomSoilMoisture = soilMoisture.toFixed(2);
          callback(); 
        }); 
      }, 
      function(callback) { 
        if (hasCalibratedData) { 
          async.series([ 
          function(callback) {
            console.log('readCalibratedSoilMoisture');
            flowerPower.readCalibratedSoilMoisture(function(error, soilMoisture) {
              console.log('\tcalibrated soil moisture = ' + soilMoisture.toFixed(2) + '%');
                  DomSoilMoisture = soilMoisture.toFixed(2);
                callback(); 
              }); 
            }, 
          function(callback) {
            console.log('readCalibratedAirTemperature');
            flowerPower.readCalibratedAirTemperature(function(error, temperature) {
              console.log('\tcalibrated air temperature = ' + temperature.toFixed(2) + '°C');
                   DomAirTemp = temperature.toFixed(2);
                callback(); 
              }); 
            }, 
          function(callback) {
            console.log('readCalibratedSunlight');
            flowerPower.readCalibratedSunlight(function(error, sunlight) {
              console.log('\tcalibrated sunlight = ' + sunlight.toFixed(2) + ' mol/m²/d');
               DomSunlight = sunlight.toFixed(2);
                callback(); 
              }); 
            }, 
  
  
            //Calibrated Soil readings does not work, causes disconnect. Do not use
             /*
          function(callback) {
            console.log('readCalibratedEa');
            flowerPower.readCalibratedEa(function(error, ea) {
              console.log('\tcalibrated EA = ' + ea.toFixed(2));
  
                callback(); 
              }); 
            }, 
  
  
          function(callback) {
            console.log('readCalibratedEcb');
            flowerPower.readCalibratedEcb(function(error, ecb) {
              console.log('\tcalibrated ECB = ' + ecb.toFixed(2) + ' dS/m');
  
                callback(); 
              }); 
            }, 
          function(callback) {
            console.log('readCalibratedEcPorous');
            flowerPower.readCalibratedEcPorous(function(error, ecPorous) {
              console.log('\tcalibrated EC porous = ' + ecPorous.toFixed(2) + ' dS/m');
  
                callback(); 
              }); 
            }, 
          */   
  
  
  
            function() { 
                  console.log('uuid = ' + uuid);
                  console.log('System ID = ' + DomSystemID);
                  console.log('DomSunlight result = ' + DomSunlight);
                  console.log('DomSoilEC result = ' + DomSoilEC);
                  console.log('DomSoilTemp result = ' + DomSoilTemp);
                  console.log('DomAirTemp result = ' + DomAirTemp);
                  console.log('DomSoilMoisture result = ' + DomSoilMoisture);
                  console.log('DomBatteryLevel result = ' + DomBatteryLevel);


		var dataObject={"@c": ".FlowPower"};
		dataObject.uuid=uuid;
		dataObject.systemId=DomSystemID;
		dataObject.sunlight=DomSunlight;
		dataObject.soilEC=DomSoilEC;
		dataObject.soilTemp=DomSoilTemp;
		dataObject.airTemp=DomAirTemp;
		dataObject.soilMoisture=DomSoilMoisture;
		dataObject.batteryLevel=DomBatteryLevel;
		dataObject.dateTime=new Date();

		var dataObjectString=JSON.stringify(dataObject);
		console.log(dataObjectString);
          
		client.publish('/sensordata', dataObjectString);                  
                  
                  
              callback(); 
            } 
          ]); 
        } else { 
          callback(); 
        } 
      }, 
  
 
      
      //Consider commenting out the LedPulse and LedOff to save battery,
      function(callback) { 
        console.log('ledPulse'); 
        flowerPower.ledPulse(callback); 
      }, 
      
      //Keep Delay in?
      function(callback) { 
        console.log('delay'); 
        setTimeout(callback, 2000); 
      }, 
      function(callback) { 
        console.log('ledOff'); 
        flowerPower.ledOff(callback); 
      }, 
      function(callback) { 
        console.log('disconnect'); 
        flowerPower.disconnect(callback); 
      } 
    ]); 
  });
