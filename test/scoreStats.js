var fs = require('fs');
var util = require('util');
var Transform = require('stream').Transform;
var MapReduce = require('../index');

////////////////////////////////////////////////////////
var Liner = function Liner() {
	Transform.call(this, {
		objectMode : true
	});
	this._lastLineData = null;
};
util.inherits(Liner, Transform);
Liner.prototype._transform = function(chunk, encoding, done) {
	var data = chunk.toString();
	if (this._lastLineData) {
		data = this._lastLineData + data
	}

	var lines = data.split('\n');
	this._lastLineData = lines.splice(lines.length - 1, 1)[0];

	lines.forEach(this.push.bind(this));
	done();
}
Liner.prototype._flush = function(done) {
	if (this._lastLineData) {
		this.push(this._lastLineData);
	}
	this._lastLineData = null;
	done();
}
// //////////////////////////////////////////////////////////
Array.prototype.random = function() {
	var len = this.length;
	var idx = Math.floor(Math.random() * len);
	return this[idx];
};

var students = [ 'zhao', 'qian', 'shun', 'li', 'zhou', 'wu', 'zhen', 'wang' ];
var courses = [ 'math', 'english', 'history', 'art' ];

function genScoresFile(filename, count) {
	for (var i = 0; i < count; i++) {
		var record = {
			name : students.random(),
			course : courses.random(),
			score : Math.floor(Math.random() * 100)
		};

		fs.appendFileSync(filename, JSON.stringify(record) + '\n');
	}
}

// genScoresFile('scores2', 1000);
//////////////////////////////////////////////////////////////////////////
var inputs = [ 'scores1', 'scores2' ].map(fs.createReadStream).map(function(f){
	return f.pipe(new Liner());
});

var statsByCourse = new MapReduce({
	map : function(record) {
		record = JSON.parse(record);
		this.emit(record.course, record.score);
	},
	reduce : function(key, values) {
		return {
			min: this.min(values),
			max: this.max(values),
			avg: this.avg(values)
		};
	},
	inputs : inputs
});

var statsByStudent = new MapReduce({
	map : function(record) {
		record = JSON.parse(record);
		this.emit(record.name, record.score);
	},
	reduce : function(key, values) {
		return {
			min: this.min(values),
			max: this.max(values),
			avg: this.avg(values)
		};
	},
	inputs : inputs
});

//statsByCourse.pipe(process.stdout);
statsByStudent.pipe(process.stdout);

