import React, { Component } from "react";

export default class Filter extends Component {
  render() {
    return (
      <div id="filterBox">
        <p>Filter by Cuisine</p>
        <select className="filterContent">
          <option value="italian" selected>
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
      </div>
    );
  }
}
