import { Mongo } from 'meteor/mongo';

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
