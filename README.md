mr
==

nodejs map-reduce  
  
  CouchDB-style-like map-reduce:[CouchDB](http://wiki.apache.org/couchdb/Introduction_to_CouchDB_views) [MapReduce](http://en.wikipedia.org/wiki/MapReduce)
    
  usage: world count example  
  ```
    var fs = require('fs');
  	var worldCounter = new MapReduce({
		map: function(chunk){		
			chunk.toString().split(/\W+|\d+/).forEach(function(world){			
				world && this.emit(world.toLowerCase(), 1);
			}, this);
		},
		reduce: function(key, values){
			return this.count(values);
		},
		inputs: fs.readdirSync('./').map(fs.createReadStream),
		fork: false //should forEach input fork a cluster.worker to do map job or not
	});
	
	worldCounter.run(function(result){
		console.log(result);
	});
  ```
  more think:
  1. should do reduce during mapping rather than wait until mapping done?
  2. use nodejs ChildProcess/Cluster fork to do map/reduce job?
  3. for processing and generating large data sets with a parallel, distributed algorithm on a cluster? you may look for [Hadoop](http://hadoop.apache.org/)
