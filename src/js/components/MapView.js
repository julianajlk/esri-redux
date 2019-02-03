import { MAP_OPTIONS, VIEW_OPTIONS, LOCATION } from "js/config";
import addressIconImg from "images/icon_address_100px.png";
import LocateModal from "js/components/modals/Locate";
import ShareModal from "js/components/modals/Share";
import Spinner from "js/components/shared/Spinner";
import Controls from "js/components/Controls";
import PopupTemplate from "esri/PopupTemplate";
import Locator from "esri/tasks/Locator";
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
      location: ""
    };
  }

  componentDidMount() {
    const map = new EsriMap(MAP_OPTIONS);

    //set up a Locator task with geocoding
    var locatorTask = new Locator({
      url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
    });

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
          text: "See Address: Double click on the Address Icon!"
        },
        {
          type: "text",
          text: "Reverse geocode: [{longitude}, {latitude}]"
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
              visible: true,
              format: {
                digitSeparator: true, //use a comma seaparator for large numbers
                places: 0 //sets the number of decimal places to 0 and rounds up
              }
            },
            {
              fieldName: "opening_hours",
              label: "Opening Hours",
              visible: true,
              format: {
                digitSeparator: true,
                places: 0
              }
            },
            {
              fieldName: "website",
              label: "Website",
              visible: true
            }
          ]
        }
      ],
      actions: [getAddressAction]
    };

    // Create FeatureLayer instance
    var featureLayer = new FeatureLayer({
      url:
        "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/Restaurants_NewYork/FeatureServer/0",
      outFields: ["*"], //grab all attributes fields
      // popupTemplate: template
      popupTemplate: template
    });
    map.add(featureLayer);

    //Execute when "get address" is clicked
    const getAddress = (longitude, latitude) => {
      fetch(
        `http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=pjson&featureTypes=&location=${longitude},${latitude}`
      )
        .then(response => response.json())
        .then(location => {
          this.setState({
            location: location.address.LongLabel
          });
        });
      if (this.state.location !== "") {
        promise.popup.content.viewModel.content[0].text = this.state.location;
        // promise.popup.content.viewModel.content[0].fieldInfos[1].fieldName = this.state.location;
      } else {
        promise.popup.content.viewModel.content[0].text =
          "No address was found for this location";
      }
    };

    //Event handler on click
    promise.popup.on("trigger-action", function(event) {
      if (event.action.id === "get-address") {
        let longitude = event.target.location.longitude;
        let latitude = event.target.location.latitude;
        getAddress(longitude, latitude);
      }
    });
  }

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
        <div>Click any of the dots to see more info on the restaurant</div>
      </Fragment>
    );
  }
}
