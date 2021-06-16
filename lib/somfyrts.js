'use strict';

var fs = require('fs');

var codes = {
    "MY": "1",
    "UP": "2",
    "DOWN": "4",
    "PROG": "8"
}



/**
 *
 * SOMFYRTS.cmd
 *
 * @param shuttertext   string, just a textual discription
 * @param address       string, device address - 6 digits hex string
 * @param command       string, cmd MY;PROG;UP,DOWN in uppercase
 * @param configFile    string, config file which stores rolling codes
 * @returns object      string (the raw message) or boolean false (on error)
 *
 */
module.exports.cmd = function (shuttertext, address, command, configFile) {
    var somfyCommand;
    var rollingCode;

    // check addree
    if (!address.match(/^[a-fA-F\d]{8}$/)) {
        return false;
    }

    // get rolling code
    rollingCode = getNextRollingCode(configFile, address, shuttertext);
    if (rollingCode === undefined && typeof rollingCode == 'undefined') {
        return false;
    }    

    somfyCommand = codes[command];
    if (somfyCommand === undefined && typeof somfyCommand == 'undefined') {
        return false;
    }

    return "Ys" + "A1" + somfyCommand + "0" + rollingCode + address;
}

function getNextRollingCode(configFile, deviceAddress, shuttertext) {
    let propertyFound;

    // get config
    var jsonConfig = getPropertyFile(configFile);
    
    // get address entry
    for(const entry in jsonConfig){
        if (jsonConfig[entry].deviceAddress == deviceAddress) {
            propertyFound = jsonConfig[entry];
            break;
        };
    }

    if (propertyFound === undefined && typeof propertyFound == 'undefined') {
        // new address
        propertyFound = {};
        propertyFound["deviceAddress"] = deviceAddress;
        propertyFound["rollingCode"] = 1;
        propertyFound["shutter"] = shuttertext;
        jsonConfig.push(propertyFound);
    } else {
        propertyFound.rollingCode = propertyFound.rollingCode + 1;
        //jsonConfig.push(propertyFound);
    } 
    
    try {
        // write new config
        const dataJSON = JSON.stringify(jsonConfig, null, 2);
        fs.writeFileSync(configFile, dataJSON);
    } catch (err) {
        console.log(err);
    }

    return Number(propertyFound.rollingCode).toString(16).slice(-4).padStart(4, '0');
}

function getPropertyFile(configFile) {
    let jsonObj = [];

    try {

        if (fs.existsSync(configFile)) {
            // File exists
            var contents = fs.readFileSync(configFile, 'utf8');
            jsonObj = JSON.parse(contents);

        } else {
            // File does not exists
            const dataJSON = JSON.stringify(jsonObj,null, 2);
            fs.writeFileSync(configFile, dataJSON);
        }


    } catch (err) {
        console.log(err);
    }

    return jsonObj;
}