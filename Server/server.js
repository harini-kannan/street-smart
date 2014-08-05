/*******************************************************************************
 * MODULES
 ******************************************************************************/
var Geocoder = require('node-geocoder');
var Http = require('http');
var Firebase = require('firebase');
var Twilio = require('twilio');
var _ = require('underscore')

/*******************************************************************************
 * CONSTANTS
 ******************************************************************************/
//Geography
var LONGITUDE_DEGREE = 55;
var LATITUDE_DEGREE = 69;
var XMILES = 5;
var YMILES = 5;
var XDEGREES = (XMILES/LONGITUDE_DEGREE);
var YDEGREES = (YMILES/LATITUDE_DEGREE);
//Twilio
var TWILIO_ACCOUNT_SID = 'Your account here';
var TWILIO_AUTH_TOKEN = 'Your token here';
// TODO add Firebase secret key so our DB isn't open to public
var VIOLENT_CRIMES = {
  "SIMPLE ASSAULT": true,
  "MURDER": true,
  "AGGRAVATED ASSAULT": true,
  "ARSON": true, 
  "ROBBERY": true
};

var PROPERTY_CRIMES = {
  "BURGLARY": true,
  "THEFT": true,
  "VEHICLE THEFT": true,
  "VANDALISM": true
};

var MINOR_CRIMES = {
  "NARCOTICS": true,
  "ALCOHOL": true,
  "PROSTITUTION": true
};

/*******************************************************************************
 * INSTANCE VARIABLES
 ******************************************************************************/
//Firebase 
var minorRef = new Firebase('streetsmartdb.firebaseIO.com/minorcrimes');
var crimesRef = new Firebase('streetsmartdb.firebaseIO.com/crimes');
var otherRef = new Firebase('streetsmartdb.firebaseIO.com/othercrimes');
var propertyRef = new Firebase('streetsmartdb.firebaseIO.com/propertycrimes');
var userRef = new Firebase("streetsmartdb.firebaseio.com/Users");
var violentRef = new Firebase('streetsmartdb.firebaseIO.com/violentcrimes');
//Geography
var geocoder = Geocoder.getGeocoder('google', 'http');
//Twilio
var client = new Twilio.RestClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

/*******************************************************************************
 * HELPER FUNCTIONS
 ******************************************************************************/

/**
 * @param {object} user User object conforming to Firebase schema
 *
 * Contacts followers of user
 */
function contactFollowers(user) {
  var followers = user.followers || [];
  followers.forEach(function(follower) {
     // TODO store followers as phone numbers (or device UUIDs if push notifications)
    //   so we don't have to re-query DB to get contact info for each follower 
    var contactRef = new Firebase("streetsmartdb.firebaseio.com/Users/" + follower);
    contactRef.once('value', function (snapshot) {
      var phone = snapshot.val().phone;
      if (phone) {
        client.sms.messages.create({
          to: phone,
          from:'+13132087874',
          body:'Your friend ' + user.username + ' entered a high crime zone.'
        });
      }
    });
  });
}

/**
 * @param {object} user User object conforming to Firebase schema
 * 
 * Contacts user if phone number entered, logs otherwise
 */
function contactUser(user) {
  if (user.phone) {
    client.sms.messages.create({
      to: user.phone,
      from:'+13132087874',
      body:'Your friend ' + user.username + ' entered a high crime zone.'
    });
  }
  else {
    console.log('User phone number not entered');
  }
}

/**
 * @param {object} user User object conforming to Firebase schema
 * @param {callback} callback function taking coords object as param
 *
 * @return {object} Coordinate object with .north, .south, .east, .west
 *
 * Gets coordinates from user. 
 */
function getLastCoords(user, callback) {
  var coords = {};
  var lastCoords = changedUser.lastCoordinates || ''
  if (!changedUser.using_address) {
    // Lots of places this could crash so let's be paranoid
    try {
      lastCoords = lastCoords.split(" ");
      // TODO figure out what these numbers even are.
      coords.west = parseFloat(lastCoords[0]) - 0.09;
      coords.south = parseFloat(lastCoords[1]) - 0.072;
      coords.east = west + 1.8;
      coords.north = south + 0.144;
    }
    catch(err) {
      console.log(err);
      callback();
      return;
    }
    callback(coords);
  }
  else {
    geocoder.geocode(address, function(err, res) {
      if(err) {
        console.log(err)
        callback();
        return;
      }
      else {
        try {
          coords.south = parseFloat(res[0]["latitude"]);
          coords.west = parseFloat(res[0]["longitude"]);
          coords.east = coords.west + 0.01;
          coords.north = coords.south + 0.01;
        }
        catch(err) {
          console.log(err)
          callback();
          return;
        }
        callback(coords);
      }
    });
  }
}

/**
 * @param {httpResponse} response response from http.request
 * @param {function(object)} next callback that takes JSON response
 */
function httpCallback(response, next) {
  var str = '';
  response.on('data', function(chunk) {
    str += chunk;
  })
  response.on('end', function() {
    var jsonObject = {};
    try {
      jsonObject = JSON.parse(str);
    }
    catch(err) {
      console.error(err);
    }
    next(jsonObject);
  });
}

/**
 * @param {object} Response from Crimespotters API
 *
 * @return {array<object>} Array of returned crimes
 */
function getCrimes(response) {
  var crimes = response.features || [];
  return crimes.map(function(feature) {
    if (!feature.geometry || !feature.properties) {
      return null;
    }
    return {
      coordinates: feature.geometry.coordinates,
      crimeType: feature.properties.crime_type,
      dateTime: feature.properties.date_time,
      description: feature.properties.description
    };
  }).filter(function(crime) {
    return crime !== null;
  });
}

/**
 * @param {array<object>} Array of crime objects
 *
 * @return {array<object>} Array of returned crimes
 *
 * Parses crimes into violent, property, minor, and other.
 *   Returns as single object with attributes corresponding to each crime type.
 *   Also pushes each crime to the appropriate Firebase crime table.
 */
function splitCrimes(crimes) {
  var crimeTypes = {
    violent: [],
    property: [],
    minor: [],
    other: []
  };
  crimes.forEach(function(crime) {
    crimeRef.push(crime);
    var crimeType = crime.crimeType;
    if (!crimeType) {
      return;
    }
    if (VIOLENT_CRIMES[crimeType]) {
      crimeTypes.violent.push(crime);
      violentRef.push(crime);
    }
    else if (PROPERTY_CRIMES[crimeType]) {
      crimeTypes.property.push(crime);
      propertyRef.push(crime);
    }
    else if (MINOR_CRIMES[crimeType]) {
      crimeTypes.minor.push(crime);
      minorRef.push(crime);
    }
    else {
      crimeTypes.other.push(crime);
    }
  });
  return crimeTypes;
}

function getOptions(coords) {
  var options = {
    host: 'sanfrancisco.crimespotting.org',
    path: '/crime-data?format=json&count=50&dstart=2014-07-20&bbox=' + 
      coords.west + "," + coords.south + "," + coords.east + "," + coords.north
  };
}

function refGen(user, query) {
  return "https://streetsmartdb.firebaseio.com/Users/" + user + "/" + query;
}

function inDanger(crimeTypes) {
  return 2*crimeTypes.violent.length + crimeTypes.property.length + crimeTypes.minor.length > 20;
}

/*******************************************************************************
 * MAIN FUNCTION
 ******************************************************************************/
function start() {
  function onRequest(request, response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end();
  }

  http.createServer(onRequest).listen(8888);
  console.log("Server has started.");

  userRef.on('child_changed', function (snapshot) {
    var user = snapshot.val();
    
    getLastCoords(user, function(coords) {
      var options = getOptions(coords);
      var callback = function(data) {
        httpCallback(data, function(response) {
          var crimes = getCrimes(response);
          var crimeTypes = splitCrimes(crimes);

          var violentUserRef = new Firebase(refGen(changedUser.username, 'violentcrimes'));
          var propertyUserRef = new Firebase(refGen(changedUser.username, 'propertycrimes'));
          var substanceUserRef = new Firebase(refGen(changedUser.username, 'substancecrimes'));

          violentUserRef.set(crimeTypes.vcrimes);
          propertyUserRef.set(crimeTypes.pcrimes);
          substanceUserRef.set(crimeTypes.mcrimes);

          userRef.once('value', function (secondSnapshot) {
            if (!secondSnapshot.val().inDanger) {
              if (inDanger(crimeTypes)) {
                console.log('IN DANGER');
                contactUser(user);
                contactFollowers(user);
                userRef.child(user.username).child("inDanger").set(true);
              }
            }
            else {
              if(!inDanger(crimeTypes)) {
                userRef.child(user.username).child("inDanger").set(false);
              }
            }
          })
        })
      };
      http.request(options, callback).end();
    });
  });
}

exports.start = start;
