import { useContentStore } from "@/stores/content";
import { defaultPropertyStep } from "./hardCodedValues";
import { BasicPart, ChannelPort } from "./other";
import { PayloadCircle, PayloadPolygon, Point } from "./payloadPrimitives";
import { BasicPartOutput } from "./typeDefinations";

export class LevelConnection extends BasicPart {
  properties = {
    r: {
      value: 200,
      name: "Connection Channel Radius",
      step: defaultPropertyStep,
      unit: "µm"
    },
    // id of the start level
    startLv: {
      value: "",
      name: "From"
    },
    // id of the terminal level
    endLv: {
      value: "",
      name: "To"
    }
  };
  x: number;
  y: number;
  channelType: number;

  get type(): string {
    return "level connection";
  }
  get vueComponent(): string {
    return "SvgLevelConnectionVue";
  }
  channelPort = new ChannelPort(0, 0, "");
  private updateChannelPortPosition() {
    this.channelPort.position[0] = this.x;
    this.channelPort.position[1] = this.y;
  }
  constructor(
    position: number[],
    r: number,
    s: string,
    t: string,
    shape: number
  ) {
    super("");
    this.x = position[0];
    this.y = position[1];
    this.updateChannelPortPosition();
    this.properties.r.value = r;
    this.properties.startLv.value = s;
    this.properties.endLv.value = t;
    this.channelType = shape;
    LevelConnection.count++;
    const contentStore = useContentStore();
    while (contentStore.contentMap.has("Via-" + LevelConnection.count)) {
      LevelConnection.count++;
    }
    this.id = "Via-" + LevelConnection.count;
    this.channelPort.elementId = this.id;
  }
  static resetCount(): void {
    LevelConnection.count = 0;
  }
  static parse(content: BasicPartOutput): LevelConnection {
    const res = new LevelConnection(
      content.position,
      content.properties.r,
      content.properties.startLv,
      content.properties.endLv,
      content.channelType
    );
    res.id = res.channelPort.elementId = content.id;
    return res;
  }

  buildOutput(): BasicPartOutput {
    const properties = new Map();
    for (const [key, value] of Object.entries(this.properties)) {
      properties.set(key, value.value);
    }
    const output = {
      id: this.id,
      position: [this.x, this.y],
      properties: Object.fromEntries(properties),
      channelType: this.channelType,
      layer: this.layer
    };
    return output;
  }

  clone(): LevelConnection {
    const copy = new LevelConnection(
      [this.x, this.y],
      this.properties.r.value,
      this.properties.startLv.value,
      this.properties.endLv.value,
      this.channelType
    );
    const contentStore = useContentStore();
    contentStore.addElmentToContent(copy);
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
    calculateLocalCompensation: (z: number) => number
  ): { shapes: [PayloadCircle | PayloadPolygon] } | undefined {
    const contentStore = useContentStore();
    const r = this.properties.r.value;
    let h1 = contentStore.getLevelHeight(this.properties.startLv.value);
    let h2 = contentStore.getLevelHeight(this.properties.endLv.value);

    if (h1 !== undefined && h2 !== undefined && r > 0) {
      if (h1 > h2) {
        [h1, h2] = [h2, h1];
      }
      const hOffset = calculateLocalCompensation(h1);
      h1 -= hOffset;
      // round
      if (this.channelType === 0) {
        const p = new PayloadCircle(
          new Point(this.x, this.y, h1),
          false,
          h2 - h1,
          r
        );
        return { shapes: [p] };
      } else {
        // square
        const p1 = new Point(this.x - r, this.y - r, h1);
        const p2 = new Point(this.x + r, this.y - r, h1);
        const p3 = new Point(this.x + r, this.y + r, h1);
        const p4 = new Point(this.x - r, this.y + r, h1);
        const p = new PayloadPolygon([p1, p2, p3, p4], false, 0, 0, h2 - h1);
        return { shapes: [p] };
      }
    }
  }
}
