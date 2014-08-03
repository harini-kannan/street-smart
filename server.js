var http = require("http");
var Firebase = require('firebase')
var myRootRef = new Firebase('streetsmartdb.firebaseIO.com/crimes')
myRootRef.set("bebe")
var jsonObject;
var west = -122.415494;
var south = 37.786564;
var east = -122.405494;
var north = 37.796564;

var options = {
  host: 'sanfrancisco.crimespotting.org',
  //path: '/crime-data?format=json&count=2'
  //path: '/crime-data?format=json&count=2&bbox=-122.435494,37.796564,-122.395494,37.756564'
  //path: '/crime-data?format=json&bbox=-122.28,37.7993,-122.2682,37.8077'
  path: '/crime-data?format=json&bbox='+west+","+south+","+east+","+north
  //-122.426723,37.769304
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