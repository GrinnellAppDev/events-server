var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed
var Parse = require('parse/node');
var req = request('http://25livepub.collegenet.com/calendars/alleventsfrontpage.xml')
var feedparser = new FeedParser();
var events = [];
var EventObject = Parse.Object.extend("Event");

var updateCount = 0;
var totalCount = 0;
 
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


/*
removes duplicates
searches database for events that have the same eventid
*/
function removeDuplicates(){
  console.log("here: " + events.length);
  if (events.length == 0) {
    console.log("events updated " + updateCount);
    console.log("total saved" + total);
    console.log("new events " + (total-updateCount));
    return;
  } 
   
  var evnt = events.pop();
  var query = new Parse.Query(EventObject);
  query.equalTo("eventid",evnt.get("eventid"));
  query.find()
    .then(outDatedPosts => {
     updateCount +=1;
     return Parse.Object.destroyAll(outDatedPosts);
  }).then(()=> {
     console.log(evnt.date);
     return evnt.save();
  },
  error => {
  console.log(error);
  console.log("destroyAll error")
  })
  .then( e=> {
     console.log("here");
     removeDuplicates()
  },
  error =>{
    console.log(error); 
    console.log("save error");
  });
}


  /*
  var log = query.find({
    success: results => {
                          console.log("results length "+results.length);
                          for (var result of results) result.destroy();
                          updateCount +=1;
                         },
    error:   error   => { console.log(error); }
    
});
*/
feedparser.on('finish', ()=> {
  console.log("saving " + events.length + " events");
  var total = events.length; 
  var evnt = events.pop();
  console.log("before save");
  console.log(evnt.get("startTime"));
  console.log(evnt.get("endTime"));
  evnt.save()
  .then(function(e) 
  {
    console.log("should happen last " + e);
  }, function(error) {
      console.log(error)
  });
  console.log("did it.");
                  
});
  
