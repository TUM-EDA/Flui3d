import { ModuleOutput, ModuleProperty, Shape } from "../typeDefinations";
import { ChannelPort, ChannelPortWithSize, ContentUnit } from "../other";
import { PayloadChannel, PayloadShape } from "../payloadPrimitives";
import { ComponentObject } from "../typeDefinations";
import { Path } from "../primitives";

const initializeChannelPortsWithoutSize = (m: ModuleTemplate) => {
  for (let i = 0; i < m.numberOfChannelPorts; i++) {
    m.channelPorts.push(new ChannelPort(0, 0, m.id, i));
  }
};

// set size separately in updatePortHelper(), or override this function if size is fixed for all instances
const initializeChannelPortsWithSize = (m: ModuleTemplate) => {
  for (let i = 0; i < m.numberOfChannelPorts; i++) {
    m.channelPorts.push(new ChannelPortWithSize(0, 0, m.id, i, 0, 0));
  }
};

export default abstract class ModuleTemplate extends ContentUnit {
  translate = [0, 0]; // for temporary position
  position: number[];
  rotation: number;
  abstract id: string;
  // abstract properties: { height: { value: number; name: string } };
  abstract properties: ModuleProperty;
  // isRotatable = true;
  abstract get numberOfChannelPorts(): number;
  get type(): string {
    return "module";
  }
  elementsToRender = {
    topLeftCorner: [0, 0], // for mask boundary
    centerPoint: [0, 0], // as rotation origin
    borderShapes: Array<Shape>(),
    maskShapes: Array<Shape>() // mask elements
  };
  channelPorts = Array<ChannelPort | ChannelPortWithSize>();
  static count = 0;

  constructor(pos: number[], layer: string, rotation = 0) {
    super(layer);
    this.position = [...pos];
    this.rotation = rotation;
  }

  abstract updateRender(): void;
  abstract updatePortHelper(): void;
  abstract clone(): ModuleTemplate;
  abstract setNewModuleId(): void;
  abstract get getModuleIndex(): number;
  abstract get portSizeFixed(): boolean;

  getHeight(): number {
    return this.properties.height.value;
  }

  buildOutput(layer: string): ModuleOutput {
    const properties = new Map();
    for (const [key, value] of Object.entries(this.properties)) {
      properties.set(key, value.value);
    }
    return {
      id: this.id,
      position: this.position,
      rotation: this.rotation,
      properties: Object.fromEntries(properties),
      moduleIdx: this.getModuleIndex,
      layer
    };
  }

  updatePort(): void {
    if (this.channelPorts.length === this.numberOfChannelPorts) {
      this.updatePortHelper();
    }
  }

  initializeChannelPorts(): void {
    if (this.portSizeFixed) {
      initializeChannelPortsWithSize(this);
    } else {
      initializeChannelPortsWithoutSize(this);
    }
  }

  updatePosition(): void {
    this.position[0] += this.translate[0];
    this.position[1] += this.translate[1];
    this.translate = [0, 0];
    this.updateRender();
  }

  setTranslate(tx: number, ty: number): void {
    // set channel ports accordingly
    this.channelPorts.forEach((p) => {
      p.position[0] += tx - this.translate[0];
      p.position[1] += ty - this.translate[1];
    });
    this.translate[0] = tx;
    this.translate[1] = ty;
  }

  setRotation(r: number): void {
    // counterclockwise rotation
    // make sure translate == [0, 0]
    // set channel ports accordingly
    const radius = ((r - this.rotation) / 180) * Math.PI;
    const cosR = Math.cos(radius);
    const sinR = Math.sin(radius);
    this.channelPorts.forEach((p) => {
      const x0 = p.position[0] - this.elementsToRender.centerPoint[0];
      const y0 = p.position[1] - this.elementsToRender.centerPoint[1];
      const x1 = x0 * cosR - y0 * sinR;
      const y1 = x0 * sinR + y0 * cosR;
      p.position[0] = x1 + this.elementsToRender.centerPoint[0];
      p.position[1] = y1 + this.elementsToRender.centerPoint[1];
    });
    this.rotation = r;
  }

  buildPayload(z: number, hOffset: number): ComponentObject {
    let shapes = Array<PayloadShape>();
    const channels = Array<PayloadChannel>();
    this.elementsToRender.borderShapes.forEach((elm) => {
      if (elm instanceof Path) {
        channels.push(
          elm.buildPayload(
            z,
            this.properties.height.value + hOffset,
            this.translate,
            this.rotation,
            this.elementsToRender.centerPoint
          )
        );
      } else {
        const ss = elm.buildPayload(
          z,
          this.properties.height.value + hOffset,
          this.translate,
          this.rotation,
          this.elementsToRender.centerPoint
        );
        if (ss) shapes = shapes.concat(ss);
      }
    });
    this.elementsToRender.maskShapes.forEach((elm) => {
      if (elm instanceof Path) {
        channels.push(
          elm.buildPayload(
            z,
            this.properties.height.value + hOffset,
            this.translate,
            this.rotation,
            this.elementsToRender.centerPoint
          )
        );
      } else {
        const ss = elm.buildPayload(
          z,
          this.properties.height.value + hOffset,
          this.translate,
          this.rotation,
          this.elementsToRender.centerPoint
        );
        if (ss) shapes = shapes.concat(ss);
      }
    });
    return {
      id: this.id,
      shapes: shapes,
      channels: channels,
      ports: Array<string>()
    };
  }
}
