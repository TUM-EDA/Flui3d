import { useContentStore } from "@/stores/content";
import { defaultPropertyStep } from "../hardCodedValues";
import ModuleTemplate from "./moduleTemplate";
import { Path } from "../primitives";
import { ModuleOutput, ModuleProperty } from "../typeDefinations";

export default class Droplet extends ModuleTemplate {
  id = "";
  properties: ModuleProperty = {
    disperseW: {
      value: 400,
      name: "Width of Disperse Channel",
      step: defaultPropertyStep,
      unit: "µm"
    },
    continuousW: {
      value: 400,
      name: "Width of Continuous Channel",
      step: defaultPropertyStep,
      unit: "µm"
    },
    dropletW: {
      value: 200,
      name: "Width of Droplet Channel",
      step: defaultPropertyStep,
      unit: "µm"
    },
    dropletL: {
      value: 360,
      name: "Length of Droplet Channel",
      step: defaultPropertyStep,
      unit: "µm"
    },
    connectionL: {
      value: 1200,
      name: "Length of Connectors",
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
    return 4;
  }
  get numberOfChannelPorts(): number {
    return 4;
  }
  get portSizeFixed(): boolean {
    return false;
  }
  static parse(content: ModuleOutput): Droplet {
    const res = new Droplet(content.position, content.layer);
    res.rotation = content.rotation;
    for (const [key, value] of Object.entries(content.properties)) {
      if (key in res.properties) {
        res.properties[key].value = value;
      } else {
        throw `invalid property ${key}`;
      }
    }
    res.updateRender();
    return res;
  }
  clone(): Droplet {
    const copy = new Droplet(this.position, this.layer, this.rotation);
    copy.properties.disperseW.value = this.properties.disperseW.value;
    copy.properties.continuousW.value = this.properties.continuousW.value;
    copy.properties.dropletW.value = this.properties.dropletW.value;
    copy.properties.height.value = this.properties.height.value;
    copy.properties.dropletL.value = this.properties.dropletL.value;
    copy.properties.connectionL.value = this.properties.connectionL.value;
    copy.updateRender();
    return copy;
  }
  setNewModuleId(): void {
    Droplet.count++;
    const contentStore = useContentStore();
    while (contentStore.contentMap.has("Droplet-" + Droplet.count)) {
      Droplet.count++;
    }
    this.id = "Droplet-" + Droplet.count;
  }

  updatePortHelper(): void {
    this.channelPorts[0].position[0] = this.position[0];
    this.channelPorts[0].position[1] = this.position[1];

    this.channelPorts[1].position[0] =
      this.position[0] + this.properties.connectionL.value;
    this.channelPorts[1].position[1] =
      this.position[1] - this.properties.connectionL.value;

    this.channelPorts[2].position[0] =
      this.position[0] +
      this.properties.connectionL.value * 2 +
      this.properties.dropletL.value;
    this.channelPorts[2].position[1] = this.position[1];

    this.channelPorts[3].position[0] =
      this.position[0] + this.properties.connectionL.value;
    this.channelPorts[3].position[1] =
      this.position[1] + this.properties.connectionL.value;

    if (this.rotation != 0) {
      const r = this.rotation;
      this.rotation = 0;
      this.setRotation(r);
    }
  }
  updateRender(): void {
    this.elementsToRender.topLeftCorner = [
      this.position[0],
      this.position[1] - this.properties.connectionL.value
    ];
    this.elementsToRender.centerPoint = [
      this.position[0] +
        this.properties.connectionL.value +
        this.properties.dropletL.value / 2,
      this.position[1]
    ];

    const continuousPath = `M ${
      this.position[0] + this.properties.connectionL.value
    } ${this.position[1] - this.properties.connectionL.value} v ${
      this.properties.connectionL.value * 2
    }`;

    const dispersePath = `M ${this.position[0]} ${this.position[1]} h ${this.properties.connectionL.value} m ${this.properties.dropletL.value} 0 h ${this.properties.connectionL.value}`;

    const dropletPath = `M ${
      this.position[0] + this.properties.connectionL.value
    } ${this.position[1]} h ${this.properties.dropletL.value}`;

    this.elementsToRender.borderShapes = [
      new Path(continuousPath, this.properties.continuousW.value, false),
      new Path(dispersePath, this.properties.disperseW.value, false),
      new Path(dropletPath, this.properties.dropletW.value, false)
    ];
    this.updatePort();
  }
}
