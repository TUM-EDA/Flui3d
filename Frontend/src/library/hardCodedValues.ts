const defaultPropertyStep = 50;

// default color = layerColorDefault[idx % layerColorDefault.length]
const layerColorDefault = [
  "#0d6efd",
  "#6610f2",
  "#dc3545",
  "#fd7e14",
  "#198754",
  "#0dcaf0"
];

const postUrl = "https://to.your.backend";

const gridSizeList = [
  1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12.5, 15,
  17.5, 20, 22.5, 25, 27.5, 30, 35
]; // 100 um displayed in px
const hundredthViewBoxSize = 10000;
export {
  defaultPropertyStep,
  layerColorDefault,
  postUrl,
  gridSizeList,
  hundredthViewBoxSize
};
