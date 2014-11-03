var tessel = require('tessel');
var extend = require('util')._extend;

var leds = {
	red   : tessel.led[2],
	amber : tessel.led[3],
	green : tessel.led[0],
	blue  : tessel.led[1]
};

var colors = Object.keys(leds);

colors.forEach(function(color) {
	var led = leds[color];
	var interval;
	led.on = function() {
		clearInterval(interval);
		led.output(1);
	};
	led.off = function() {
		clearInterval(interval);
		led.output(0);
	};
	led.blink = function(duration, times) {
		times = times || 1;
		times *= 2;
		led.off();
		interval = setInterval(function() {
			led.toggle();
			if (--times <= 0) {
				led.off();
			}
		}, duration);
	};
});

var all = {
	on: function() {
		colors.forEach(function(color) {
			leds[color].on();
		});
	},
	off: function() {
		colors.forEach(function(color) {
			leds[color].off();
		});
	},
	blink: function(duration, times) {
		colors.forEach(function(color) {
			leds[color].blink(duration, times);
		});
	}
};

module.exports = extend(all, leds);
