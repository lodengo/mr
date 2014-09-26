var cluster = require('cluster');
//////////////////////////////////////////////////////////////////
var MapOutput = module.exports = function MapOutput(){
	this.store = {}; 
};

MapOutput.prototype.push = function(k, v){	
	if(this.store[k]){
		this.store[k].push(v);
	}else{
		this.store[k] = [v];
	}	
};

MapOutput.prototype.combine = function(mapOutput){
	for(var k in mapOutput.store){
		if(this.store[k]){
			this.store[k] = this.store[k].concat(mapOutput.store[k]);
		}else{
			this.store[k] = mapOutput.store[k];
		}	
	}
};

MapOutput.prototype.group = function(){
	return this.store;
};
/////////////////////////////////////////////////////////////////
var Mapper = module.exports = function Mapper(input, map) {
	this.input = input;
	this.map = map;
	this.mapOutput = new MapOutput();
};

Mapper.prototype.emit = function(k, v) {
	this.mapOutput.push(k,v);
};

Mapper.prototype.run = function(cb) {
	var self = this;	
	this.input.on('data', this.map.bind(this));
	this.input.on('end', function() {		
		cb(self.mapOutput);
	});
};
//////////////////////////////////////////////////////////////
var Reducer =  module.exports = function Reducer(mapOut, reduce){	
	this.mapOut = mapOut.group();
	this.reduce = reduce;	
};

Reducer.prototype.run = function(cb){
	var reduceResult = {};
	for(var k in this.mapOut){		
		reduceResult[k] = this.reduce(k, this.mapOut[k]);
	}
	cb(reduceResult);
};
//////////////////////////////////////////////////////////////
var MapReduce = module.exports = function MapReduce(config) {	
	this.map = config.map;
	this.reduce = config.reduce;
	this.inputs = config.inputs;
	this.fork = config.fork;
};

MapReduce.prototype.run = function(cb) {	
	var self = this;
	if (this.fork) {
		this._runMapCluster(this.inputs, this.map, function(mapOutput) {
			self._runReduce(mapOutput, self.reduce, cb);
		});
	} else {
		this._runMap(this.inputs, this.map, function(mapOutput) {
			self._runReduce(mapOutput, self.reduce, cb);
		});
	}
};

MapReduce.prototype._runMap = function(inputs, map, cb) {
	var self = this;	
	var finishedInputs = 0;
	var mapOutput = new MapOutput();
	inputs.forEach(function(input) {
		var mapper = new Mapper(input, map);
		mapper.run(function(out){
			mapOutput.combine(out);
			if (++finishedInputs == inputs.length) {
				cb(mapOutput);
			}
		});		
	});
};

MapReduce.prototype._runMapCluster = function(inputs, map, cb) {	
	if (cluster.isMaster) {// master		
		var mapWorkers = inputs.length; //require('os').cpus().length;
				
		var finishedInputs = 0;
		var mapOutput = new MapOutput();
		for (var i = 0; i < mapWorkers; i++) {
			var mapWorker = cluster.fork();
			mapWorker.on('message', function(msg) {
				if(msg.type == 'mapDone'){
					mapOutput.combine(msg.mapOut);
					if (++finishedInputs == inputs.length) {
						cb(mapOutput);
					}
				}
			});
		}
	} else {// map worker		
		var input = inputs[cluster.worker.id - 1];
		var mapper = new Mapper(input, map);
		mapper.run(function(out){
			process.send({type:'mapDone', mapOut:out});		
			cluster.worker.destroy();
		});		
	}
};

MapReduce.prototype._runReduce = function(mapOutput, reduce, cb) {
	var reducer = new Reducer(mapOutput, reduce);
	reducer.run(cb);
};
/////////////////////////////////////////////////////////////////
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
