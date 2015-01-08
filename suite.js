var spawn = require('child_process').spawn,
	events = require('events'),
	fs = require('fs');

function TestSuite(folder, file, test, args, timestamp) {
	var t=this;
	t.retry = 0;
	t.fullPath = folder + file;
	t.file = file;
	t.test = null;
	t.args = [t.fullPath];
	if(test)
		t.args.unshift('test');
	if(args)
		t.args = args.concat(t.args);
	t.args.push('--scr=screenshots/' + timestamp + '/' + file + '/');
	fs.mkdirSync('screenshots/' + timestamp + '/' + file);
	this.start = function(timeout) {
		setTimeout(function() {
			t.run();
		}, timeout || 0);
	}
	this.run = function() {
		t.data = '';
		t.error = '';
		t.test = spawn('casperjs', t.args);
		t.test.stdout.on('data', function(d) {
			d = d.toString()
			t.data += d;
			t.emit('data', t.file, d);
		});
		t.test.stderr.on('data', function(d) {
			t.error += d.toString();
		});
		t.test.on('close', function (code) {
			if(code === 0) {
				t.emit('finished', t.file, t.data, timestamp);
			}
			else if (code === 101) {
				t.retry++;
				t.emit('retry', t.file, t.retry);
				setTimeout(function() {
					t.run();
				}, 500);
			}
			else
				t.emit('error', t.file, code, t.data, t.error);
		});
	}
}

TestSuite.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = TestSuite;