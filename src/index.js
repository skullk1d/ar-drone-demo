// entry point
var arDrone = require('ar-drone');

// import mission(s) we wish to run
// cycle this value to choose mission from missions (here via source or in config)
// "$ npm run start" to run
var ACTIVE_MISSION = 'WaterSensor'; // point to mission file in missions folder

// instantiate chosen mission
var ActiveMission = require('./missions/' + ACTIVE_MISSION);
var activeMission = new ActiveMission();

// listen for entered data on command line
var stdin = process.openStdin();

stdin.addListener('data', function(d) {
	// NOTE: d is an object, and when converted to a string it will end with a linefeed
	// on any input, end mission and hover -- await repl commands
	activeMission.endMission();
});

// begin programmed sequence
activeMission.startMission();

// repl (active command line while mission is running)
// use to land or steer drone immediately, which overrides running mission
// context scope is "client"
// (simple run any client command "takeoff()" "land()" etc)
// NOTE: ar-drone logs client to console on takeoff every time
// NOTE: repl remains open on mission override
activeMission.client.createRepl();
