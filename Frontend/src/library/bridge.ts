// unlike other parts, bridges are dependant on the channel on which it was placed (width, rotation, etc)

import { useContentStore } from "@/stores/content";
import { Channel } from "./channel";
import { defaultPropertyStep } from "./hardCodedValues";
import { ChannelPoint, ChannelSegment, ContentUnitGeneral } from "./other";
import { Bridgeoutput } from "./typeDefinations";
const dummyChannelPoint = new ChannelPoint([0, 0]);
// to maintain this connection, a bridge only knows which channel segment it is bound to
export class Bridge extends ContentUnitGeneral {
  id = "";
  // x: number;
  // y: number;
  // width: number;
  channelSegment: ChannelSegment;
  posOnSeg: number; // 0 <= value <= 1, indecate the relative position on the channel segment
  properties = {
    height: {
      value: 800,
      name: "Height",
      step: defaultPropertyStep,
      unit: "µm"
    },
    slopeL: {
      value: 30,
      name: "Left Slope",
      step: 1,
      unit: "°"
    },
    slopeR: {
      value: 30,
      name: "Right Slope",
      step: 1,
      unit: "°"
    },

    roundedRadius: {
      value: 400,
      name: "Rounded Radius",
      step: defaultPropertyStep,
      unit: "µm"
    }
  };
  static parse(content: Bridgeoutput): Bridge {
    const contentStore = useContentStore();
    const channel = contentStore.getElement(content.connectedChannel);
    const start = channel.channelDef[content.startPointIdx];
    const end = channel.channelDef[content.startPointIdx + 1];
    const channelSegment = {
      cid: content.connectedChannel,
      idx: content.startPointIdx,
      start,
      end,
      width: channel.properties.channelWidth.value
    };
    const res = new Bridge(channelSegment, content.position, content.layer);
    res.id = content.id;
    return res;
  }
  static resetCount(): void {
    Bridge.count = 0;
  }
  getHeight(): number {
    const contentStore = useContentStore();
    const c = contentStore.getElement(this.channelSegment.cid);
    return (
      this.properties.height.value + (c instanceof Channel ? c.getHeight() : 0)
    );
  }

  buildOutput(layer: string): Bridgeoutput {
    const properties = new Map();
    for (const [key, value] of Object.entries(this.properties)) {
      properties.set(key, value.value);
    }
    const output = {
      id: this.id,
      position: this.posOnSeg,
      connectedChannel: this.channelSegment.cid,
      startPointIdx: this.channelSegment.idx,
      properties: Object.fromEntries(properties),
      layer
    };
    return output;
  }

  show = true;

  get type(): string {
    return "bridge";
  }
  get vueComponent(): string {
    return "SvgBridgeVue";
  }
  get display(): boolean {
    const contentStore = useContentStore();
    const c = contentStore.getElement(this.channelSegment.cid);
    return c instanceof Channel && c.display && this.show;
  }
  static count = 0;
  constructor(cs: ChannelSegment, pos: number, layer: string) {
    super(layer);
    this.channelSegment = cs;
    this.posOnSeg = pos;
    Bridge.count++;
    const contentStore = useContentStore();
    while (contentStore.contentMap.has("Bridge-" + Bridge.count)) {
      Bridge.count++;
    }
    this.id = "Bridge-" + Bridge.count;
  }

  // channel seg end is a place holder
  makeCopy(
    start: ChannelPoint,
    cid: string,
    width: number,
    idx: number
  ): Bridge {
    return new Bridge(
      { start, cid, width, end: dummyChannelPoint, idx },
      this.posOnSeg,
      this.layer
    );
  }
}
