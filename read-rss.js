var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed
var Parse = require('parse/node');
var req = request('http://25livepub.collegenet.com/calendars/alleventsfrontpage.xml')
var feedparser = new FeedParser();
var events = [];
var EventObject = Parse.Object.extend("Event");

Parse.initialize("f8dd0d83bdc78b82378bb69e725d2f28");
Parse.serverURL = "http://localhost:8999/parse/";

/* converts Thursday, March 16, 2017, 11am&nbsp;&ndash;&nbsp;12pm"
   to "Thursday, March 16, 2017, 11:00 pm" 
*/

function convertDate(date){
  var split = date.split(";");
  var endTime = split[split.length-1];
  var startDate = date.split("&")[0];
  split = startDate.split(",");
  var startTime = split[split.length-1]; 
  var day = split[0] + ","+ split[1] + "," + split[2]; //Thursday, March 16, 2015
  startDate = day + " " + convertTime(startTime); 
  var endDate = day + " " + convertTime(endTime); 
  return [new Date(startDate),new Date(endDate)];
}
/* helper for convertDate */
function convertTime(time){
  time = time.replace(" ",""); //removes leading space
  if (time.length <= 4) {
    var ar = time.split('');
    ar.splice(ar.length - 2,0,":00");
    time = ar.join('');
  }
  var ar = time.split('');
  ar.splice(ar.length - 2,0," ");
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

feedparser.on('readable', function () {
  var stream = this; // `this` is `feedparser`, which is a stream
  var meta = this.meta; // **NOTE** the "meta" is always available 
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
  //
  //
  //
  //
  //var log = query.find({success:function(results) {
  //console.log(d);
  //events[0].save();
  
  //var query = new Parse.Query(Event);
  //query.contains("eventid",
  var updateCount = 0;
  var totalCount = 0;
  var query; 
  var log;
  console.log("saving " + events.length + " events");
  //e.save();
  for (var evnt of events)
  {
    query = new Parse.Query(EventObject).contains("eventid",evnt.get("eventid")); 
    log = query.find({
        success: results => {
                              for (var result of results) result.destroy();
                              updateCount +=1;
                            },
        error:   error   => { console.log(error); }
        });
    evnt.save();
    totalCount +=1;
  }
  console.log("events updated " + updateCount);
  console.log("total events " + totalCount);
  console.log("new events " + (totalCount-updateCount));
});
