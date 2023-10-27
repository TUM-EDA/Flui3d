import ModuleTemplate from "./moduleTemplate";
import { Polygon, Path } from "../primitives";
import { ChannelPortWithSize } from "../other";
import { defaultPropertyStep } from "../hardCodedValues";
import { ModuleProperty } from "../typeDefinations";
import { useContentStore } from "@/stores/content";

export default class TransitionWidth extends ModuleTemplate {
  id = "";
  properties: ModuleProperty = {
    transitionL: {
      value: 400,
      name: "Transition Length",
      step: defaultPropertyStep,
      unit: "µm"
    },
    width1: {
      value: 400,
      name: "Transition Width Left",
      step: defaultPropertyStep,
      unit: "µm"
    },
    width2: {
      value: 200,
      name: "Transition Width Right",
      step: defaultPropertyStep,
      unit: "µm"
    },
    connectionL: {
      value: 400,
      name: "Connection Channel Length",
      step: defaultPropertyStep,
      unit: "µm"
    },
    height: {
      value: 400,
      name: "Module Height",
      step: defaultPropertyStep,
      unit: "µm"
    }
  };
  widthMax: number;

  constructor(position: number[], layer: string, rotation = 0) {
    super(position, layer, rotation);
    const w1 = this.properties.width1.value;
    const w2 = this.properties.width2.value;
    this.widthMax = Math.max(w1, w2);
    this.updateRender();
  }
  get getModuleIndex(): number {
    return 5;
  }
  get numberOfChannelPorts(): number {
    return 2;
  }
  get portSizeFixed(): boolean {
    return true;
  }

  clone(): TransitionWidth {
    const copy = new TransitionWidth(this.position, this.layer, this.rotation);
    copy.properties.transitionL.value = this.properties.transitionL.value;
    copy.properties.width1.value = this.properties.width1.value;
    copy.properties.width2.value = this.properties.width2.value;
    copy.properties.height.value = this.properties.height.value;
    copy.properties.connectionL.value = this.properties.connectionL.value;
    return copy;
  }
  setNewModuleId(): void {
    TransitionWidth.count++;
    const contentStore = useContentStore();
    while (
      contentStore.contentMap.has("TransitionWidth-" + TransitionWidth.count)
    ) {
      TransitionWidth.count++;
    }
    this.id = "TransitionWidth-" + TransitionWidth.count;
  }

  updatePortHelper(): void {
    this.channelPorts[0].position[0] = this.position[0];
    this.channelPorts[0].position[1] = this.position[1];

    this.channelPorts[1].position[0] =
      this.position[0] +
      this.properties.transitionL.value +
      this.properties.connectionL.value * 2;
    this.channelPorts[1].position[1] = this.position[1];

    if (this.channelPorts[0] instanceof ChannelPortWithSize) {
      this.channelPorts[0].portWidth = this.properties.width1.value;
      this.channelPorts[0].portHeight = this.properties.height.value;
    }

    if (this.channelPorts[1] instanceof ChannelPortWithSize) {
      this.channelPorts[1].portWidth = this.properties.width2.value;
      this.channelPorts[1].portHeight = this.properties.height.value;
    }

    if (this.rotation != 0) {
      const r = this.rotation;
      this.rotation = 0;
      this.setRotation(r);
    }
  }
  updateRender(): void {
    this.widthMax = Math.max(
      this.properties.width1.value,
      this.properties.width2.value
    );
    this.elementsToRender.topLeftCorner = [
      this.position[0],
      this.position[1] - this.widthMax / 2
    ];
    this.elementsToRender.centerPoint = [
      this.position[0] +
        this.properties.transitionL.value / 2 +
        this.properties.connectionL.value,
      this.position[1]
    ];

    const points = [
      [
        this.position[0] + this.properties.connectionL.value,
        this.position[1] + this.properties.width1.value / 2
      ],
      [
        this.position[0] + this.properties.connectionL.value,
        this.position[1] - this.properties.width1.value / 2
      ],
      [
        this.position[0] +
          this.properties.connectionL.value +
          this.properties.transitionL.value,
        this.position[1] - this.properties.width2.value / 2
      ],
      [
        this.position[0] +
          this.properties.connectionL.value +
          this.properties.transitionL.value,
        this.position[1] + this.properties.width2.value / 2
      ]
    ];
    this.elementsToRender.borderShapes = [new Polygon(points, false)];
    if (this.properties.connectionL.value > 0) {
      const connection1 = `M ${this.position[0]} ${this.position[1]} h ${this.properties.connectionL.value}`;
      const connection2 = `M ${
        this.position[0] +
        this.properties.connectionL.value +
        this.properties.transitionL.value
      } ${this.position[1]} h ${this.properties.connectionL.value}`;
      this.elementsToRender.borderShapes.push(
        new Path(connection1, this.properties.width1.value, false)
      );
      this.elementsToRender.borderShapes.push(
        new Path(connection2, this.properties.width2.value, false)
      );
    }

    this.updatePort();
  }
}
