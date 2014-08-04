var http = require("http");
var Firebase = require('firebase')
var myRootRef = new Firebase('streetsmartdb.firebaseIO.com/crimes')
var violentRef = new Firebase('streetsmartdb.firebaseIO.com/violentcrimes')
var propertyRef = new Firebase('streetsmartdb.firebaseIO.com/propertycrimes')
var minorRef = new Firebase('streetsmartdb.firebaseIO.com/minorcrimes')
var otherRef = new Firebase('streetsmartdb.firebaseIO.com/othercrimes')

var LONGITUDE_DEGREE = 55
var LATITUDE_DEGREE = 69
var XMILES = 5
var YMILES = 5
var XDEGREES = (XMILES/LONGITUDE_DEGREE)
var YDEGREES = (YMILES/LATITUDE_DEGREE)

//111 Chestnut Street

var extra = {
  apiKey: 'AIzaSyDJ4QibCYB8Nu7JdLKBevQGNROI8dXFINw',
  formatter: null
}
var geocoder = require('node-geocoder').getGeocoder('google', 'http')

var jsonObject;

var twilio = require('twilio');
TWILIO_ACCOUNT_SID = 'AC6be2a1414ab8bd83a22db24e91db6279';
TWILIO_AUTH_TOKEN = '223bce8a531c574d21c3ca3e78f385f0';
var client = new twilio.RestClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

var userRef = new Firebase("streetsmartdb.firebaseio.com/Users")

userRef.on('child_changed', function (snapshot) {

  var assign_lat_long = function(s, w, e, n) {
    south = s;
    west = w;
    east = e;
    north = n;

    var user_phone = changedUser.phone;
    var followers = changedUser.followers;
    var contacts_phones = [];
    var j=0;
    if(!followers) {
      followers = []
    }
    for (j=0; j < followers.length; j++) {
      var contactRef = new Firebase("streetsmartdb.firebaseio.com/Users/" + followers[j])

      contactRef.on('value', function (snapshot) {
        var econtact = snapshot.val();
        var phone = econtact.phone
        contacts_phones.push(phone)
      })
    }

    var options = {
      host: 'sanfrancisco.crimespotting.org',
      path: '/crime-data?format=json&count=50&dstart=2014-07-20&bbox='+west+","+south+","+east+","+north
    };

    console.log(options.path);
    var violentcrimes = ["SIMPLE ASSAULT", "MURDER", "AGGRAVATED ASSAULT", "ARSON", "ROBBERY"]
    var propertycrimes = ["BURGLARY", "THEFT", "VEHICLE THEFT", "VANDALISM"]
    var minorcrimes = ["NARCOTICS", "ALCOHOL", "PROSTITUTION"]
    var vcrimecount = 0
    var pcrimecount = 0
    var mcrimecount = 0
    var ocrimecount = 0

    var vcrimes = []
    var pcrimes = []
    var mcrimes = []
    var ocrimes = []

    var callback = function(response) {

      var str = '';

      response.on('data', function (chunk) {

        str += chunk;

      });

      response.on('end', function () {
        var jsonObject = JSON.parse(str);
        console.log(jsonObject)
        var i=0;
        for (i=0; i < jsonObject["features"].length; i++) {
          coordinates = jsonObject["features"][i]["geometry"]["coordinates"]
          crimeType = jsonObject["features"][i]["properties"]["crime_type"]
          dateTime = jsonObject["features"][i]["properties"]["date_time"]
          description = jsonObject["features"][i]["properties"]["description"]
          crime = {"coordinates" : coordinates, "crimeType" : crimeType, "dateTime" : dateTime, "description" : description}

          myRootRef.push(crime)

          if (violentcrimes.indexOf(crimeType) != -1) {
            violentRef.push(crime);
            vcrimes.push(crime);
            vcrimecount = vcrimecount + 1
          }
          else if (propertycrimes.indexOf(crimeType) != -1) {
            propertyRef.push(crime);
            pcrimes.push(crime);
            pcrimecount = pcrimecount + 1
          }
          else if (minorcrimes.indexOf(crimeType) != -1) {
            minorRef.push(crime);
            mcrimes.push(crime);
            mcrimecount = mcrimecount + 1
          }
          else {
            otherRef.push(crime);
            ocrimes.push(crime);
            ocrimecount = ocrimecount + 1
          }
        }

        var violent = "https://streetsmartdb.firebaseio.com/Users/" + changedUser.username + "/violentcrimes";
        var property =  "https://streetsmartdb.firebaseio.com/Users/" + changedUser.username + "/propertycrimes";
        var substance =  "https://streetsmartdb.firebaseio.com/Users/" + changedUser.username + "/substancecrimes";

        var violentUserRef = new Firebase(violent);
        var propertyUserRef = new Firebase(property);
        var substanceUserRef = new Firebase(substance);

        violentUserRef.set(vcrimes);
        propertyUserRef.set(pcrimes);
        substanceUserRef.set(mcrimes);

        console.log("violent crime count is " +vcrimecount)
        console.log("property crime count is " + pcrimecount)
        console.log("minor crime count is " + mcrimecount)
        userRef.once('value', function (snapshot) {
          if (!snapshot.val().inDanger) {
            if (2*vcrimecount + pcrimecount + mcrimecount > 20) {
              console.log('IN DANGER');

              client.sms.messages.create({
                  to: user_phone,
                  from:'+13132087874',
                  body:'You have entered a high crime zone. Be careful!'
              });

              for (i=0; i < contacts_phones.length; i++) {
                client.sms.messages.create({
                    to: contacts_phones[i],
                    from:'+13132087874',
                    body:'Your friend ' + changedUser.username + ' entered a high crime zone. '
                });
              }
              userRef.child(changedUser.username).child("inDanger").set(true);

            }
            else {
              userRef.child(changedUser.username).child("inDanger").set(false);
            }
          }
        })
      });
    }

    http.request(options, callback).end();

  }

  var changedUser = snapshot.val();

  var south = 0;
  var west = 0;
  var east = 0;
  var north = 0;

  if (!changedUser.using_address) {
    var coords = changedUser.lastCoordinates;
    res = coords.split(" ");
    west = parseFloat(res[0]) - 0.09;
    south = parseFloat(res[1]) - 0.072;
    east = west + 1.8;
    north = south + 0.144;
    assign_lat_long(south, west, east, north);
  }
  else {
    var address = changedUser.address;
    var s = 0;
    var w = 0;
    var e = 0;
    var n = 0;
    geocoder.geocode(address, function(err, res) {
        console.log(res[0])
        if(err) {
          console.log(err)
          return;
        }
        try {
          s = parseFloat(res[0]["latitude"]);
          w = parseFloat(res[0]["longitude"]);
        }
        catch(err) {
          console.log(err)
          return;
        }
        e = w + 0.01;
        n = s + 0.01;
        console.log(s, w, e, n)
        assign_lat_long(s, w, e, n);
    });
  }

});

function start() {
  function onRequest(request, response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end();
  }

  http.createServer(onRequest).listen(8888);
  console.log("Server has started.");
}

exports.start = start;