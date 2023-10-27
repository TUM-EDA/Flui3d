import { useContentStore } from "@/stores/content";
import { buildChannelPayload } from "./utilities/channelPayloadBuilder";
import { defaultPropertyStep } from "./hardCodedValues";
import { InletOutlet } from "./inletOutlet";
import { LevelConnection } from "./levelConnection";
import ModuleTemplate from "./modules/moduleTemplate";
import { BasicPart, ChannelPoint } from "./other";
import { PayloadChannel } from "./payloadPrimitives";
import { ChannelOutput, ChannelPointOutput } from "./typeDefinations";

export class Channel extends BasicPart {
  channelDef = Array<ChannelPoint>();
  properties = {
    channelWidth: {
      value: 0,
      name: "Channel Width",
      step: defaultPropertyStep,
      unit: "µm"
    },
    channelHeight: {
      value: 0,
      name: "Channel Height",
      step: defaultPropertyStep,
      unit: "µm"
    }
  };
  static resetCount(): void {
    Channel.count = 0;
  }

  static parse(content: ChannelOutput): Channel {
    const contentStore = useContentStore();
    try {
      const channel = new Channel(
        content.channelWidth,
        content.channelHeight,
        content.layer
      );
      channel.id = content.id;
      Channel.count++;
      // Build channeDef
      content.channelPoints.forEach((point: ChannelPointOutput) => {
        const channelPoint = new ChannelPoint(point.position);
        channelPoint.roundedRadius = point.roundedRadius;
        channelPoint.isConnectedToPort = point.isConnectedToPort;
        if (point.isConnectedToPort) {
          try {
            const elm = contentStore.getElement(
              point.connectedPort.connectedPortElement
            );
            if (elm instanceof ModuleTemplate) {
              channelPoint.connectedPort =
                  elm.channelPorts[point.connectedPort.connectedPortIndex];
              channelPoint.position =
                elm.channelPorts[
                  point.connectedPort.connectedPortIndex
                ].position;
            } else if (
              elm instanceof LevelConnection ||
              elm instanceof InletOutlet
            ) {
              channelPoint.connectedPort = elm.channelPort;
              channelPoint.position = elm.channelPort.position;
            }
          } catch (err) {
            console.log(err);
            console.log("invalid port");
            channelPoint.isConnectedToPort = false;
          }
        }
        channel.channelDef.push(channelPoint);
      });
      return channel;
    } catch (err) {
      console.log(err);
      throw "invalid channel content";
    }
  }

  buildOutput(layer: string): ChannelOutput {
    const channelPoints = Array<ChannelPointOutput>();
    this.channelDef.forEach((point) => {
      channelPoints.push(point.buildOutput());
    });
    const content = {
      id: this.id,
      channelWidth: this.properties.channelWidth.value,
      channelHeight: this.properties.channelHeight.value,
      channelPoints,
      layer
    };
    return content;
  }

  get type(): string {
    return "channel";
  }
  get vueComponent(): string {
    return "SvgChannelVue";
  }
  constructor(
    channelWidth: number,
    channelHeight: number,
    layer: string,
    firstPoint?: ChannelPoint
  ) {
    super(layer);
    if (firstPoint) {
      this.channelDef.push(firstPoint);
    }
    this.properties.channelWidth.value = channelWidth;
    this.properties.channelHeight.value = channelHeight;
  }
  getHeight(): number {
    return this.properties.channelHeight.value;
  }

  newId(): string {
    Channel.count++;
    const contentStore = useContentStore();
    while (contentStore.contentMap.has("Channel-" + Channel.count)) {
      Channel.count++;
    }
    return "Channel-" + Channel.count;
  }

  setId(): void {
    this.id = this.newId();
  }

  clonePoint(point: ChannelPoint, id: string, idx: number): ChannelPoint {
    return point.clone(id, this.properties.channelWidth.value, idx);
  }

  clone(): Channel {
    // assume bridges are bound to starting channel point
    // clone all the points
    const id = this.newId();
    const copy = new Channel(
      this.properties.channelWidth.value,
      this.properties.channelHeight.value,
      this.layer
    );
    copy.id = id;
    const contentStore = useContentStore();
    contentStore.addElmentToContent(copy);
    this.channelDef.forEach((p, idx) => {
      copy.channelDef.push(this.clonePoint(p, id, idx));
    });

    // then set bridge ends
    for (let i = 0; i < this.channelDef.length - 1; ++i) {
      copy.channelDef[i].bridges.forEach((b) => {
        b.channelSegment.end = copy.channelDef[i + 1];
      });
    }
    return copy;
  }

  updatePosition(x: number, y: number): void {
    const offsetX = x - this.translate[0];
    const offsetY = y - this.translate[1];
    this.channelDef.forEach((p) => {
      if (!p.isConnectedToPort) {
        p.position[0] += offsetX;
        p.position[1] += offsetY;
      }
    });
    this.setTranslate(x, y);
  }
  resetBridges(): void {
    this.channelDef.forEach((point) => {
      point.resetBridges();
    });
  }

  buildPayload(z: number, hOffset: number): PayloadChannel {
    const channelHeight = this.properties.channelHeight.value + hOffset;
    return buildChannelPayload(this, z + channelHeight / 2, channelHeight);
  }
}
