var inherits = require('util').inherits;
var stream = require('stream');
if (!stream.Readable) {
	stream = require('readable-stream');
}
var Readable = stream.Readable;

var Mapper = require('./Mapper');
var Reducer = require('./Reducer');

var MapReduce = module.exports = function MapReduce(config) {
	Readable.call(this);
	this.map = config.map;
	this.reduce = config.reduce;
	this.inputs = config.inputs;	
	this.finishedMaps = 0;
	this.mapOutput = {};	
};

inherits(MapReduce, Readable);

MapReduce.prototype._read = function() {
	var self = this;	
	self.on('done', function(result){
		self.push(JSON.stringify(result));
	});
	self.run();
};

MapReduce.prototype.run = function(){
	var self = this;
	this._runMap();
	this.on('mapDone', function(){
		self._runReduce();
	});
};

MapReduce.prototype._runMap = function(){
	var self = this;
	self.inputs.forEach(function(input){
		var mapper = new Mapper(input, self.map);
		mapper.on('data', function(k,v){			
			if(self.mapOutput[k]){
				self.mapOutput[k].push(v);
			}else{
				self.mapOutput[k] = [v];
			}	
		}).on('end', function(){			
			if(++self.finishedMaps == self.inputs.length){
				self.emit('mapDone');				
			}			
		});
		mapper.run();
	});
};

MapReduce.prototype._runReduce = function(){
	var self = this;
	var reducer = new Reducer(this.mapOutput, this.reduce);
	reducer.on('reduceDone', function(result){
		self.emit('done', result);
	});
	reducer.run();	
};




