export const INITIAL_STATE = {
  locateModalVisible: false,
  shareModalVisible: false,
  viewReady: false,
  itemInfo: {}
};

export const TEXT = {
  title: "FOODIE NYC"
  // subtitle: "Example with React, Esri, Sass, and more."
};

export const MAP_OPTIONS = {
  basemap: "topo"
};

export const VIEW_OPTIONS = {
  ui: { components: ["logo", "attribution"] },
  center: [-73.95, 40.702],
  zoom: 11
};

export const URLS = {
  itemInfo: appid => `//www.arcgis.com/sharing/rest/content/items/${appid}/data`
};
