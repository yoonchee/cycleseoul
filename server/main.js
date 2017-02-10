import { Meteor } from 'meteor/meteor';

import fs from 'fs';
import path from 'path';

import '../imports/api/routes.js';

Meteor.methods({
  exportGpx: function (route) {
    const chroot = path.resolve('.').split(path.sep + '.meteor')[0];
    const dir = chroot + '/public/';

    fs.writeFileSync(dir + route.name + '.gpx', route.gpx);
    console.log('The file ' + route.name + '.gpx was saved to ' + dir);
    return Meteor.absoluteUrl(route.name + '.gpx');
  },
});
