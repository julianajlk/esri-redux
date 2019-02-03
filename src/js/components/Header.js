import React, { Component } from "react";
import logoImg from "images/logo.svg";

export default class Header extends Component {
  displayName: "Header";

  render() {
    const { title } = this.props;

    return (
      <div className="app-header">
        <h1 className="app-title">{title}</h1>
        <img className="app-logo" src={logoImg} alt="app-logo" />
      </div>
    );
  }
}
