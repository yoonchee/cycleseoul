import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import fs from 'fs';

class RoutesCollection extends Mongo.Collection {
  insert(route, callback) {
    const gpx = new L.GPX(route.gpx, {async: false});
    route.name = gpx.get_name();
    route.length = (gpx.get_distance() / 1000).toFixed(0);
    route.elevation = gpx.get_elevation_gain().toFixed(0);
    return super.insert(route, callback);
  }
}

export const Routes = new RoutesCollection('routes');

Meteor.methods({
  saveImage: function (blob, route, name) {
    check(name, String);
    const path = 'public/' + name;

    fs.writeFileSync(name, blob, 'binary', (error) => {
      if (error) {
        throw (new Meteor.Error(500, 'Failed to save image file.', error));
      } else {
        console.log('The file ' + name + ' was saved to ' + path);
      }
    });
  }
});
