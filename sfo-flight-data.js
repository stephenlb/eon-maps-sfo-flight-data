// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Libs
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
var pubnub = require('pubnub');
var r      = require('request');

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Load Configuration File
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
transmit = pubnub({
  subscribe_key: 'sub-c-bd9ab0d6-6e02-11e5-8d3b-0619f8945a4f',
  publish_key: 'pub-c-923938f1-a4c1-4253-b15a-9c24087904c9'
});

//// FLIGHT
var url = "https://opensky-network.org/api/states/all?lamin=37.255829&lomin=-122.812646&lamax=38.111457&lomax=-120.892882";

setInterval(function(){

  r({
    url: url,
    method: 'get',
    json: true
  }, function(err, body, data) {

    console.log(data.states)

    var flight_data = {};
    var i = 0;

    for(var key in data.states) {

      var point = {
        latlng: []
      };

        point.latlng[0] = data.states[key][6];
        point.latlng[1] = data.states[key][5];

        point.data = data.states[key];

        flight_data[data.states[key][0]] = point;

      i++;

    }

    console.log(flight_data)

    transmit.publish({
      channel: 'sfo-flight-data',
      message: flight_data
    });

  });

}, 4000);

