import { MAP_OPTIONS, VIEW_OPTIONS, LOCATION } from "js/config";
import LocateModal from "js/components/modals/Locate";
import ShareModal from "js/components/modals/Share";
import Spinner from "js/components/shared/Spinner";
import Controls from "js/components/Controls";
import PopupTemplate from "esri/PopupTemplate";
import Locator from "esri/tasks/Locator";
import FeatureLayer from "esri/layers/FeatureLayer";
import MapView from "esri/views/MapView";
import React, { Component } from "react";
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
      location: {}
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
    var template = {
      // autocasts as new PopupTemplate()
      title: "Restaurant: {name}",
      content: [
        {
          // It is also possible to set the fieldInfos outside of the content
          // directly in the popupTemplate. If no fieldInfos is specifically set
          // in the content, it defaults to whatever may be set within the popupTemplate.
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
                digitSeparator: true,
                places: 0
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
              visible: true,
              format: {
                digitSeparator: true,
                places: 0
              }
            }
          ]
        },
        {
          // You can also set a descriptive text element. This element
          // uses an attribute from the featurelayer which displays a
          // sentence. Text elements can only be set within the content.
          type: "text", // TextContentElement
          text: "Reverse geocode: [{longitude}, {latitude}]"
        },
        {
          type: "text",
          text: "Address: "
        }
      ]
    };

    // Now that we have created our Map and Mapview, here is where we would add some layers!
    // see https://developers.arcgis.com/javascript/latest/sample-code/sandbox/index.html?sample=layers-featurelayer for an example!

    var featureLayer = new FeatureLayer({
      url:
        "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/Restaurants_NewYork/FeatureServer/0",
      outFields: ["*"],
      popupTemplate: template
    });
    map.add(featureLayer);
  }

  handleReverseGeoCode = (longitude, latitude) => {
    fetch(
      `http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=pjson&featureTypes=&location=${longitude},${latitude}`
    )
      .then(response => response.json())
      .then(location => {
        this.setState({
          location: location
        });
      });
  };

  toggleLocateModal = () => {
    this.setState({ locateModalVisible: !this.state.locateModalVisible });
  };

  toggleShareModal = () => {
    this.setState({ shareModalVisible: !this.state.shareModalVisible });
  };

  render() {
    const { shareModalVisible, locateModalVisible, view } = this.state;

    return (
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
    );
  }
}
