import { MAP_OPTIONS, VIEW_OPTIONS, LOCATION } from "js/config";
import subwayIconImg from "images/icon_nycsubway.png";
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
      cuisine: "",
      coordinates: [-73.9897, 40.7411]
    };
  }

  componentDidMount() {
    const map = new EsriMap(MAP_OPTIONS);

    // Create our map view
    const promise = new MapView({
      container: this.refs.mapView,
      map: map,
      center: this.state.coordinates,
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
    promise.ui.add(search, "bottom-right");

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
    promise.ui.add(legend, "bottom-left");

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

    var subwayTemplate = {
      // autocasts as new PopupTemplate()
      title: "Subway Line: {Routes_ALL}",
      content: [
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "STOP_NAME",
              label: "Stop",
              visible: true
            },
            {
              fieldName: "Routes_ALL",
              label: "Routes",
              visible: true
            },
            {
              fieldName: "Routes_WKD",
              label: "Routes (weekend)",
              visible: true
            }
          ]
        }
      ]
    };

    // Define a unique value renderer and symbols
    var subwayRenderer = {
      type: "simple",
      symbol: {
        type: "picture-marker",
        url: subwayIconImg,
        width: 8,
        height: 8
      }
    };

    // Create FeatureLayer instance
    const featureLayer = new FeatureLayer({
      url:
        "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/Restaurants_NewYork/FeatureServer/0",
      outFields: ["*"], //grab all attributes fields
      popupTemplate: template,
      // definitionExpression: `cuisine = 'pizza'`,
      definitionExpression: this.state.cuisine
    });
    map.add(featureLayer);

    var subwayFeatureLayer = new FeatureLayer({
      url:
        "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/NYCSubwayStops/FeatureServer/0",
      renderer: subwayRenderer,
      outFields: ["*"],
      popupTemplate: subwayTemplate
    });
    map.add(subwayFeatureLayer);

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

    //Event handler on click address
    promise.popup.on("trigger-action", event => {
      if (event.action.id === "get-address") {
        let longitude = event.target.location.longitude;
        let latitude = event.target.location.latitude;
        getAddress(longitude, latitude);
      }
    });

    //Event listener toggle subway
    document
      .getElementById("subway-hide")
      .addEventListener("click", function toggleSubway() {
        console.log("clicked", event.target.value);
        map.remove(subwayFeatureLayer);
      });
    document
      .getElementById("subway-show")
      .addEventListener("click", function toggleSubway() {
        console.log("clicked", event.target.value);
        map.add(subwayFeatureLayer);
      });

    //Event listener onChange cuisine
    document
      .getElementById("cuisine-selection")
      .addEventListener("change", function setCuisineQery() {
        var cuisineQuery = event.target.value;
        map.layers.forEach(function(layer) {
          layer.definitionExpression = cuisineQuery;
        });
        // featureLayer.definitionExpression = event.target.value;
      });

    //Event listner onChange neighborhood
    document
      .getElementById("neighborhood-selection")
      .addEventListener("change", () => {
        console.log("neighborhood", event.target.value);
        this.setState({
          coordinates: event.target.value
        });
        var neighborhoodQuery = event.target.value;
        // debugger;
        // promise.center = event.target.value;
      });
  }

  componentWillUnmount() {
    //restaurants cuisine
    document
      .getElementById("cuisine-selection")
      .removeEventListener("change", function setCuisineQery() {
        var cuisineQuery = event.target.value;
        map.layers.forEach(function(layer) {
          layer.definitionExpression = cuisineQuery;
        });
      });

    //subway hide
    document
      .getElementById("subway-hide")
      .removeEventListener("click", function toggleSubway() {
        console.log("clicked", event.target.value);
        map.remove(subwayFeatureLayer);
      });
    document
      .getElementById("subway-show")
      .removeEventListener("click", function toggleSubway() {
        console.log("clicked", event.target.value);
        map.add(subwayFeatureLayer);
      });
  }

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
          <select className="selection" id="cuisine-selection">
            <option value="" defaultValue>
              all
            </option>
            <option value="cuisine = 'italian'">italian</option>
            <option value="cuisine = 'pizza'">pizza</option>
            <option value="cuisine = 'mexican'">mexican</option>
            <option value="cuisine = 'chinese'">chinese</option>
            <option value="cuisine = 'american'">american</option>
            <option value="cuisine = 'japanese'">japanese</option>
            <option value="cuisine = 'thai'">thai</option>
            <option value="cuisine = 'indian'">indian</option>
            <option value="cuisine = 'french'">french</option>
            <option value="cuisine = 'burger'">burger</option>
          </select>

          <p>Zoom to Neighborhood</p>
          <select className="selection" id="neighborhood-selection">
            <option value="-73.9654, 40.7829" defaultValue>
              nyc
            </option>
            <option value="-73.9897, 40.7411">chelsea</option>
            <option value="-73.9566, 40.7736">ues</option>
            <option value="-73.9754, 40.7870">uws</option>
            <option value="-73.9840, 40.7549">midtown</option>
            <option value="-74.0030, 40.7233">downtown</option>
            <option value="-73.9235, 40.7644">queens</option>
            <option value="-73.9571, 40.7081">brooklyn</option>
          </select>
          <p>Subway Stops</p>
          <button id="subway-hide" className="subway-bttn" value="false">
            Hide
          </button>
          <button id="subway-show" className="subway-bttn" value="true">
            Show
          </button>
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
