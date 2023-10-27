import { ChannelPoint } from "@/library/other";
import { defineStore } from "pinia";
import { useCoordinateStore } from "./coordinate";
import { MoveChannelVertexAct, useHistoryStore } from "./history";

const dummyChannelPoint = new ChannelPoint([0, 0]);
const calculateCoordsWithDirection = (
  px: number,
  py: number,
  direction: number[],
  distance: number
) => {
  // rotate vector [distance, 0] into direction
  // translate to p
  const k = Math.sqrt(direction[0] ** 2 + direction[1] ** 2);
  const cosR = direction[0] / k;
  const sinR = direction[1] / k;
  const x = distance * cosR + px;
  const y = distance * sinR + py;
  return { x, y };
};
const getDirection = (p1: number[], p2: number[]) => {
  return [p2[0] - p1[0], p2[1] - p1[1]];
};
const changePosition = (
  toChange: ChannelPoint,
  reference: ChannelPoint,
  distance: number
) => {
  const dir = getDirection(reference.position, toChange.position);
  if (dir[0] !== 0 || dir[1] !== 0) {
    const p = calculateCoordsWithDirection(
      reference.position[0],
      reference.position[1],
      dir,
      distance
    );
    // break potential binding
    if (toChange.isConnectedToPort) {
      toChange.isConnectedToPort = false;
      toChange.position = [p.x, p.y];
    } else {
      toChange.position[0] = p.x;
      toChange.position[1] = p.y;
    }
  }
};
const changePositionAction = (
  toChange: ChannelPoint,
  reference: ChannelPoint,
  distance: number
) => {
  const connectedToPort = toChange.isConnectedToPort;
  const startPoint = toChange.position;
  toChange.position = toChange.position.slice();
  changePosition(toChange, reference, distance);
  const historyStore = useHistoryStore();
  historyStore.addActivity(
    new MoveChannelVertexAct(startPoint, toChange, connectedToPort, false)
  );
};

const changePositionDraw = (
  toChange: number[],
  reference: ChannelPoint,
  distance: number,
  dirRef: number[],
  shift: boolean
) => {
  const dir = getDirection(reference.position, dirRef);
  if (dir[0] !== 0 || dir[1] !== 0) {
    if (shift) {
      const R = (Math.atan2(dir[1], dir[0]) * 180) / Math.PI;
      const R45 = (Math.round(R / 45) + 8) % 8;
      switch (R45) {
        case 0: {
          dir[0] = 1;
          dir[1] = 0;
          break;
        }
        case 1: {
          dir[0] = 1;
          dir[1] = 1;
          break;
        }
        case 2: {
          dir[0] = 0;
          dir[1] = 1;
          break;
        }
        case 3: {
          dir[0] = -1;
          dir[1] = 1;
          break;
        }
        case 4: {
          dir[0] = -1;
          dir[1] = 0;
          break;
        }
        case 5: {
          dir[0] = -1;
          dir[1] = -1;
          break;
        }
        case 6: {
          dir[0] = 0;
          dir[1] = -1;
          break;
        }
        case 7: {
          dir[0] = 1;
          dir[1] = -1;
          break;
        }
      }
    }
    const p = calculateCoordsWithDirection(
      reference.position[0],
      reference.position[1],
      dir,
      distance
    );
    toChange[0] = p.x;
    toChange[1] = p.y;
  }
};

export const useChannelSegInputStore = defineStore("channelSegInput", {
  state: () => ({
    showInput: false,
    lengthValue: "",
    channelPoint1: dummyChannelPoint,
    channelPoint2: dummyChannelPoint,
    lengthLocked: false
  }),
  getters: {
    positionX(): number {
      const coordinateStore = useCoordinateStore();
      return coordinateStore.svgXToWindow(
        (this.channelPoint1.position[0] + this.channelPoint2.position[0]) / 2
      );
    },
    positionY(): number {
      const coordinateStore = useCoordinateStore();
      return coordinateStore.svgYToWindow(
        (this.channelPoint1.position[1] + this.channelPoint2.position[1]) / 2
      );
    },
    lockedDistance(): number {
      return parseInt(this.lengthValue);
    }
  },
  actions: {
    segLength(cp1: ChannelPoint, cp2: ChannelPoint) {
      const x = cp1.position[0] - cp2.position[0];
      const y = cp1.position[1] - cp2.position[1];
      return Math.sqrt(x ** 2 + y ** 2).toFixed();
    },
    hideChannelSegLengthInput() {
      this.showInput = false;
    },
    showChannelSegLengthInput(cp1: ChannelPoint, cp2: ChannelPoint) {
      this.channelPoint1 = cp1;
      this.channelPoint2 = cp2;
      this.lengthValue = this.segLength(cp1, cp2);
      this.showInput = true;
    },
    setLengthDraw(newLength: string) {
      const x = parseInt(newLength);
      if (!isNaN(x) && x !== 0) {
        // change channelPoint2 position
        changePosition(this.channelPoint2, this.channelPoint1, x);
        this.lengthValue = newLength;
        this.lengthLocked = true;
        this.channelPoint2.isConnectedToPort = false;
      }
      this.hideChannelSegLengthInput();
    },
    setLengthValue(newLength: string) {
      if (newLength !== this.lengthValue) {
        const x = parseInt(newLength);
        if (!isNaN(x) && x !== 0) {
          if (!this.channelPoint2.isConnectedToPort) {
            // change channelPoint2 position
            changePositionAction(this.channelPoint2, this.channelPoint1, x);
          } else if (!this.channelPoint1.isConnectedToPort) {
            // change channelPoint1
            changePositionAction(this.channelPoint1, this.channelPoint2, x);
          } else {
            // break binding of channelPoint2
            changePositionAction(this.channelPoint2, this.channelPoint1, x);
          }
        }
      }
      this.hideChannelSegLengthInput();
    },
    // called with locked seg length
    updateChannelSegDirection(shift: boolean) {
      const coordinateStore = useCoordinateStore();
      changePositionDraw(
        coordinateStore.roundedGlobalCoords,
        this.channelPoint1,
        this.lockedDistance,
        coordinateStore.globalCoords,
        shift
      );
    }
  }
});
