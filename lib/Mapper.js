var EventEmitter = require('events').EventEmitter;

var Mapper = module.exports = function Mapper(input, map){
	this.input = input;
	this.map = map;
	this.ee = new EventEmitter();		
};

Mapper.prototype.emit = function(k, v){	
	this.ee.emit('data', k, v);
};

Mapper.prototype.on = function(event, listener){
	return this.ee.on(event, listener);
};

Mapper.prototype.run = function(){
	var self = this;
	this.input.on('data', this.map.bind(this));
	this.input.on('end', function(){
		self.ee.emit('end');
	});
};

