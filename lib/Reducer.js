var inherits = require('util').inherits,
    EventEmitter = require('events').EventEmitter;

var Reducer =  module.exports = function Reducer(mapOut, reduce){
	EventEmitter.call(this);
	this.mapOut = mapOut;
	this.reduce = reduce;
	this.reduceResult = {};
};

inherits(Reducer, EventEmitter);

Reducer.prototype.run = function(){
	for(var k in this.mapOut){		
		this.reduceResult[k] = this.reduce(k, this.mapOut[k]);
	}
	this.emit('reduceDone', this.reduceResult);	
};
////////////////////////////////////////////////
Reducer.prototype.count = function(values){
	return values.length;
};

Reducer.prototype.sum = function(values){
	return values.reduce(function(a,b){return a+b;});
};

Reducer.prototype.min = function(values){
	return values.reduce(function(a,b){return b < a ? b : a;});
};

Reducer.prototype.max = function(values){
	return values.reduce(function(a,b){return b > a ? b : a;});
};

Reducer.prototype.avg = function(values){
	return values.reduce(function(a,b){return a+b;})/values.length;
};

Reducer.prototype.sumsqr = function(values){
	return values.map(function(x){return x*x;}).reduce(function(a,b){return a+b;});
};


