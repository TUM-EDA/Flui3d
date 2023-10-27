import { gridSizeList, hundredthViewBoxSize } from "@/library/hardCodedValues";
import { defineStore } from "pinia";
import { useChannelSegInputStore } from "./channelSegmentInput";
import { useContentStore } from "./content";

function globalToWindowHelper(d: number, g: number) {
  return (d * g) / 100;
}
function windowToGlobalHelper(d: number, g: number) {
  return (d * 100) / g;
}
function zoomInTranslate(
  gridSizeList: number[],
  zoomIdx: number,
  gridSize: number,
  globalTranslateX: number,
  globalTranslateY: number,
  mousePosition: number[]
) {
  return [
    globalTranslateX +
      (window.innerWidth / gridSizeList[zoomIdx + 1] -
        window.innerWidth / gridSize) *
        50 +
      (((window.innerWidth / 2 - mousePosition[0]) * 100) /
        gridSizeList[zoomIdx + 1]) *
        (gridSizeList[zoomIdx + 1] / gridSize - 1),
    globalTranslateY +
      (window.innerHeight / gridSizeList[zoomIdx + 1] -
        window.innerHeight / gridSize) *
        50 +
      (((window.innerHeight / 2 - mousePosition[1]) * 100) /
        gridSizeList[zoomIdx + 1]) *
        (gridSizeList[zoomIdx + 1] / gridSize - 1)
  ];
}
function zoomOutTranslate(
  gridSizeList: number[],
  zoomIdx: number,
  gridSize: number,
  globalTranslateX: number,
  globalTranslateY: number,
  mousePosition: number[]
) {
  return [
    globalTranslateX +
      (window.innerWidth / gridSizeList[zoomIdx - 1] -
        window.innerWidth / gridSize) *
        50 +
      (((window.innerWidth / 2 - mousePosition[0]) * 100) /
        gridSizeList[zoomIdx - 1]) *
        (gridSizeList[zoomIdx - 1] / gridSize - 1),
    globalTranslateY +
      (window.innerHeight / gridSizeList[zoomIdx - 1] -
        window.innerHeight / gridSize) *
        50 +
      (((window.innerHeight / 2 - mousePosition[1]) * 100) /
        gridSizeList[zoomIdx - 1]) *
        (gridSizeList[zoomIdx - 1] / gridSize - 1)
  ];
}

export const useCoordinateStore = defineStore("coordinate", {
  state: () => ({
    windowCoords: [0, 0],
    globalCoords: [0, 0],
    roundedGlobalCoords: [0, 0],
    // initially 1px represents 40 um
    globalTranslateX: (window.innerWidth / 2) * 40,
    globalTranslateY: (window.innerHeight / 2) * 40,
    zoomIdx: 6,
    snapping: false,
    coordsVisible: false,
    minPrecision: false // toggle with TAB
  }),
  getters: {
    gridSize(): number {
      return gridSizeList[this.zoomIdx];
    },
    canvasSide(): number {
      return this.gridSize * hundredthViewBoxSize;
    },
    step(): number {
      if (this.gridSize < 1.5) return 10000;
      if (this.gridSize < 5) return 5000;
      if (this.gridSize < 10) return 2000;
      if (this.gridSize > 18) return 500;
      return 1000;
    },
    startX(): number {
      return Math.ceil(-this.globalTranslateX / this.step) * this.step;
    },
    startY(): number {
      return Math.ceil(-this.globalTranslateY / this.step) * this.step;
    },
    endX(): number {
      return (
        Math.floor(
          (windowToGlobalHelper(window.innerWidth, this.gridSize) -
            this.globalTranslateX) /
            this.step
        ) * this.step
      );
    },
    endY(): number {
      return (
        Math.floor(
          (windowToGlobalHelper(window.innerHeight, this.gridSize) -
            this.globalTranslateY) /
            this.step
        ) * this.step
      );
    },
    precisionGrid(): number {
      if (this.gridSize < 1.5) return 1000;
      if (this.gridSize < 5) return 500;
      if (this.gridSize < 10) return 200;
      if (this.gridSize > 18) return 50;
      return 100;
    },
    precision(): number {
      if (this.minPrecision) return 50;
      return this.precisionGrid;
    },

    windowTranslate(): string {
      const t0 = globalToWindowHelper(this.globalTranslateX, this.gridSize),
        t1 = globalToWindowHelper(this.globalTranslateY, this.gridSize);
      return `translate(${t0} ${t1})`;
    },
    globalTransform(): string {
      return `translate(${this.globalTranslateX} ${this.globalTranslateY})`;
    }
  },
  actions: {
    togglePrecision() {
      this.minPrecision = !this.minPrecision;
    },
    panWithMovement(movementX: number, movementY: number) {
      this.globalTranslateX += this.windowToGlobal(movementX);
      this.globalTranslateY += this.windowToGlobal(movementY);
    },
    roundCoords(x: number) {
      return Math.round(x / this.precision) * this.precision;
    },
    svgXToWindow(x: number) {
      return this.globalToWindow(x + this.globalTranslateX);
    },
    svgYToWindow(y: number) {
      return this.globalToWindow(y + this.globalTranslateY);
    },
    changeCoords(x: number, y: number) {
      this.windowCoords[0] = x;
      this.windowCoords[1] = y;
      const glX = (x / this.gridSize) * 100 - this.globalTranslateX;
      const glY = (y / this.gridSize) * 100 - this.globalTranslateY;
      this.globalCoords[0] = glX;
      this.globalCoords[1] = glY;
      const channelInput = useChannelSegInputStore();
      if (!this.snapping && !channelInput.lengthLocked) {
        this.roundedGlobalCoords[0] =
          Math.round(glX / this.precision) * this.precision;
        this.roundedGlobalCoords[1] =
          Math.round(glY / this.precision) * this.precision;
      }
    },
    range(start: number, stop: number, step: number) {
      return Array.from(
        { length: (stop - start) / step + 1 },
        (_, i) => start + i * step
      );
    },
    globalToWindow(d: number) {
      return (d * this.gridSize) / 100;
    },
    windowToGlobal(d: number) {
      return (d * 100) / this.gridSize;
    },
    zoomIn() {
      if (this.zoomIdx + 1 < gridSizeList.length) {
        const x =
            this.globalTranslateX +
            (window.innerWidth / gridSizeList[this.zoomIdx + 1] -
              window.innerWidth / this.gridSize) *
              50,
          y =
            this.globalTranslateY +
            (window.innerHeight / gridSizeList[this.zoomIdx + 1] -
              window.innerHeight / this.gridSize) *
              50;
        this.globalTranslateX = x;
        this.globalTranslateY = y;
        this.zoomIdx++;
      }
    },
    zoomOut() {
      if (this.zoomIdx - 1 >= 0) {
        const x =
            this.globalTranslateX +
            (window.innerWidth / gridSizeList[this.zoomIdx - 1] -
              window.innerWidth / this.gridSize) *
              50,
          y =
            this.globalTranslateY +
            (window.innerHeight / gridSizeList[this.zoomIdx - 1] -
              window.innerHeight / this.gridSize) *
              50;
        this.globalTranslateX = x;
        this.globalTranslateY = y;
        this.zoomIdx--;
      }
    },

    zoomInAtMouse() {
      if (this.zoomIdx + 1 < gridSizeList.length) {
        const [x, y] = zoomInTranslate(
          gridSizeList,
          this.zoomIdx,
          this.gridSize,
          this.globalTranslateX,
          this.globalTranslateY,
          this.windowCoords
        );
        this.globalTranslateX = x;
        this.globalTranslateY = y;
        this.zoomIdx++;
      }
    },
    zoomOutAtMouse() {
      if (this.zoomIdx - 1 >= 0) {
        const [x, y] = zoomOutTranslate(
          gridSizeList,
          this.zoomIdx,
          this.gridSize,
          this.globalTranslateX,
          this.globalTranslateY,
          this.windowCoords
        );
        this.globalTranslateX = x;
        this.globalTranslateY = y;
        this.zoomIdx--;
      }
    },
    resetView() {
      const contentStore = useContentStore();
      this.globalTranslateX =
        (window.innerWidth / this.gridSize) * 50 - contentStore.chipLengthX / 2;
      this.globalTranslateY =
        (window.innerHeight / this.gridSize) * 50 -
        contentStore.chipLengthY / 2;
    },
    setGlobalTranslate(x: number[]) {
      this.globalTranslateX = x[0];
      this.globalTranslateY = x[1];
    }
  }
});
