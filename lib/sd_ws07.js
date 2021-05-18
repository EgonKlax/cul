'use strict';

// source: https://svn.fhem.de/fhem/trunk/fhem/FHEM/14_SD_WS07.pm
//#  the data is grouped in 9 nibbles
//#  [id0] [id1] [flags] [temp0] [temp1] [temp2] [const] [humi0] [humi1] 
//#  
//#  The 8-bit id changes when the battery is changed in the sensor. 
//#  flags are 4 bits B 0 C C, where B is the battery status: 1=OK, 0=LOW 
//#  and CC is the channel: 0=CH1, 1=CH2, 2=CH3 
//#  temp is 12 bit signed scaled by 10 
//#  const is always 1111 (0xF) or 1010 (0xA)
//#  humiditiy is 8 bits 

module.exports.parse = function (raw) {
    const message = {};

    message.protocol = 'SD_WS07';
    message.id = raw[1] + raw[2];
    message.channel = (Number.parseInt(raw[3], 16) & 7 ) + 1; 
    message.battery = (Number.parseInt(raw[3], 16)).toString(2).substr(0,1); 
        
    message.data = {};
    message.data.channel = message.channel;
    
    // temperature
    var $temp = Number.parseInt((raw[4] + raw[5] + raw[6]), 16);
    if ($temp > 700 && $temp < 3840) {
        $temp = 0;
    } else if ($temp >= 3840) {        // # negative temperature
        $temp -= 4096;
    }  
    $temp /= 10;

    message.data.temp = $temp;
    
    // hum
    message.data.hum = Number.parseInt(( raw[8] + raw[9]), 16);
    
    // battery in text
    if (message.battery === 1) {
        message.data.battery = "ok";
    } else {
        message.data.battery = "low";
    }
    
    return message;
};
