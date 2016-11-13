/* raw node ar-drone client */
var arDrone = require('ar-drone');

var client  = arDrone.createClient({
	ip: '192.168.1.1' // default
});

client.takeoff();
client.after(5000, function() {
	this.stop(); // hover in auto-pilot
	this.land();
});

// TEST
/* client.on('navdata', console.log); */