var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed
var Parse = require('parse/node');
var req = request('http://25livepub.collegenet.com/calendars/alleventsfrontpage.xml')
var feedparser = new FeedParser();
var events = [];
var EventObject = Parse.Object.extend("Event");

Parse.initialize("f8dd0d83bdc78b82378bb69e725d2f28");
Parse.serverURL = "http://localhost:8999/parse/";

req.on('response', function (res) {
  var stream = this; // `this` is `req`, which is a stream
  if (res.statusCode !== 200) {
    this.emit('error', new Error('Bad status code'));
  }
  else {
    stream.pipe(feedparser);
  }
});

//var test;
feedparser.on('readable', function () {
  // This is where the action is!
  var stream = this; // `this` is `feedparser`, which is a stream
  var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
  var item;
  var e;
  var description;
  while (item = stream.read()) {
    description = item.description.split("<br/>"); //description is an html element from the RSS feed
    e = new EventObject(); 
    e.set("eventid", item.guid);
    e.set("title", item.title);
    e.set("location",description[0]); //if the RSS feed format changes, these will need to be changed
    e.set("date", description[1]);
    events.push(e);
    
   // test = item;
  }
});

feedparser.on('finish', function () {
  //var d = test.description.split("<br/>");
  //console.log(d);
  console.log("Saving " + events.length + " events"); 
  //events[0].save();
  for (e of events)
  {
    e.save();
  }
});
