// entry point
var arDrone = require('ar-drone');
var autonomy = require('ardrone-autonomy');

// import mission(s) we wish to run
// cycle this value to choose mission from missions (here via source or in config)
// "$ npm run start" to run
var ACTIVE_MISSION = 'WaterSensor';

// instantiate chosen mission
var ActiveMission = require('./missions/' + ACTIVE_MISSION);
var activeMission = new ActiveMission();

// begin programmed sequence
activeMission.startMission();

// repl (active command line while mission is running)
// use to land or steer drone immediately in emergency
activeMission.mission.startRepl();
