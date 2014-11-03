module.exports = function(gprs) {

	function expect(reply, callback) {
		return function(err, data) {
			if (!err && data[data.length - 1] !== reply) {
				err = 'Error: expected "' + reply + '", got "' + data[data.length - 1] + '"';
			}
			callback(err);
		};
	}

	return {
		restart: function(callback) {
			gprs.togglePower(function() {
				gprs.togglePower(callback);
			});
		},
		checkGprsState: function(callback) {
			var alternate = [['AT+CGATT?'], ['+CGATT: 0', '+CGATT: 1']];
			gprs._txrx('AT+CGATT?', 1000, expect('+CGATT: 1', callback), alternate);
		},
		setBearerSetting: function(key, value, callback) {
			var message = 'AT+SAPBR=3,1,"' + key + '","' + value + '"';
			gprs._txrx(message, 1000, expect('OK', callback));
		},
		openBearer: function(callback) {
			gprs._txrx('AT+SAPBR=1,1', 10000, expect('OK', callback));
		},
		initializeHttpService: function(callback) {
			gprs._txrx('AT+HTTPINIT', 5000, expect('OK', callback));
		},
		setHttpParameter: function(key, value, callback) {
			var message = 'AT+HTTPPARA="' + key + '","' + value + '"';
			gprs._txrx(message, 1000, expect('OK', callback));
		},
		sendPostRequest: function(content, callback) {
			var str = JSON.stringify(content);
			var messages = ['AT+HTTPDATA=' + str.length + ',5000', str];
			var patiences = [2000, 5000];
			var replies = [['AT+HTTPDATA=' + str.length + ',5000', 'DOWNLOAD'], ['OK']];
			gprs._chain(messages, patiences, replies, function(err) {
				if (err) {
					return callback(err);
				}
				var alternate = [['AT+HTTPACTION=1'], ['+HTTPACTION:1,200,0']];
				'408 600 601 602 603 604'.split(' ').forEach(function(status) {
					alternate[1].push('+HTTPACTION:1,' + status + ',0');
				});
				gprs._txrx('AT+HTTPACTION=1', 32000, expect('+HTTPACTION:1,200,0', callback), alternate);
			});
		}
	};

};
