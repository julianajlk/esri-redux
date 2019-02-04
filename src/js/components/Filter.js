import React, { Component } from "react";

export default class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cuisine: ""
    };
  }

  handleCuisineSelection = event => {
    this.setState({
      cuisine: event.target.value
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    console.log("clicked");
  };

  render() {
    return (
      <div id="filter-box">
        <form onSubmit={this.handleSubmit}>
          <p>Filter by Cuisine</p>
          <select
            id="cuisine-type"
            className="filter-content"
            onChange={this.handleCuisineSelection}
          >
            <option value="italian" defaultValue>
              italian
            </option>
            <option value="pizza">pizza</option>
            <option value="mexican">mexican</option>
            <option value="chinese">chinese</option>
            <option value="american">american</option>
            <option value="japanese">japanese</option>
            <option value="thai">thai</option>
            <option value="indian">indian</option>
            <option value="french">french</option>
            <option value="burger">burger</option>
          </select>
          <button id="filter-query" type="submit">
            Filter
          </button>
        </form>
      </div>
    );
  }
}
