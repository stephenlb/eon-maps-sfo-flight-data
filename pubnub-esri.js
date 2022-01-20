window.eon = window.eon || {};
window.eon.m = {
  create: function (options) {

    options.debug = options.debug || false;

    var clog = function(s, o, e) {

      if (options.debug) {
        if (e) {
          console.log('EON-MAP:', s, o, e);
        } else {
          console.log('EON-MAP:', s, o);
        }
      }
    };

    if(typeof(options.pubnub) == "undefined" && console) {
      return console.error("PubNub not found. See http://www.pubnub.com/docs/javascript/javascript-sdk.html#_where_do_i_get_the_code");
    }

    if(typeof(options.mbToken) == "undefined" && console) {
      return console.error("Please supply a Mapbox Token: https://www.mapbox.com/help/create-api-access-token/");
    }

    if(typeof(options.mbId) == "undefined" && console) {
      return console.error("Please supply a Mapbox Map ID: https://www.mapbox.com/help/define-map-id/");
    }

    if(typeof(L) == "undefined" && console) {
      return console.error("You need to include the Mapbox Javascript library.");
    }

    var self = this;

    var geo = {
      bearing : function (lat1,lng1,lat2,lng2) {
        var dLon = this._toRad(lng2-lng1);
        var y = Math.sin(dLon) * Math.cos(this._toRad(lat2));
        var x = Math.cos(this._toRad(lat1))*Math.sin(this._toRad(lat2)) - Math.sin(this._toRad(lat1))*Math.cos(this._toRad(lat2))*Math.cos(dLon);
        var brng = this._toDeg(Math.atan2(y, x));
        return ((brng + 360) % 360);
      },
      _toRad : function(deg) {
         return deg * Math.PI / 180;
      },
      _toDeg : function(rad) {
        return rad * 180 / Math.PI;
      }
    };

    self.pubnub = options.pubnub || PubNub || false;

    if(!self.pubnub) {
      error = "PubNub not found. See http://www.pubnub.com/docs/javascript/javascript-sdk.html#_where_do_i_get_the_code";
    }

    options.id = options.id || false;
    options.channels = options.channels || false;
    options.channelGroups = options.channelGroups || false;
    options.transform = options.transform || function(m){return m};
    options.history = options.history || false;
    options.message = options.message || function(){};
    options.connect = options.connect || function(){};
    options.rotate = options.rotate || false;
    options.marker = options.marker || L.marker;
    options.options = options.options || {};

    clog('Options', options);

    self.markers = {};

    if(!options.id) {
      return console.error('You need to set an ID for your Mapbox element.');
    }

    self.map = L.map(options.id).setView([37.773972, 	-122.431297], 10);

    L.esri.basemapLayer("Oceans").addTo(self.map);

    self.refreshRate = options.refreshRate || 10;

    self.lastUpdates = {};

    self.update = function (seed, animate) {

      clog('Markers:', 'Updating', seed);

      for(var key in seed) {

        if(seed.hasOwnProperty(key)) {

          if(!self.markers[key]) {

            var data = seed[key].data || {};

            self.markers[key]= options.marker(seed[key].latlng, seed[key].data);
            self.markers[key].addTo(self.map);

          } else {

            if(animate) {
              clog('Markers:', 'Animating');
              self.animate(key, seed[key].latlng);
            } else {
              clog('Markers:', 'Updating');
              self.updateMarker(key, seed[key].latlng);
            }

          }

        }

        self.lastUpdates[key] = new Date().getTime();

      }

    };

    var isNumber = function(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    };

    self.updateMarker = function (index, point) {

      if(point && point.length > 1) {

        if(isNumber(point[0]) && isNumber(point[1])) {
          self.markers[index].setLatLng(point);
        }

      }

    };

    self.animations = {};

    self.animate = function (index, destination) {

      var startlatlng = self.markers[index].getLatLng();

      var animation = {
        start: startlatlng,
        dest: destination,
        time: new Date().getTime(),
        length: new Date().getTime() - (self.lastUpdates[index] || new Date().getTime())
      };

      clog('Animation:', animation);

      self.animations[index] = animation;

      clog('Animations:', self.animations);

    };

    self.refresh = function() {

      var s = {};

      for(var index in self.markers) {

        if(self.markers.hasOwnProperty(index) && typeof self.animations[index] !== 'undefined') {

          s.position = self.animations[index].start;

          // number of steps in this animation
          s.maxSteps = Math.round(self.animations[index].length / self.refreshRate)

          // time that has passed since that message
          s.timeSince = new Date().getTime() - self.animations[index].time;
          s.numSteps = Math.round(s.timeSince / self.refreshRate); // if this is 1 or 0 it fucks up steps

          if(s.numSteps <= s.maxSteps) {

            // probably has to do with this math
            s.latDistance = self.animations[index].dest[0] - s.position.lat;
            s.lngDistance = self.animations[index].dest[1] - s.position.lng;

            s.lat = s.position.lat + ((s.latDistance / s.maxSteps) * s.numSteps);
            s.lng = s.position.lng + ((s.lngDistance / s.maxSteps) * s.numSteps);

            s.nextStep = [s.lat, s.lng];

            self.updateMarker(index, s.nextStep);

            if(options.rotate) {
              self.markers[index].options.angle = geo.bearing(s.position.lat, s.position.lng, s.lat, s.lng);
            }

          }

        }

        index++;

      }

    };

    self.pubnub.addListener({
      status: function(statusEvent) {
        if (statusEvent.category === "PNConnectedCategory") {
          options.connect();
        }
      },
      message: function(m) {

        if(options.channels.indexOf(m.channel) > -1) {

          clog('PubNub:', 'Got Message');

          message = options.transform(m.message);

          options.message(message, m.timetoken, m.channel);
          self.update(message, true);
        }

      }
    });

    self.loadHistory = function() {

      for(var i in options.channels) {

        self.pubnub.history({
          channel: options.channels[i],
          includeTimetoken: true,
          count: 10
        }, function(status, payload) {

          payload.messages = payload.messages.reverse();

          for(var a in payload.messages) {
            payload.messages[a].entry = options.transform(payload.messages[a].entry);
            options.message(payload.messages[a].entry, payload.messages[a].timetoken, options.channels);
            self.update(payload.messages[a].entry, true);
          }

        });

      }

    }

    if(options.channelGroups) {

      // assuming an intialized PubNub instance already exists
      pubnub.channelGroups.listChannels({
          channelGroup: options.channelGroups
        }, function (status, response) {

          if (status.error) {
            clog("operation failed w/ error:", status);
            return;
          }

          options.channels = response.channels;

          if(options.history) {
            self.loadHistory();
          }

          self.pubnub.subscribe({
            channelGroups: options.channelGroups
          });

        }
      );

    } else {

      if(options.history) {
        self.loadHistory();
      }

      self.pubnub.subscribe({
        channels: options.channels
      });

    }

    self.refresh();
    setInterval(self.refresh, self.refreshRate);

    return self.map;

  }
};
window.eon.map = function(o) {
  return new window.eon.m.create(o);
};
