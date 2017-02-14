import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Grid, Row, Col, ListGroupItem } from 'react-bootstrap';
import { ButtonGroup, Button, Glyphicon } from 'react-bootstrap';
import { ControlLabel, FormControl, Image } from 'react-bootstrap';
import Lightbox from 'react-images';

import { Routes } from '../api/routes.js';

// Route component - represents a route
class Route extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lightboxIsOpen: false,
      currentImageIndex: 0,
    };
  }

  toggleStarred() {
    const user = this.props.currentUser;

    if (!user) {
      console.log('You need to login first to star a route.');
      return;
    }
    Meteor.call('routes.toggleLiked', this.props.route._id, user._id);
  }

  handleClick(event) {
    Meteor.call('exportGpx', this.props.route, function (error, result) {
      if (error) {
        console.error(error);
        return;
      }
      if (result) {
        let a = document.createElement('a');
        document.body.appendChild(a);
        a.href = result;
        a.download = result.split('/').pop();
        a.click();
        document.body.removeChild(a);
      }
    });
  }

  closeLightbox() {
    this.setState({ lightboxIsOpen: false });
  }

  gotoPrevious() {
    this.setState({ currentImageIndex: this.state.currentImageIndex - 1 });
  }

  gotoNext() {
    this.setState({ currentImageIndex: this.state.currentImageIndex + 1 });
  }

  showPhoto(event) {
    this.setState({
      lightboxIsOpen: true,
      currentImageIndex: parseInt(event.target.dataset.index),
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    const url = ReactDOM.findDOMNode(this.refs.urlInput).value.trim();
    Meteor.call('routes.update', this.props.route._id, url);
    ReactDOM.findDOMNode(this.refs.urlInput).value = '';
    console.log('Photo was inserted successfully.');
  }

  isStarred() {
    const likers = this.props.route.likers;
    const user = this.props.currentUser;

    if (!likers || !user || likers.indexOf(user._id) === -1) {
      return '';
    } else {
      return 'starred';
    }
  }

  renderPhotos() {
    if (!this.props.route.photo_urls) return;

    return this.props.route.photo_urls.map((url, index) => (
      <a key={index} role='button'>
        <Image
          src={url} data-index={index} className='route-photo'
          onClick={this.showPhoto.bind(this)}
        />
      </a>
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
                  <Button onClick={this.toggleStarred.bind(this)}>
                    <Glyphicon glyph='star' className={this.isStarred()} />&nbsp;
                    <span className='likes-count'>
                      {this.props.route.likers ? this.props.route.likers.length : 0}
                    </span>
                  </Button>
                  <Button onClick={this.handleClick.bind(this)}>Export GPX</Button>
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
                <div className='route-photos'>
                  {this.renderPhotos()}
                </div>

                {this.props.route.photo_urls ?
                  <Lightbox
                    currentImage={this.state.currentImageIndex}
                    images={this.props.route.photo_urls.map((url) => ({src: url}))}
                    backdropClosesModal={true}
                    isOpen={this.state.lightboxIsOpen}
                    onClickPrev={this.gotoPrevious.bind(this)}
                    onClickNext={this.gotoNext.bind(this)}
                    onClose={this.closeLightbox.bind(this)}
                  /> : ''
                }

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
    const map = L.map(this.props.route._id, {
      doubleClickZoom: false,
    });

    L.tileLayer(
      'https://api.mapbox.com/styles/v1/yoonchee/ciz3qy1y2002w2rnrytzvlnlh/tiles/256/{z}/{x}/{y}?access_token=' +
      Meteor.settings.public.mapboxAccessToken,
      {detectRetina: true}
    ).addTo(map);

    new L.GPX(this.props.route.gpx, {
      async: true,
    }).on('loaded', function(e) {
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
