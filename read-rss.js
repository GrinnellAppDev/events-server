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


feedparser.on('readable', function () {
  // This is where the action is!
  var stream = this; // `this` is `feedparser`, which is a stream
  var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
  var item;
  var e;
  while (item = stream.read()) {
    e = new EventObject(); 
    e.set("eventid", item.guid);
    e.set("title", item.title);
    e.set("date", item.guid);
    events.push(e);
  }
});

feedparser.on('finish', function () {

  console.log("Saving " + events.length + " events"); 
  events[0].save();
  for (e of events)
  {
    e.save();
  }
});
