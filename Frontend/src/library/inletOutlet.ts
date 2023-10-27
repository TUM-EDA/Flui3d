import { useContentStore } from "@/stores/content";
import { defaultPropertyStep } from "./hardCodedValues";
import { BasicPart, ChannelPort } from "./other";
import {
  PayloadChamfer,
  PayloadCircle,
  PayloadPolygon,
  Point
} from "./payloadPrimitives";
import { BasicPartOutput } from "./typeDefinations";

export class InletOutlet extends BasicPart {
  properties = {
    r1: {
      value: 200,
      name: "Radius of Port",
      step: defaultPropertyStep,
      unit: "µm"
    },
    r2: {
      value: 400,
      name: "Radius of Chamfer",
      step: defaultPropertyStep,
      unit: "µm"
    },
    h: {
      value: 200,
      name: "Depth of Chamfer",
      step: defaultPropertyStep,
      unit: "µm"
    }
  };
  channelType: number;
  x: number;
  y: number;
  // height is dependant on the layer height

  get type(): string {
    return "inlet/outlet";
  }
  get vueComponent(): string {
    return "SvgFlowControlNodeVue";
  }
  channelPort = new ChannelPort(0, 0, "");
  private updateChannelPortPosition() {
    this.channelPort.position[0] = this.x;
    this.channelPort.position[1] = this.y;
  }
  constructor(position: number[], r1: number, t: number, layer: string) {
    super(layer);
    this.x = position[0];
    this.y = position[1];
    this.updateChannelPortPosition();
    this.channelType = t;
    this.properties.r1.value = r1;
    this.properties.r2.value = r1 + 200;
    InletOutlet.count++;
    const contentStore = useContentStore();
    while (contentStore.contentMap.has("Port-" + InletOutlet.count)) {
      InletOutlet.count++;
    }
    this.id = "Port-" + InletOutlet.count;
    this.channelPort.elementId = this.id;
  }

  static resetCount(): void {
    InletOutlet.count = 0;
  }
  static parse(content: BasicPartOutput): InletOutlet {
    const res = new InletOutlet(
      content.position,
      content.properties.r1,
      content.channelType,
      content.layer
    );
    res.properties.r2.value = content.properties.r2;
    res.properties.h.value = content.properties.h;
    res.id = res.channelPort.elementId = content.id;
    return res;
  }

  buildOutput(layer: string): BasicPartOutput {
    const properties = new Map();
    for (const [key, value] of Object.entries(this.properties)) {
      properties.set(key, value.value);
    }
    const output = {
      id: this.id,
      position: [this.x, this.y],
      properties: Object.fromEntries(properties),
      channelType: this.channelType,
      layer
    };
    return output;
  }

  clone(): InletOutlet {
    const copy = new InletOutlet(
      [this.x, this.y],
      this.properties.r1.value,
      this.channelType,
      this.layer
    );
    copy.properties.r2.value = this.properties.r2.value;
    const contenStore = useContentStore();
    contenStore.addElmentToContent(copy);
    return copy;
  }

  updatePosition(x: number, y: number): void {
    const offsetX = x - this.translate[0];
    const offsetY = y - this.translate[1];
    this.x += offsetX;
    this.y += offsetY;
    this.updateChannelPortPosition();
    this.setTranslate(x, y);
  }
  buildPayload(
    z: number,
    chipThickness: number
  ): { shapes: [PayloadCircle | PayloadPolygon, PayloadChamfer] } | void {
    const height = this.properties.h.value;
    const r1 = this.properties.r1.value;
    const r2 = this.properties.r2.value;

    const h1 = chipThickness - z - height;

    if (height > 0 && h1 > 0 && r1 > 0 && r2 > 0) {
      if (this.channelType === 0) {
        const circle = new PayloadCircle(
          new Point(this.x, this.y, z),
          false,
          h1,
          r1
        );
        const chamfer = new PayloadChamfer(
          new Point(this.x, this.y, z + h1),
          false,
          height,
          r1,
          r2
        );
        return { shapes: [circle, chamfer] };
      } else {
        const s = this.properties.r1.value;
        const p1 = new Point(this.x - s, this.y - s, z);
        const p2 = new Point(this.x + s, this.y - s, z);
        const p3 = new Point(this.x + s, this.y + s, z);
        const p4 = new Point(this.x - s, this.y + s, z);
        const poly = new PayloadPolygon([p1, p2, p3, p4], false, 0, 0, h1);
        const chamfer = new PayloadChamfer(
          new Point(this.x, this.y, z + h1),
          false,
          height,
          r1 * Math.SQRT2,
          r2
        );
        return { shapes: [poly, chamfer] };
      }
    }
  }
}
