export const INITIAL_STATE = {
  locateModalVisible: false,
  shareModalVisible: false,
  viewReady: false,
  itemInfo: {}
};

export const TEXT = {
  title: "FOODIE NYC"
};

export const MAP_OPTIONS = {
  basemap: "topo"
};

export const VIEW_OPTIONS = {
  ui: { components: ["logo", "attribution"] },
  center: [-73.9897, 40.7411],
  zoom: 13
};

export const URLS = {
  itemInfo: appid => `//www.arcgis.com/sharing/rest/content/items/${appid}/data`
};
