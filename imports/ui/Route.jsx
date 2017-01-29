import React, { Component, PropTypes } from 'react';

import { Routes } from '../api/routes.js';

// Task component - represents a single todo item
export default class Route extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      length: 0,
      elevation: 0,
      description: '',
    };
  }

  render() {
    return (
      <li className='route'>
        <h2>{this.state.name}</h2>
        <dl className='stats'>
          <dt className='length'>Length</dt>
          <dd>{(this.state.length / 1000).toFixed(0)}km</dd>
          <dt className='elevation'>Elevation</dt>
          <dd>{this.state.elevation.toFixed(0)}m</dd>
        </dl>
        <div className='description'>{this.props.route.description}</div>
        <div id={this.props.route._id} className='map'></div>
      </li>
    );
  }

  componentDidMount() {
    const access_token = 'pk.eyJ1IjoieW9vbmNoZWUiLCJhIjoiY2l0MmdzZGd1MHNwaTJ1cXA1Z3k3M3JxeSJ9.Rwk0oJ53OFJlzO7iF_r7Mg';
    const map = L.map(this.props.route._id, {
      doubleClickZoom: false
    });

    L.tileLayer(
      'https://api.mapbox.com/styles/v1/yoonchee/cit2o0eol000r2yqrylidl1ty/tiles/256/{z}/{x}/{y}?access_token=' + access_token,
      {detectRetina: true}
    ).addTo(map);

    const that = this;
    new L.GPX(this.props.route.gpx, {async: true}).on('loaded', function(e) {
      const gpx = e.target;
      that.setState({
        name: gpx.get_name(),
        length: gpx.get_distance(),
        elevation: gpx.get_elevation_gain(),
      });
      map.fitBounds(gpx.getBounds());
    }).addTo(map);
  }
}

Route.propTypes = {
  // This component gets the route to display through a React prop.
  // We can use propTypes to indiciate it is required
  route: PropTypes.object.isRequired,
};
