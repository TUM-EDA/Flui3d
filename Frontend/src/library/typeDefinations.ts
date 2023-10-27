import { ShapeType } from "./other";
import {
  PayloadShape,
  PayloadCircle,
  PayloadChamfer,
  PayloadPolygon,
  PayloadChannel
} from "./payloadPrimitives";
import { Circle, Path, Polygon, Rectangle } from "./primitives";

type ComponentObject = {
  id: string;
  shapes: PayloadShape[];
  ports: string[];
  channels: PayloadChannel[];
};

type CrossLayerConnection = {
  shapes: [PayloadCircle | PayloadPolygon, PayloadChamfer?];
};

type Shape = Rectangle | Circle | Polygon | Path;

type Property = {
  name: string;
  value: number;
  step: number;
  unit: "µm" | "" | "°";
};

type ModuleProperty = {
  [key: string]: Property;
  height: Property;
};

type ChannelPointOutput = {
  position: number[];
  isConnectedToPort: boolean;
  roundedRadius: number;
  connectedPort: {
    connectedPortElement: string;
    connectedPortIndex: number;
  };
};

type ChannelOutput = {
  id: string;
  channelWidth: number;
  channelHeight: number;
  channelPoints: ChannelPointOutput[];
  layer: string;
};

type PolygonOutput = {
  id: string;
  properties: any;
  points: number[][];
  layer: string;
  shapeType: ShapeType;
};

type ComponentCircleOutput = {
  id: string;
  position: number[];
  properties: any;
  layer: string;
  shapeType: ShapeType;
};

type BasicPartOutput = {
  id: string;
  position: number[];
  properties: any;
  layer: string;
  channelType: number;
};

type Bridgeoutput = {
  id: string;
  position: number;
  connectedChannel: string;
  startPointIdx: number;
  properties: any;
  layer: string;
};

type ModuleOutput = {
  id: string;
  position: number[];
  rotation: number;
  properties: { [key: string]: number };
  moduleIdx: number;
  layer: string;
};

type ContentUnitOutput =
  | ChannelOutput
  | PolygonOutput
  | BasicPartOutput
  | Bridgeoutput
  | ModuleOutput
  | ComponentCircleOutput;

type PayloadLayer = {
  elevation: number;
  components: ComponentObject[];
  channels: PayloadChannel[];
  compensation?: PayloadPolygon;
};

export {
  ComponentObject,
  CrossLayerConnection,
  Shape,
  ModuleProperty,
  ContentUnitOutput,
  ChannelPointOutput,
  ChannelOutput,
  PolygonOutput,
  BasicPartOutput,
  Bridgeoutput,
  ModuleOutput,
  ComponentCircleOutput,
  PayloadLayer
};
