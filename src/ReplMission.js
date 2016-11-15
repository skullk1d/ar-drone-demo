// modified Mission class from ardrone-autonomy, allowing mission abort on repl input
var async = require('async')
	, fs    = require('fs')
	;

module.exports = ReplMission;
function ReplMission(client, controller, options) {
	var self = this;

	options = options || {};

	this._options   = options;
	this._client    = client;
	this._control   = controller;

	this._steps     = [];

	this._repl = null;
	this._replReceivedInput = false;

	// listen for entered data on command line
	var stdin = process.openStdin();

	stdin.addListener('data', function(d) {
		// note:  d is an object, and when converted to a string it will
		// end with a linefeed
		self._replReceivedInput = true;
	});
}

ReplMission.prototype.client = function() {
	return this._client;
}

ReplMission.prototype.control = function() {
	return this._control;
}

ReplMission.prototype.run = function(callback) {
	async.waterfall(this._steps, callback);
}

ReplMission.prototype.log = function(path) {
	var dataStream = fs.createWriteStream(path);
	var ekf = this._control._ekf;

	this._control.on('controlData', function(d) {
				var log = (d.state.x + "," +
									 d.state.y + "," +
									 d.state.z + "," +
									 d.state.yaw + "," +
									 d.state.vx + "," +
									 d.state.vy + "," +
									 d.goal.x + "," +
									 d.goal.y + "," +
									 d.goal.z + "," +
									 d.goal.yaw + "," +
									 d.error.ex + "," +
									 d.error.ey + "," +
									 d.error.ez + "," +
									 d.error.eyaw + "," +
									 d.control.ux + "," +
									 d.control.uy + "," +
									 d.control.uz + "," +
									 d.control.uyaw + "," +
									 d.last_ok + "," +
									 d.tag);

				if (d.tag > 0) {
						log = log + "," +
									ekf._s.x + "," +
									ekf._s.y + "," +
									ekf._s.yaw.toDeg() + "," +
									ekf._m.x + "," +
									ekf._m.y + "," +
									ekf._m.yaw.toDeg() + "," +
									ekf._z.x + "," +
									ekf._z.y + "," +
									ekf._z.yaw.toDeg() + "," +
									ekf._e.x + "," +
									ekf._e.y + "," +
									ekf._e.yaw.toDeg()
				} else {
						log = log + ",0,0,0,0,0,0"
				}

				log = log + "\n";

				dataStream.write(log);
		});
}

ReplMission.prototype.takeoff = function() {
	var self = this;
	return this.pushStep(function(cb) {
		self._client.takeoff(cb);
	});
}

ReplMission.prototype.land = function() {
	var self = this;
	return this.pushStep(function(cb) {
		self._client.land(cb);
	});
}

ReplMission.prototype.hover = function(delay) {
	var self = this;
	return this.pushStep(function(cb) {
		self._control.hover();
		setTimeout(cb, delay);
	});
}

ReplMission.prototype.wait = function(delay) {
	return this.pushStep(function(cb) {
		setTimeout(cb, delay);
	});
}

ReplMission.prototype.task = function(task) {
	return this.pushStep(function(cb) {
		task(cb);
	});
}

ReplMission.prototype.taskSync = function(task) {
	return this.pushStep(function(cb) {
		task();
		cb();
	});
}

ReplMission.prototype.zero = function() {
	var self = this;
	return this.pushStep(function(cb) {
		self._control.zero();
		cb();
	});
}

ReplMission.prototype.go = function(goal) {
	var self = this;
	return this.pushStep(function(cb) {
		self._control.go(goal, cb);
	});
}

ReplMission.prototype.forward = function(distance) {
	var self = this;
	return this.pushStep(function(cb) {
		self._control.forward(distance, cb);
	});
}

ReplMission.prototype.backward = function(distance) {
	var self = this;
	return this.pushStep(function(cb) {
		self._control.backward(distance, cb);
	});
}

ReplMission.prototype.left = function(distance) {
	var self = this;
	return this.pushStep(function(cb) {
		self._control.left(distance, cb);
	});
}

ReplMission.prototype.right = function(distance) {
	var self = this;
	return this.pushStep(function(cb) {
		self._control.right(distance, cb);
	});
}

ReplMission.prototype.up = function(distance) {
	var self = this;
	return this.pushStep(function(cb) {
		self._control.up(distance, cb);
	});
}

ReplMission.prototype.down = function(distance) {
	var self = this;
	return this.pushStep(function(cb) {
		self._control.down(distance, cb);
	});
}

ReplMission.prototype.cw = function(angle) {
	var self = this;
	return this.pushStep(function(cb) {
		self._control.cw(angle, cb);
	});
}

ReplMission.prototype.ccw = function(angle) {
	var self = this;
	return this.pushStep(function(cb) {
		self._control.ccw(angle, cb);
	});
}

ReplMission.prototype.altitude = function(altitude) {
	var self = this;
	return this.pushStep(function(cb) {
		self._control.altitude(altitude, cb);
	});
}

ReplMission.prototype.yaw = function(angle) {
	var self = this;
	return this.pushStep(function(cb) {
		self._control.yaw(angle,cb);
	});
}

// modified step addition
ReplMission.prototype.pushStep = function (stepFn) {
	var self = this;

	this._steps.push(function(cb) {
		if (self._replReceivedInput) {
			// repl input, abort mission (end waterfall)
			cb(new Error('Received repl input, aborting mission.'));
		} else {
			// no repl input, continue
			stepFn(cb);
		}
	});

	return this;
};

// repl
ReplMission.prototype.startRepl = function () {
	// this mission's controller & client
	var client = this._client;
	var control = this._control;
	// create repl
	var repl = this._repl = client.createRepl();
	// assign context to this controller
	// use 'control' for autonomy controller commands and 'client' for ardrone client commands
	// to give commands to drone on command line via control.<some autonomy Controller class method such as 'hover'>
	// or via client.<some ardrone-node Client class method such as 'land'>
	repl._repl.context['control'] = control;
	repl._repl.context['client'] = client;
};


