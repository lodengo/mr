mr
==

nodejs map reduce  
  
  CouchDB-style-like map-reduce:[CouchDB](http://wiki.apache.org/couchdb/Introduction_to_CouchDB_views)
    
  usage: world count example  
  ```
  	var worldCounter = new MapReduce({
		map: function(chunk){		
			chunk.toString().split(/\W+|\d+/).forEach(function(world){			
				world && this.emit(world.toLowerCase(), 1);
			}, this);
		},
		reduce: function(key, values){
			return this.count(values);
		},
		inputs: require('fs').readdirSync('./').map(fs.createReadStream)
	});
	
	worldCounter.pipe(process.stdout);
  ```
  more think:
  1. do not do reduce job until maps done, but reduce while process and rereduce?
  2. use nodejs ChildProcess/Cluster fork to do map/reduce job?
  3. for processing and generating large data sets with a parallel, distributed algorithm on a cluster? you may look for [Hadoop](http://hadoop.apache.org/)
