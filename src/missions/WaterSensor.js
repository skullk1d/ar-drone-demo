var ardrone = require('ar-drone');
var autonomy = require('ardrone-autonomy');
var EventEmitter = require('events').EventEmitter;
var ReplMission = require('../ReplMission');
var util = require('util');

function WaterSensor(clientOptions) {
	this.name = 'Water Sensor';

	// init mission
	var client  = ardrone.createClient(clientOptions);
	var control = new autonomy.Controller(client, clientOptions);
	this.mission = new ReplMission(client, control, clientOptions);

	// TEST: simple hover delay to check repl abort functionality
	this.mission.takeoff()
		.zero()		// sets current state as reference / current position as origin
		.altitude(1)  // climb altitude (meters)
		.hover(4000)
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

	// run with error handling
	this.mission.run(function (err, result) {
		if (err) {
			mission.client().stop();
			mission.client().land();

			console.log("Oops, something bad happened: %s", err.message);

			self.emit('fail');
		} else {
			console.log("Mission success!");

			self.emit('success');

			process.exit(0); // exit node
		}
	});
};

/* WaterSensor.prototype.endMission = function (data) {
	// end mission immediately

	// emit with ctrl data from repl, if needed
	this.emit('end', data);
}; */

module.exports = WaterSensor;
