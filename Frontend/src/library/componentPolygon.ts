import { useContentStore } from "@/stores/content";
import { defaultPropertyStep } from "./hardCodedValues";
import { BasicPart, ShapeType } from "./other";
import { PayloadChannel, PayloadShape } from "./payloadPrimitives";
import {
  buildPayloadPathPrimitive,
  buildPayloadPolygonPrimitive
} from "./primitives";
import { ComponentObject, PolygonOutput } from "./typeDefinations";

export default class ComponentPolygon extends BasicPart {
  points = Array<number[]>();
  properties = {
    radius: {
      value: 0,
      name: "Corner radius",
      step: defaultPropertyStep,
      unit: "µm"
    },
    channelWidth: {
      value: 400,
      name: "Channel (stroke) width of hollow polygon",
      step: defaultPropertyStep,
      unit: "µm"
    },
    height: {
      value: 400,
      name: "Height",
      step: defaultPropertyStep,
      unit: "µm"
    }
  };
  shapeType: ShapeType;

  get type(): string {
    return "polygon";
  }
  get vueComponent(): string {
    return "SvgPolygonVue";
  }
  constructor(
    channelWidth: number,
    h: number,
    shapeType: ShapeType,
    layer: string,
    firstPoint?: number[]
  ) {
    super(layer);
    if (firstPoint) {
      this.points.push(firstPoint);
    }
    this.properties.height.value = h;
    this.properties.channelWidth.value = channelWidth;
    this.shapeType = shapeType;
  }
  static resetCount(): void {
    ComponentPolygon.count = 0;
  }
  static parse(content: PolygonOutput): ComponentPolygon {
    const res = new ComponentPolygon(
      content.properties.channelWidth,
      content.properties.height,
      content.shapeType,
      content.layer
    );
    res.points = content.points;
    res.id = content.id;
    return res;
  }
  buildOutput(layer: string): PolygonOutput {
    const properties = new Map();
    for (const [key, value] of Object.entries(this.properties)) {
      properties.set(key, value.value);
    }
    const output = {
      id: this.id,
      properties: Object.fromEntries(properties),
      points: this.points,
      layer,
      shapeType: this.shapeType
    };
    return output;
  }

  newId(): string {
    ComponentPolygon.count++;
    const contentStore = useContentStore();
    while (contentStore.contentMap.has("Polygon-" + ComponentPolygon.count)) {
      ComponentPolygon.count++;
    }
    return "Polygon-" + ComponentPolygon.count;
  }

  setId(): void {
    this.id = this.newId();
  }

  clone(): ComponentPolygon {
    const id = this.newId();
    const copy = new ComponentPolygon(
      this.properties.channelWidth.value,
      this.properties.height.value,
      this.shapeType,
      this.layer
    );
    copy.id = id;
    const contentStore = useContentStore();
    contentStore.addElmentToContent(copy);
    this.points.forEach((p) => {
      copy.points.push(p.slice());
    });
    return copy;
  }

  updatePosition(x: number, y: number): void {
    const offsetX = x - this.translate[0];
    const offsetY = y - this.translate[1];
    this.points.forEach((p) => {
      p[0] += offsetX;
      p[1] += offsetY;
    });
    this.setTranslate(x, y);
  }

  buildPayload(z: number, hOffset: number): ComponentObject {
    const comp = {
      id: this.id,
      shapes: Array<PayloadShape>(),
      channels: Array<PayloadChannel>(),
      ports: Array<string>()
    };
    switch (this.shapeType) {
      case ShapeType.Solid: {
        const shapes = buildPayloadPolygonPrimitive(
          this.points,
          true,
          this.properties.radius.value,
          z,
          this.properties.height.value + hOffset,
          [0, 0],
          0,
          [0, 0]
        );
        if (shapes) comp.shapes = shapes;
        break;
      }
      case ShapeType.Hollow: {
        const shapes = buildPayloadPolygonPrimitive(
          this.points,
          false,
          this.properties.radius.value,
          z,
          this.properties.height.value + hOffset,
          [0, 0],
          0,
          [0, 0]
        );
        if (shapes) comp.shapes = shapes;
        break;
      }
      case ShapeType.Channel: {
        const contentStore = useContentStore();
        const d = contentStore.polygonPathDefinition(
          this.points,
          this.properties.radius.value
        );
        const channelHeight = this.properties.height.value + hOffset;
        const channel = buildPayloadPathPrimitive(
          d,
          z + channelHeight / 2,
          channelHeight,
          this.properties.channelWidth.value,
          [0, 0],
          0,
          [0, 0]
        );
        comp.channels.push(channel);
        break;
      }
    }
    return comp;
  }
}
