var http = require("http");
var Firebase = require('firebase')
var myRootRef = new Firebase('streetsmartdb.firebaseIO.com/crimes')
myRootRef.set("bebe")


var options = {
  host: 'sanfrancisco.crimespotting.org',
  path: '/crime-data?format=tsv&count=1'
};

callback = function(response) {
  var str = '';
  console.log(response)

/*
  response.on('data', function (chunk) {
    str += chunk;
  });

  response.on('end', function () {
    console.log(str);
  }); */
}

function start() {
  function onRequest(request, response) {
    console.log("Request received.");
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World moo");
    response.end();
  }

  http.createServer(onRequest).listen(8888);
  http.request(options, callback).end();
  console.log("Server has started.");
}

exports.start = start;