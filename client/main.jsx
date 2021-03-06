import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import '../imports/startup/accounts-config.js';
import App from '../imports/ui/App.jsx';

Meteor.startup(() => {
  L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images/';
  render(<App />, document.getElementById('render-target'));
});
