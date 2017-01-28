import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';

import { Tasks } from '../api/tasks.js';
import { Routes } from '../api/routes.js';

import Task from './Task.jsx';
import Route from './Route.jsx';

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hideCompleted: false,
    };
  }

  handleSubmit(event) {
    event.preventDefault();

    // Find the text field via the React ref
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

    Tasks.insert({
      text,
      createdAt: new Date(), // current time
    });

    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }

  handleSubmit2(event) {
    event.preventDefault();

    const file = ReactDOM.findDOMNode(this.refs.fileInput).files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(event) {
      Routes.insert({
        name: "Test Route",
        gpx: reader.result,
      });
      console.log("Succesfully inserted a route.");
    }
    reader.readAsText(file);
  }

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted,
    });
  }

  renderTasks() {
    let filteredTasks = this.props.tasks;
    if (this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }
    return filteredTasks.map((task) => (
      <Task key={task._id} task={task} />
    ));
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

          <label className="hide-completed">
            <input
              type="checkbox"
              readOnly
              checked={this.state.hideCompleted}
              onClick={this.toggleHideCompleted.bind(this)}
            />
            Hide Completed Tasks
          </label>

          <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
            <input
              type="text"
              ref="textInput"
              placeholder="Type to add new tasks"
            />
          </form>

          <form encType="multipart/form-data" method="post" className="new-route"
                onSubmit={this.handleSubmit2.bind(this)} >
            <input
              type="file"
              ref="fileInput"
              placeholder="Add GPX file"
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
  tasks: PropTypes.array.isRequired,
  routes: PropTypes.array.isRequired,
  incompleteCount: PropTypes.number.isRequired,
};

export default createContainer(() => {
  return {
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
    routes: Routes.find({}).fetch(),
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
  };
}, App);
git 