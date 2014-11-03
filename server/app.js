var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var sse = (function() {
	var events = require('events');
	var emitter = new events.EventEmitter();
	function init(req, res) {
		var heartbeat = setInterval(function() {
			res.write(': heartbeat\n\n');
		}, 10000);
		function onData(data) {
			res.write('data: ' + JSON.stringify(data) + '\n\n');
		}
		emitter.on('data', onData);
		req.on('close', function() {
			clearInterval(heartbeat);
			emitter.removeListener('data', onData);
		});
		req.socket.setTimeout(Infinity);
		res.setHeader('Content-Type', 'text/event-stream');
		res.setHeader('Cache-Control', 'no-cache');
		res.setHeader('Connection', 'keep-alive');
	}
	function send(data) {
		emitter.emit('data', data);
	}
	return { init: init, send: send };
})();

var events = [];

app.use(express.static('./server/public'));
app.use(bodyParser.json());

app.get('/events', function(req, res) {
	sse.init(req, res);
	sse.send(events);
});

app.post('/events', function(req, res) {
	events.push(req.body);
	sse.send([req.body]);
	res.end();
});

app.listen(process.env.PORT || 4000);
