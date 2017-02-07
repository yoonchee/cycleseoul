import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Grid, Row, Col, ListGroupItem } from 'react-bootstrap';
import { ButtonGroup, Button, Glyphicon } from 'react-bootstrap';
import { ControlLabel, FormControl, Image } from 'react-bootstrap';

import { Routes } from '../api/routes.js';

// Route component - represents a route
class Route extends Component {
  toggleStarred() {
    console.log('Star clicked for route ' + this.props.route.name);
    /*
    const likers = Routes.find(this.props.route._id).likers;
    Routes.update(this.props.route._id, {
      $set: { liked: !this.props.route.liked },
    });
    */
  }

  handleSubmit(event) {
    event.preventDefault();

    const url = ReactDOM.findDOMNode(this.refs.urlInput).value.trim();
    Routes.update({ _id: this.props.route._id }, {
      $push: {
        photo_urls: url,
      }
    });
    console.log('Photo was inserted successfully.');
  }

  renderPhotos() {
    if (!this.props.route.photo_urls) return;

    return this.props.route.photo_urls.map((url) => (
      <Image key={url} src={url} className='route-photo' />
    ));
  }

  render() {
    const routeStyle = {
      padding: '30px',
      marginBottom: '20px',
    };

    return (
      <ListGroupItem className='route' style={routeStyle}>
        <Row>
          <Col md={8}>
            <Row>
              <Col md={8}>
                <h3>{this.props.route.name}</h3>
              </Col>

              <Col md={4}>
                <ButtonGroup>
                  <Button onClick={this.toggleStarred.bind(this)}><Glyphicon glyph='star' /></Button>
                  <Button>Export GPX</Button>
                </ButtonGroup>
              </Col>

              <Col md={12}>
                <dl className='stats dl-horizontal'>
                  <dt className='length'>Length</dt>
                  <dd>{this.props.route.length}km</dd>
                  <dt className='elevation'>Elevation</dt>
                  <dd>{this.props.route.elevation}m</dd>
                </dl>
                <div className='description'>{this.props.route.description}</div>
                <ul className='route-photos'>
                  {this.renderPhotos()}
                </ul>
                { this.props.currentUser ?
                  <form method='post' className='new-photo'
                        onSubmit={this.handleSubmit.bind(this)}>
                    <ControlLabel>Add photos by URL</ControlLabel>
                    <FormControl
                      ref='urlInput'
                      type='url'
                    />
                    <Button type='submit'>
                      Submit
                    </Button>
                  </form> : ''
                }
              </Col>
            </Row>
          </Col>

          <Col md={4}>
            <div id={this.props.route._id} className='map'></div>
          </Col>
        </Row>
      </ListGroupItem>
    );
  }

  componentDidMount() {
    const access_token = 'pk.eyJ1IjoieW9vbmNoZWUiLCJhIjoiY2l0MmdzZGd1MHNwaTJ1cXA1Z3k3M3JxeSJ9.Rwk0oJ53OFJlzO7iF_r7Mg';
    const map = L.map(this.props.route._id, {
      doubleClickZoom: false,
    });

    L.tileLayer(
      'https://api.mapbox.com/styles/v1/yoonchee/cit2o0eol000r2yqrylidl1ty/tiles/256/{z}/{x}/{y}?access_token=' + access_token,
      {detectRetina: true}
    ).addTo(map);

    new L.GPX(this.props.route.gpx, {async: true}).on('loaded', function(e) {
      map.fitBounds(e.target.getBounds());
    }).addTo(map);
  }
}

Route.propTypes = {
  // This component gets the route to display through a React prop.
  // We can use propTypes to indiciate it is required
  route: PropTypes.object.isRequired,
};

export default createContainer(() => {
  return {
    currentUser: Meteor.user(),
  };
}, Route);
