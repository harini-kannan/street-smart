var http = require("http");
var Firebase = require('firebase')
var myRootRef = new Firebase('streetsmartdb.firebaseIO.com/crimes')
myRootRef.set("bebe")
var jsonObject;

var options = {
  host: 'sanfrancisco.crimespotting.org',
  path: '/crime-data?format=json&count=2'
};

callback = function(response) {
  var str = '';

  // note: I think you can get address as well. look into it later

  response.on('data', function (chunk) {
    jsonObject = JSON.parse(chunk);
    var i=0;
    for (i=0; i < jsonObject["features"].length; i++) {
      coordinates = jsonObject["features"][i]["geometry"]["coordinates"]
      crimeType = jsonObject["features"][i]["properties"]["crime_type"]
      dateTime = jsonObject["features"][i]["properties"]["date_time"]
      description = jsonObject["features"][i]["properties"]["description"]
      crime = {"coordinates" : coordinates, "crimeType" : crimeType, "dateTime" : dateTime, "description" : description}

      myRootRef.push(crime)
    }
  });

}

function start() {
  function onRequest(request, response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World moo");
    response.write(JSON.stringify(jsonObject["features"]))
    response.end();
  }

  http.createServer(onRequest).listen(8888);
  http.request(options, callback).end();
  console.log("Server has started.");
}

exports.start = start;