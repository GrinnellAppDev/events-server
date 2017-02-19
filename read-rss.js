var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed
var info = require('./parse-config.json');
var Parse = require('parse-self-host/node');
var req = request('http://25livepub.collegenet.com/calendars/alleventsfrontpage.xml')
var feedparser = new FeedParser();
var events = [];
var EventObject = Parse.Object.extend("Event2");

Parse.initialize(info.appId);
Parse.serverURL = info.serverURL;

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
  /*
  console.log("All Events Processed. Deleting old event data from server...");
  var query = new Parse.Query("Event2");
  query.limit(1000);
  query.find({
	  success: function(results){
		  for (var i = 0; i < results.length; i++){
			  console.log("Deleting " + (i+1) + " of " + results.length);
			  results[i].destroy();
		  }
	  }, 
    error: function(error){
      console.log(error);
	  }});
  */
  console.log("Saving new events...");
  Parse.Object.saveAll(events,function(list,error){
    if(list){
    console.log("All events saved");
    }
    else{
      console.log("An error occured while saving events");
      }
  });
});
