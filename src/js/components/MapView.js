import { MAP_OPTIONS, VIEW_OPTIONS, LOCATION } from "js/config";
import addressIconImg from "images/icon_address_100px.png";
import LocateModal from "js/components/modals/Locate";
import ShareModal from "js/components/modals/Share";
import Spinner from "js/components/shared/Spinner";
import Controls from "js/components/Controls";
import Search from "esri/widgets/Search";
import Expand from "esri/widgets/Expand";
import Legend from "esri/widgets/Legend";
import PopupTemplate from "esri/PopupTemplate";
import FeatureLayer from "esri/layers/FeatureLayer";
import MapView from "esri/views/MapView";
import React, { Component, Fragment } from "react";
import EsriMap from "esri/Map";

export default class Map extends Component {
  displayName: "Map";

  constructor(props) {
    super(props);
    this.state = {
      counter: 0,
      shareModalVisible: false,
      locateModalVisible: false,
      view: {},
      location: "",
      cuisine: ""
    };
  }

  componentDidMount() {
    const map = new EsriMap(MAP_OPTIONS);

    // Create our map view
    const promise = new MapView({
      container: this.refs.mapView,
      map: map,
      ...VIEW_OPTIONS
    });

    promise.when(view => {
      this.setState({
        view: view
      });
    });

    //Add Search widget instance
    const search = new Search({
      view: promise
    });
    promise.ui.add(search, "bottom-left");

    //Add Legend widget instance
    const legend = new Expand({
      content: new Legend({
        view: promise,
        style: {
          type: "classic",
          layout: "auto"
        }
      }),
      view: promise,
      expanded: false
    });
    promise.ui.add(legend, "bottom-right");

    //PopupTemplate
    var getAddressAction = {
      title: "Get Address",
      id: "get-address",
      image: addressIconImg
    };

    var template = {
      // autocasts as new PopupTemplate()
      title: "Restaurant: {name}",
      content: [
        {
          //This element uses an attribute from the featurelayer which displays a sentence. Text elements can only be set within the content.
          type: "text", // TextContentElement
          text: "See Address - double click on the address icon"
        },
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "cuisine",
              label: "Type of Cuisine",
              visible: true
            },
            {
              fieldName: "phone",
              label: "Phone",
              visible: true
            },
            {
              fieldName: "opening_hours",
              label: "Opening Hours",
              visible: true
            },
            {
              fieldName: "website",
              label: "Website",
              visible: true
            },
            {
              fieldName: "longitude",
              label: "Longitude",
              visible: true,
              format: {
                digitSeparator: true, //use a comma separator for large numbers
                places: 3 //if 0 rounds to no decimals
              }
            },
            {
              fieldName: "latitude",
              label: "Latitude",
              visible: true,
              format: {
                digitSeparator: true,
                places: 3
              }
            }
          ]
        }
      ],
      actions: [getAddressAction]
    };

    // Create FeatureLayer instances
    const featureLayer = new FeatureLayer({
      url:
        "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/Restaurants_NewYork/FeatureServer/0",
      outFields: ["*"], //grab all attributes fields
      popupTemplate: template,
      // definitionExpression: `cuisine = 'pizza'`,
      definitionExpression: this.state.cuisine
    });
    map.add(featureLayer);

    //Execute when "get address" is clicked
    const getAddress = (longitude, latitude) => {
      fetch(
        `http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=pjson&featureTypes=&location=${longitude},${latitude}`
      )
        .then(response => response.json())
        .then(location => {
          promise.popup.content.viewModel.content[0].text =
            location.address.LongLabel;
          // this.setState({
          //   location: location.address.LongLabel
          // });
        });
      // if (this.state.location !== "") {
      //   promise.popup.content.viewModel.content[0].text = this.state.location;
      //   // promise.popup.content.viewModel.content[0].fieldInfos[1].fieldName = this.state.location;
      // } else {
      //   promise.popup.content.viewModel.content[0].text =
      //     "No address was found for this location";
      // }
    };

    //Event handler on click
    promise.popup.on("trigger-action", event => {
      if (event.action.id === "get-address") {
        let longitude = event.target.location.longitude;
        let latitude = event.target.location.latitude;
        getAddress(longitude, latitude);
      }
    });
  }

  //filter handlers
  handleCuisineSelection = event => {
    console.log("selected", event.target.value);
    this.setState({
      cuisine: event.target.value
    });
  };

  //toggle modals
  toggleLocateModal = () => {
    this.setState({ locateModalVisible: !this.state.locateModalVisible });
  };

  toggleShareModal = () => {
    this.setState({ shareModalVisible: !this.state.shareModalVisible });
  };

  render() {
    const { shareModalVisible, locateModalVisible, view } = this.state;

    return (
      <Fragment>
        <label id="filter-box" className="shadow">
          <p>Filter by Cuisine</p>
          <select className="selection" onChange={this.handleCuisineSelection}>
            <option value="all" defaultValue>
              all
            </option>
            <option value="cuisine = 'italian'">italian</option>
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
        </label>
        <div ref="mapView" className="map-view">
          <ShareModal
            visible={shareModalVisible}
            toggleShareModal={this.toggleShareModal}
          />
          <LocateModal
            visible={locateModalVisible}
            toggleLocateModal={this.toggleLocateModal}
          />
          <Controls
            view={view}
            toggleShareModal={this.toggleShareModal}
            toggleLocateModal={this.toggleLocateModal}
          />
          <Spinner active={!view.ready} />
        </div>
      </Fragment>
    );
  }
}
