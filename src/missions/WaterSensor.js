var ardrone = require('ar-drone');
var autonomy = require('ardrone-autonomy');
var EventEmitter = require('events').EventEmitter;
var ReplMission = require('../ReplMission');
var util = require('util');

function WaterSensor(clientOptions) {
	EventEmitter.call(this);

	this.name = 'Water Sensor';

	// init mission
	var client  = ardrone.createClient(clientOptions);
	var control = new autonomy.Controller(client, clientOptions);
	this.mission = new ReplMission(client, control, clientOptions);

	// TEST: simple hover delay to check repl abort functionality
	this.mission.takeoff()
		.wait(4000)
		.land();

	// define mission actions
	/*this.mission.takeoff()
		.zero()		// sets current state as reference / current position as origin
		.altitude(1)  // climb altitude (meters)
		.forward(2)
		.altitude(0.1)
		.hover(3000)  // hover
		.altitude(1)
		.cw(180)
		.forward(2)
		.cw(180)
		.land()*/
}

util.inherits(WaterSensor, EventEmitter);

WaterSensor.prototype.startMission = function () {
	var self = this;

	console.log('Starting mission ' + this.name);

	var mission = this.mission;

	// run with error handling
	mission.run(function (err, result) {
		if (err) {
			self.endMission();

			console.log("Oops, something bad happened: %s", err.message);

			self.emit('fail');
		} else {
			console.log("Mission success!");

			self.emit('success');

			process.exit(0); // exit node
		}
	});
};

 WaterSensor.prototype.endMission = function () {
	// end mission immediately
	this.mission.client().stop();
	this.mission.client().land();

	this.emit('end');
};

module.exports = WaterSensor;
