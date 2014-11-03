var tessel = require('tessel');
var wifi   = require('wifi-cc3000');
var gprs   = require('gprs-sim900').use(tessel.port.A);
var gps    = require('gps-a2235h').use(tessel.port.C);

var leds     = require('./lib/leds');
var chain    = require('./lib/chain');
var commands = require('./lib/commands')(gprs);

var coords = null;

if (wifi.isEnabled()) {
	wifi.disable();
}

gprs.on('ready', function() {
	var initialize = chain(commands)
		.retry(commands.checkGprsState, 10, 2000)
		.setBearerSetting('CONTYPE', 'GPRS')
		.setBearerSetting('APN', 'internet')
		.openBearer()
		.initializeHttpService()
		.setHttpParameter('URL', 'http://something.herokuapp.com/events')
		.setHttpParameter('CONTENT', 'application/json')
		.setHttpParameter('TIMEOUT', '30')
		.end(function(err) {
			if (err) {
				return reset();
			}
			post();
		});
	var reset = function() {
		leds.off();
		leds.red.on();
		commands.restart(function() {
			leds.red.off();
			initialize();
		});
	};
	var post = function() {
		if (coords) {
			var content = coords;
			coords = null;
			leds.blue.on();
			return commands.sendPostRequest(content, function(err) {
				if (err) {
					leds.red.blink(300);
					console.log(err);
				}
				leds.blue.off();
				setTimeout(post, 500);
			});
		}
		leds.blue.blink(50, 2);
		setTimeout(post, 2000);
	};
	initialize();
});

gps.on('ready', function() {
	gps.on('coordinates', function(data) {
		coords = data;
	});
	gps.on('fix', function(data) {
		if (data.numSat <= 1) {
			leds.green.blink(50);
		} else if (data.numSat <= 6) {
			leds.green.blink(200);
		} else {
			leds.green.blink(200, 2);
		}
		coords.numSat = data.numSat;
	});
});
