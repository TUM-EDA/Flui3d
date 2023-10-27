import { useContentStore } from "@/stores/content";
import { Bridge } from "./bridge";
import { ChannelPointOutput, ContentUnitOutput } from "./typeDefinations";

export class ChannelPort {
  elementId: string;
  idx: number;
  position = [0, 0];
  isConnected = false;
  constructor(x: number, y: number, elm: string, idx = 0) {
    this.position[0] = x;
    this.position[1] = y;
    this.elementId = elm;
    this.idx = idx;
  }
}

const dummyChannelPort = new ChannelPort(0, 0, "");

export class ChannelPoint {
  position: number[];
  isConnectedToPort = false;
  connectedPort = dummyChannelPort;
  roundedRadius = 0;
  bridges = Array<Bridge>();
  isSelected = false; // (in rounded corner mode)
  constructor(point: number[]) {
    this.position = point;
  }

  buildOutput(): ChannelPointOutput {
    const point = {
      position: this.position,
      isConnectedToPort: this.isConnectedToPort,
      roundedRadius: this.roundedRadius,
      connectedPort: {
        connectedPortElement: this.connectedPort.elementId,
        connectedPortIndex: this.connectedPort.idx
      }
    };
    return point;
  }

  // bridge's channelSeg.end will be set in channel
  clone(cid: string, channelWidth: number, idx: number): ChannelPoint {
    const pointCopy = new ChannelPoint(this.position.slice());
    pointCopy.roundedRadius = this.roundedRadius;
    this.bridges.forEach((b) => {
      const bridgeCopy = b.makeCopy(pointCopy, cid, channelWidth, idx);
      // add to content
      const contentStore = useContentStore();
      contentStore.addElmentToContent(bridgeCopy);
      pointCopy.bridges.push(bridgeCopy);
    });
    return pointCopy;
  }

  resetBridges(): void {
    this.bridges = Array<Bridge>();
  }
}

export class ChannelPortWithSize extends ChannelPort {
  portWidth: number;
  portHeight: number;
  constructor(
    x: number,
    y: number,
    cid: string,
    idx: number,
    w: number,
    h: number
  ) {
    super(x, y, cid, idx);
    this.portWidth = w;
    this.portHeight = h;
  }
}

export type ChannelSegment = {
  cid: string;
  idx: number;
  start: ChannelPoint;
  end: ChannelPoint;
  width: number;
};

export abstract class ContentUnitGeneral {
  static count = 0;
  layer: string;
  abstract id: string;
  abstract get type(): string;
  abstract buildOutput(layer: string): ContentUnitOutput;
  constructor(layer: string) {
    this.layer = layer;
  }
}

export abstract class ContentUnit extends ContentUnitGeneral {
  display = true;
  constructor(layer: string) {
    super(layer);
  }
}

export abstract class BasicPart extends ContentUnit {
  id = "";
  translate = [0, 0];
  // called with paste
  abstract clone(): BasicPart;
  abstract updatePosition(x: number, y: number): void;
  setTranslate(x: number, y: number): void {
    this.translate[0] = x;
    this.translate[1] = y;
  }
  resetTranslate(): void {
    this.translate[0] = this.translate[1] = 0;
  }
}

export enum ShapeType {
  Hollow,
  Solid,
  Channel
}

export enum STLLoadingState {
  Idle,
  Loading,
  Succeed,
  Fail
}

export enum Mode {
  Select,
  Channel,
  Polygon,
  Circle,
  InletOutlet,
  Bridge,
  RoundedCorner,
  InterLayer,
  Component
}

export enum SelectionState {
  Idle,
  IsSelectingGroup,
  EditingdSingleElement,
  EditingGroup
}

export enum MouseOperation {
  Idle,
  Selecting,
  MovingElement,
  MovingBridge,
  MovingChannelVertex,
  MovingGroup,
  RotatingComponent,
  MovingPolygonVertex
}

export enum ChannelType {
  Round,
  Square
}
