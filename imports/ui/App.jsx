import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Grid, Row, Col, ListGroup, Jumbotron } from 'react-bootstrap';

import { Routes } from '../api/routes.js';

import Route from './Route.jsx';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';

// App component - represents the whole app
class App extends Component {
  handleSubmit(event) {
    event.preventDefault();

    const file = ReactDOM.findDOMNode(this.refs.fileInput).files[0];
    if (!file) return;

    const description = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
    const reader = new FileReader();

    reader.onload = function(event) {
      Routes.insert({
        gpx: reader.result,
        description: description,
        createdAt: new Date(),            // current time
        owner: Meteor.userId(),           // _id of logged in user
        username: Meteor.user().username, // username of logged in user
      });
      console.log("Succesfully inserted a route.");
    }
    reader.readAsText(file);
  }

  renderRoutes() {
    return this.props.routes.map((route) => (
      <Route key={route._id} route={route} />
    ));
  }

  render() {
    return (
      <Grid>
        <Row>
          <Col md={12}>
            <header>
              <AccountsUIWrapper />

              <Jumbotron>
                <h1>Cycling in Seoul</h1>
                <p>
                  Cycle along the beautiful Han River on paved bicycle roads.
                  Or venture out to the outskirts of the Seoul for mountains,
                  streams, and endless bike paths. Whether you're a Strava
                  PR-setting roadie or hardcord mountain biker, there are
                  tons of joy waiting ahead.
                </p>
              </Jumbotron>

              { this.props.currentUser ?
                <form encType="multipart/form-data" method="post" className="new-route"
                      onSubmit={this.handleSubmit.bind(this)}>
                  <input
                    type="file"
                    ref="fileInput"
                    placeholder="Add GPX file"
                  />
                  <textarea
                    ref="textInput"
                    rows="4"
                    cols="70"
                    placeholder="Add description"
                  />
                  <input type="submit" />
                </form> : ''
              }
            </header>

            <h2>Top {this.props.routesCount} Cycling Routes in Seoul</h2>

            <ListGroup className="routes">
              {this.renderRoutes()}
            </ListGroup>
          </Col>
        </Row>
      </Grid>
    );
  }
}

App.propTypes = {
  routes: PropTypes.array.isRequired,
  routesCount: PropTypes.number.isRequired,
  currnetUser: PropTypes.object,
};

export default createContainer(() => {
  return {
    routes: Routes.find({}).fetch(),
    routesCount: Routes.find({}).count(),
    currentUser: Meteor.user(),
  };
}, App);
