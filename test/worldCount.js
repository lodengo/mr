var MapReduce = require('../index');
var fs = require('fs');

var inputs = fs.readdirSync('./').map(fs.createReadStream);

var worldCounter = new MapReduce({
	map: function(chunk){		
		chunk.toString().split(/\W+|\d+/).forEach(function(world){			
			world && this.emit(world.toLowerCase(), 1);
		}, this);
	},
	reduce: function(key, values){
		return this.count(values);
	},
	inputs: inputs
});

worldCounter.pipe(process.stdout);






