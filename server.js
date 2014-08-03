var http = require("http");
var Firebase = require('firebase')
var myRootRef = new Firebase('streetsmartdb.firebaseIO.com/crimes')
myRootRef.set("bebe")
var jsonObject;

var twilio = require('twilio');
TWILIO_ACCOUNT_SID = 'AC6be2a1414ab8bd83a22db24e91db6279';
TWILIO_AUTH_TOKEN = '223bce8a531c574d21c3ca3e78f385f0';
var client = new twilio.RestClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

var userRef = new Firebase("streetsmartdb.firebaseio.com/Users")

userRef.on('child_changed', function (snapshot) {
  var changedUser = snapshot.val();
  var coords = changedUser.lastCoordinates;
  var res = coords.split(" ");
  var west = parseFloat(res[0]);
  var south = parseFloat(res[1]);
  var east = west + 0.01;
  var north = south + 0.01;
  //var user_phone = changedUser.phone;

  var options = {
    host: 'sanfrancisco.crimespotting.org',
    path: '/crime-data?format=json&bbox='+west+","+south+","+east+","+north
  };


  var callback = function(response) {

    // note: I think you can get address as well. look into it later

    var str = '';

    response.on('data', function (chunk) {

      str += chunk;

    });

    response.on('end', function () {
      var jsonObject = JSON.parse(str);
      var i=0;
      for (i=0; i < jsonObject["features"].length; i++) {
        coordinates = jsonObject["features"][i]["geometry"]["coordinates"]
        crimeType = jsonObject["features"][i]["properties"]["crime_type"]
        dateTime = jsonObject["features"][i]["properties"]["date_time"]
        description = jsonObject["features"][i]["properties"]["description"]
        crime = {"coordinates" : coordinates, "crimeType" : crimeType, "dateTime" : dateTime, "description" : description}

        myRootRef.push(crime)
      }

      if (jsonObject["features"].length > 5) {

        console.log('IN DANGER');

        //twilio

        client.sms.messages.create({
            to:'+14088343727',
            from:'+13132087874',
            body:'You have entered a high crime zone'
        });

        userRef.child(changedUser.username).child("inDanger").set(true);
      }
    });
  }


  http.request(options, callback).end();

/*
  if (result) {
    userRef.child(changedUser.username).child("inDanger").set(true);
    console.log('Updated coords is ' + coords);
  } */

});




function start() {
  function onRequest(request, response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World moo");
    //response.write(JSON.stringify(jsonObject["features"]));
    response.end();
  }

  http.createServer(onRequest).listen(8888);
  //http.request(options, callback).end();
  console.log("Server has started.");
}

exports.start = start;