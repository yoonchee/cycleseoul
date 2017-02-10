import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Routes = new Mongo.Collection('routes');

if (Meteor.isServer) {
  Meteor.publish('routes', function routesPublication() {
    return Routes.find();
  });
}

Meteor.methods({
  'routes.insert'(gpx, name, length, elevation, description) {
    check(gpx, String);
    check(name, String);
    check(description, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Routes.insert({
      gpx: gpx,
      name: name,
      length: length,
      elevation: elevation,             // elevation gain
      description: description,
      createdAt: new Date(),            // current time
      owner: this.userId,               // _id of logged in user
      username: Meteor.users.findOne(this.userId).username,
    });
    console.log('Succesfully inserted a route.');
  },

  'routes.update'(routeId, url) {
    check(routeId, String);

    Routes.update(routeId, { $push: { photo_urls: url } });
  },

  'routes.toggleLiked'(routeId, userId) {
    check(routeId, String);
    const route = Routes.findOne(routeId);

    if (!route.likers || route.likers.indexOf(userId) === -1) {
      Routes.update(routeId, { $push: { likers: userId } });
      console.log('User ' + userId + ' liked route ' + route.name);
    } else {
      Routes.update(routeId, { $pull: { likers: userId } });
      console.log('User ' + userId + ' unliked route ' + route.name);
    }
  },
});