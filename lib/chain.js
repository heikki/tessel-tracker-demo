// Inspiration:
// https://github.com/justinvdm/chaingun
// https://github.com/hokaccha/node-chain-tiny
function Chain(obj) {
	var self = this;
	var stack = [];
	var index = 0;
	Object.keys(obj).forEach(function(property) {
		if (obj.hasOwnProperty(property) && property[0] !== '_') {
			this[property] = function() {
				var args = Array.prototype.slice.call(arguments);
				var fn = function(next) {
					args.push(next);
					obj[property].apply(null, args);
				};
				fn.name = property;
				stack.push(fn);
				return this;
			};
		}
	}, this);
	this.retry = function(fn, times, delay) {
		var fails = 0;
		stack.push(function retry(next) {
			fn(function(err) {
				if (err && ++fails < times) {
					return setTimeout(retry, delay, next);
				}
				fails = 0;
				next(err);
			});
		});
		return this;
	};
	this.end = function(fn) {
		var next = function() {
			var args = Array.prototype.slice.call(arguments);
			var err = args.shift() || null;
			if (err || index === stack.length) {
				if (typeof fn === 'function') {
					fn.call(self, err);
					index = 0;
				}
			} else {
				// console.log('Running -->', stack[index].name);
				stack[index].apply(self, [next]);
				index++;
			}
		};
		return function() {
			setImmediate(next);
		};
	};
}

module.exports = function(obj) {
	return new Chain(obj);
};
