import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';

import { Routes } from '../api/routes.js';

import Route from './Route.jsx';

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

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
      <div className="container">
        <header>
          <h1>Cycling in Seoul</h1>

          <form encType="multipart/form-data" method="post" className="new-route"
                onSubmit={this.handleSubmit.bind(this)} >
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
          </form>
        </header>

        <ul>
          {this.renderRoutes()}
        </ul>
      </div>
    );
  }
}

App.propTypes = {
  routes: PropTypes.array.isRequired,
  routesCount: PropTypes.number.isRequired,
};

export default createContainer(() => {
  return {
    routes: Routes.find().fetch(),
    routesCount: Routes.find().count(),
  };
}, App);
