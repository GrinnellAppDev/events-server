var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed
var Parse = require('parse/node');
var req = request('http://25livepub.collegenet.com/calendars/alleventsfrontpage.xml')
var feedparser = new FeedParser();
var events = [];
var EventObject = Parse.Object.extend("Event");
var S = require('string');
Parse.initialize("f8dd0d83bdc78b82378bb69e725d2f28");
Parse.serverURL = "http://localhost:8999/parse/";

/* converts Thursday, March 16, 2017, 11am&nbsp;&ndash;&nbsp;12pm"
   to "Thursday, March 16, 2017, 11:00 pm" 
*/
/*
bug right now- the first date input does not show pm. Need to fix by adding it if the second date
has pm. need to check if the full date only has one instance of 'pm', then both dates will be in pm, and one
needs to be added manually
*/

function convertDate(date){
  var split = date.split(";");
  var endTime = split[split.length-1];
  var startDate = date.split("&")[0];
  split = startDate.split(",");
  var startTime = split[split.length-1]; 
  var day = split[0] + ","+ split[1] + "," + split[2]; //Thursday, March 16, 2015
  console.log("s " +startTime);
  console.log("e " +endTime);
  startDate = day + " " + convertTime(startTime); 
  var endDate = day + " " + convertTime(endTime); 
  var startDateDate = new Date(startDate);
  var endDateDate = new Date(endDate);
  if(startDateDate.toString() == "Invalid Date"){
    //console.log("Invalid start: " + startDate);
    console.log("bad s: " + date);
  }
  else {
    console.log("gud s: " + date);
    }
  if(endDateDate.toString()=="Invalid Date"){
    //console.log("Invalid end: " + endDate);
    console.log("bad e: " + date);
  }
  else {
    console.log("gud e: " + date);
    }

  return [startDateDate,endDateDate];
}
/* helper for convertDate */

/*currently problem in this procedure, sometimes the input won't specify am or pm */
function convertTime(time){
  console.log(time);
  time = time.replace(" ",""); //removes leading space
  if (time.length <= 4) {
    var ar = time.split('');
    ar.splice(ar.length - 2,0,":00");
    time = ar.join('');
  }
  var ar = time.split('');
  ar.splice(ar.length - 2,0," ");
  console.log(ar.join(''));
  return ar.join(''); 
}

/*searchs list of <br> items for <p> tag
  returns null if not found
*/
function findDescription(description){
  var pattern = /\<\/*p\>/ig
  var d = description.filter((element) => pattern.test(element));
  return d.length == 0 ? null : d[0].replace(pattern,"");
} 

req.on('response', function (res) {
  var stream = this; // `this` is `req`, which is a stream
  if (res.statusCode !== 200) {
    this.emit('error', new Error('Bad status code'));
  }
  else {
    stream.pipe(feedparser);
  }
});
var test = "Saturday, April 22, 2017, 4&nbsp;&ndash;&nbsp;5:30pm"
convertDate(test);
/*
feedparser.on('readable', function () {
  // This is where the action is!
  var stream = this; // `this` is `feedparser`, which is a stream
  var meta = this.meta; // **NOTE** the "meta" is always available in the conteeventt of the feedparser instance
  var item;
  var description;
  var evnt;  
  while (item = stream.read()) {
    evnt = new EventObject();
    description = item.description.split("<br/>"); //description is an html element from the RSS feed
    times = convertDate(description[1]);
    evnt.set("eventid", item.guid);
    evnt.set("title", item.title);
    evnt.set("description",findDescription(description));
    evnt.set("location",description[0]); //if the RSS feed format changes, these will need to be changed
    evnt.set("startTime",times[0]);
    evnt.set("endTime",times[1]);
    events.push(evnt);
  }
});

feedparser.on('finish', function () {
  //console.log("events updated " + updateCount);
  //console.log("total events " + totalCount);
  //console.log("new events " + (totalCount-updateCount));
  //var query = new Parse.Query(EventObject).contains("eventid",item.guid);
  //var log = query.find({success:function(results) {
  //var d = test.description.split("<br/>");
  //console.log(d);
  //events[0].save();
  
  //var query = new Parse.Query(Event);
  //query.contains("eventid",
  console.log("saving " + events.length + " events");
  /*
  for (var e of events)
  {
    e.save();
  }
 
});
*/
