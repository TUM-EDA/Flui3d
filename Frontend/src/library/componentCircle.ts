import { defaultPropertyStep } from "./hardCodedValues";
import { BasicPart, ShapeType } from "./other";
import { ComponentCircleOutput, ComponentObject } from "./typeDefinations";
import { useContentStore } from "../stores/content";
import {
  PayloadChannel,
  PayloadCircle,
  PayloadShape,
  Point
} from "./payloadPrimitives";

export default class ComponentCircle extends BasicPart {
  x: number;
  y: number;
  properties = {
    radius: {
      value: 1000,
      name: "Radius",
      step: defaultPropertyStep,
      unit: "µm"
    },
    height: {
      value: 400,
      name: "Component height",
      step: defaultPropertyStep,
      unit: "µm"
    },
    channelWidth: {
      value: 400,
      name: "Channel (stroke) width of hollow circle",
      step: defaultPropertyStep,
      unit: "µm"
    }
  };
  shapeType: ShapeType;
  get type(): string {
    return "circle";
  }
  get vueComponent(): string {
    return "SvgCircleVue";
  }
  constructor(
    position: number[],
    r: number,
    shapeType: ShapeType,
    layer: string
  ) {
    super(layer);
    this.x = position[0];
    this.y = position[1];
    this.properties.radius.value = r;
    this.shapeType = shapeType;
    ComponentCircle.count++;
    const contentStore = useContentStore();
    while (contentStore.contentMap.has("Circle-" + ComponentCircle.count)) {
      ComponentCircle.count++;
    }
    this.id = "Circle-" + ComponentCircle.count;
  }
  static resetCount(): void {
    ComponentCircle.count = 0;
  }

  static parse(content: ComponentCircleOutput): ComponentCircle {
    const res = new ComponentCircle(
      content.position,
      content.properties.radius,
      content.shapeType,
      content.layer
    );
    res.id = content.id;
    res.properties.height.value = content.properties.height;
    return res;
  }

  buildOutput(layer: string): ComponentCircleOutput {
    const properties = new Map();
    for (const [key, value] of Object.entries(this.properties)) {
      properties.set(key, value.value);
    }
    const output = {
      id: this.id,
      position: [this.x, this.y],
      properties: Object.fromEntries(properties),
      layer,
      shapeType: this.shapeType
    };
    return output;
  }

  clone(): ComponentCircle {
    const copy = new ComponentCircle(
      [this.x, this.y],
      this.properties.radius.value,
      this.shapeType,
      this.layer
    );
    copy.shapeType = this.shapeType;
    const contenStore = useContentStore();
    contenStore.addElmentToContent(copy);
    return copy;
  }

  updatePosition(x: number, y: number): void {
    const offsetX = x - this.translate[0];
    const offsetY = y - this.translate[1];
    this.x += offsetX;
    this.y += offsetY;
    this.setTranslate(x, y);
  }
  buildPayload(z: number, hOffset: number): ComponentObject | void {
    const r = this.properties.radius.value;
    const h = this.properties.height.value + hOffset;
    if (r > 0 && h > 0) {
      const comp = {
        id: this.id,
        shapes: Array<PayloadShape>(),
        channels: Array<PayloadChannel>(),
        ports: Array<string>()
      };
      switch (this.shapeType) {
        case ShapeType.Solid: {
          const circle = new PayloadCircle(
            new Point(this.x, this.y, z),
            true,
            h,
            r
          );
          comp.shapes.push(circle);
          break;
        }
        case ShapeType.Hollow: {
          const circle = new PayloadCircle(
            new Point(this.x, this.y, z),
            false,
            h,
            r
          );
          comp.shapes.push(circle);
          break;
        }
        case ShapeType.Channel: {
          // 2 circles
          const cw = this.properties.channelWidth.value;
          if (cw > 0) {
            const c1 = new PayloadCircle(
              new Point(this.x, this.y, z),
              false,
              h,
              r + cw / 2
            );
            const c2 = new PayloadCircle(
              new Point(this.x, this.y, z),
              true,
              h,
              r - cw / 2
            );
            comp.shapes.push(c1);
            comp.shapes.push(c2);
          }
        }
      }

      return comp;
    }
  }
}
