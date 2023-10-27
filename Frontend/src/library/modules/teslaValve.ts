import { useContentStore } from "@/stores/content";
import { defaultPropertyStep } from "../hardCodedValues";
import ModuleTemplate from "./moduleTemplate";
import { Path } from "../primitives";
import { ModuleProperty } from "../typeDefinations";

export default class TeslaValve extends ModuleTemplate {
  id = "";
  properties: ModuleProperty = {
    channelWidth: {
      value: 400,
      name: "Channel Width",
      step: defaultPropertyStep,
      unit: "µm"
    },
    segPairNum: {
      value: 2,
      name: "Number of Segment Pairs",
      step: 1,
      unit: ""
    },
    segLenX: {
      value: 2000,
      name: "Segment Length",
      step: defaultPropertyStep,
      unit: "µm"
    },
    segLenY: {
      value: 1200,
      name: "Segment Width",
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

  get getModuleIndex(): number {
    return 3;
  }
  get numberOfChannelPorts(): number {
    return 2;
  }
  get portSizeFixed(): boolean {
    return false;
  }

  clone(): TeslaValve {
    const copy = new TeslaValve(this.position, this.layer, this.rotation);
    copy.properties.channelWidth.value = this.properties.channelWidth.value;
    copy.properties.segPairNum.value = this.properties.segPairNum.value;
    copy.properties.segLenX.value = this.properties.segLenX.value;
    copy.properties.height.value = this.properties.height.value;
    copy.properties.segLenY.value = this.properties.segLenY.value;
    copy.updateRender();
    return copy;
  }
  setNewModuleId(): void {
    TeslaValve.count++;
    const contentStore = useContentStore();
    while (contentStore.contentMap.has("TeslaValve-" + TeslaValve.count)) {
      TeslaValve.count++;
    }
    this.id = "TeslaValve-" + TeslaValve.count;
  }

  updatePortHelper(): void {
    this.channelPorts[0].position[0] = this.position[0];
    this.channelPorts[0].position[1] = this.position[1];
    this.channelPorts[1].position[0] =
      this.position[0] +
      this.properties.segLenX.value * this.properties.segPairNum.value * 2 +
      this.properties.segLenY.value / 2;
    this.channelPorts[1].position[1] = this.position[1];

    if (this.rotation != 0) {
      const r = this.rotation;
      this.rotation = 0;
      this.setRotation(r);
    }
  }
  updateRender(): void {
    this.elementsToRender.topLeftCorner = [
      this.position[0],
      this.position[1] - this.properties.segLenY.value
    ];
    this.elementsToRender.centerPoint = [
      this.position[0] +
        this.properties.segLenX.value * this.properties.segPairNum.value +
        this.properties.segLenY.value / 4,
      this.position[1]
    ];

    const r = this.properties.segLenY.value / 2;

    let pathDef = `M${this.position[0]} ${this.position[1]}`;
    const rep = `l${this.properties.segLenX.value} ${-r} a${r} ${r} 0 0 1 0 ${
      this.properties.segLenY.value
    } m${-this.properties.segLenX.value} ${-r} l${
      this.properties.segLenX.value * 2
    } ${this.properties.segLenY.value} a${r} ${r} 0 0 0 0 ${-this.properties
      .segLenY.value} m${-this.properties.segLenX.value} ${r} l${
      this.properties.segLenX.value
    } ${-r}`;
    pathDef += rep.repeat(this.properties.segPairNum.value);
    pathDef += `l${r} 0`;

    this.elementsToRender.borderShapes = [
      new Path(pathDef, this.properties.channelWidth.value, false)
    ];
    this.updatePort();
  }
}
