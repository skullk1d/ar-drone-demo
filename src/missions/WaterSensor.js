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
	var SPEED = 0.05;

	var tTakeoff = 5000;
	var tRotate = (180 / Math.PI / SPEED); // v = d/t = rads/t => t = rads/v

	client.ftrim();
	client.takeoff();
	client.after(tTakeoff, function() { // ascend
		this.up(SPEED);
	}).after(500, function() { // hover then approach water
		this.stop();
		this.forward(SPEED);
	}).after(1000, function() { // hover then descend
		this.stop();
		this.down(SPEED);
	}).after(500, function() { // hover and (activate sensor over water?)
		this.stop();
	}).after(2000, function() { // after 2 sec, ascend
		this.up(SPEED);
	}).after(500, function() { // turn around 180 deg
		this.stop();
		this.clockwise(SPEED);
	}).after(tRotate, function() { // hover and go forward to starting point
		this.stop();
		this.forward(SPEED);
	}).after(1000, function() { // turn around 180 deg
		this.stop();
		this.clockwise(SPEED);
	}).after(tRotate, function() { // hover and land
		this.stop();
		this.land();
	});
};

 WaterSensor.prototype.endMission = function () {
	// end mission immediately
	this.client.stop();

	this.emit('end');
};

module.exports = WaterSensor;
