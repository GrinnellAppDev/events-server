var info = require('./parse-config.json');
var pathToCal = "/home/noc/cal.json";
var fs = require('fs');
var Parse = require('parse/node');

Parse.initialize(info.appId);
Parse.serverURL = info.serverURL;

var calString = fs.readFileSync(pathToCal,"UTF8").replace(/\s+|\\n|\\t/g, ' '); //check if regex is needed 
var json = JSON.parse(calString); 

var EventObject = Parse.Object.extend("Event2");
var allEventsArray = []; 


//Main loop to go over json with events
for(var i = 0; i < json.length; i++) {
    console.log("Processing Event " + (i+1) + " of " + json.length);
	var event = json[i];

    var startTime = new Date(event.startDate); 
    var endTime = new Date(event.endDate); 
    var description = event.Description; 
    var title = event.Title; 
    var eventID  = event.eventID; 
    var eventSpaceFormal = event.eventSpaceFormal;
    var eventSpace = event.eventSpace; 
    var eventType = event.eventType; 
    var organizationName = event.organizationName; 
    var requestorName = event.requestor; 
    var requestorEmail = event.requestorEmail; 

    var catering = event.Catering; 
    var cateringProvided = false; 
    if (catering) {
        cateringProvided = true; 
    }

    var event_date = String(startTime.toDateString());

    var e = new EventObject(); 
    e.set("eventid", eventID); 
    e.set("title", title); 
    e.set("location", eventSpaceFormal); 
    e.set("detailDescription", description); 
    e.set("startTime", startTime);
    e.set("endTime", endTime); 
    e.set("date", event_date);
    e.set("catering", cateringProvided); 
    e.set("requestorName", requestorName); 
    e.set("requestorEmail", requestorEmail); 
    allEventsArray.push(e);
}

console.log("All Events Processed. Deleting old event data from server...");

var query = new Parse.Query("Event2");
query.limit(1000);
query.find({
	success: function(results){
		for (var i = 0; i < results.length; i++){
			console.log("Deleting " + (i+1) + " of " + results.length);
			results[i].destroy();
		}
	}, error: function(error){
		console.log(error);
	}
});

console.log("All Events Deleted.");
console.log("Saving new events...");

Parse.Object.saveAll(allEventsArray, function(list, error) {
      if (list) {
        console.log("All events Saved."); 
      } else {
        console.log("An error occured in saving Events"); 
      }
    });

