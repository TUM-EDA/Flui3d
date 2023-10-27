import { useContentStore } from "@/stores/content";
import { defaultPropertyStep } from "../hardCodedValues";
import ModuleTemplate from "./moduleTemplate";
import { Rectangle } from "../primitives";
import { ModuleProperty } from "../typeDefinations";

export default class Chamber extends ModuleTemplate {
  id = "";
  properties: ModuleProperty = {
    lengthX: {
      value: 4000,
      name: "Length",
      step: defaultPropertyStep,
      unit: "µm"
    },
    lengthY: {
      value: 3200,
      name: "Width",
      step: defaultPropertyStep,
      unit: "µm"
    },
    cornerRadius: {
      value: 400,
      name: "Border Radius",
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

  clone(): Chamber {
    const copy = new Chamber(this.position, this.layer, this.rotation);
    copy.properties.lengthX.value = this.properties.lengthX.value;
    copy.properties.lengthY.value = this.properties.lengthY.value;
    copy.properties.cornerRadius.value = this.properties.cornerRadius.value;
    copy.properties.height.value = this.properties.height.value;
    return copy;
  }

  setNewModuleId(): void {
    Chamber.count++;
    const contentStore = useContentStore();
    while (contentStore.contentMap.has("Chamber-" + Chamber.count)) {
      Chamber.count++;
    }
    this.id = "Chamber-" + Chamber.count;
  }

  get getModuleIndex(): number {
    return 0;
  }
  get numberOfChannelPorts(): number {
    return 4;
  }
  get portSizeFixed(): boolean {
    return false;
  }

  //   2
  // 0   1
  //   3

  updatePortHelper(): void {
    this.channelPorts[0].position[0] = this.elementsToRender.topLeftCorner[0];
    this.channelPorts[0].position[1] = this.elementsToRender.centerPoint[1];
    this.channelPorts[1].position[0] =
      this.elementsToRender.topLeftCorner[0] + this.properties.lengthX.value;
    this.channelPorts[1].position[1] = this.elementsToRender.centerPoint[1];

    this.channelPorts[2].position[0] = this.elementsToRender.centerPoint[0];
    this.channelPorts[2].position[1] = this.elementsToRender.topLeftCorner[1];
    this.channelPorts[3].position[0] = this.elementsToRender.centerPoint[0];
    this.channelPorts[3].position[1] =
      this.elementsToRender.topLeftCorner[1] + this.properties.lengthY.value;
    if (this.rotation != 0) {
      const r = this.rotation;
      this.rotation = 0;
      this.setRotation(r);
    }
  }
  updateRender(): void {
    // Rotation may affect the result!!!
    // 1. set rotation = 0
    // 2. calculate new conterPoint
    // 3. resume rotation
    this.elementsToRender.topLeftCorner = [
      this.position[0],
      this.position[1] - this.properties.lengthY.value / 2
    ];
    this.elementsToRender.centerPoint = [
      this.position[0] + this.properties.lengthX.value / 2,
      this.position[1]
    ];
    this.elementsToRender.borderShapes = [
      new Rectangle(
        this.position[0],
        this.position[1] - this.properties.lengthY.value / 2,
        this.properties.cornerRadius.value,
        this.properties.lengthX.value,
        this.properties.lengthY.value,
        false
      )
    ];
    this.updatePort();
  }
}
