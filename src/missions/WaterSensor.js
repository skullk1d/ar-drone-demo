var ardrone = require('ar-drone');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function WaterSensor(clientOptions) {
	EventEmitter.call(this);

	this.name = 'Water Sensor';

	// init mission
	this.client = ardrone.createClient(clientOptions);
}

util.inherits(WaterSensor, EventEmitter);

WaterSensor.prototype.startMission = function () {
	console.log('Starting mission ' + this.name);

	var client = this.client;

	// mission sequence here
	client.ftrim();
	client.takeoff();
 	client.after(6000, function() {
 		this.up(0.5);
 	});
 	client.after(2000, function() {
 		this.stop(); // hover in auto-pilot
 		this.land();
 	});
};

 WaterSensor.prototype.endMission = function () {
	// end mission immediately
	this.client.stop();

	this.emit('end');
};

module.exports = WaterSensor;
