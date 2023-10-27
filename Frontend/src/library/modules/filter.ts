import { Rectangle, Circle } from "../primitives";
import ModuleTemplate from "./moduleTemplate";
import { defaultPropertyStep } from "../hardCodedValues";
import { ModuleOutput, ModuleProperty, Shape } from "../typeDefinations";
import { useContentStore } from "@/stores/content";

export default class Filter extends ModuleTemplate {
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
    pillarRow: { value: 3, name: "Number of pillar rows", step: 1, unit: "" },
    pillarCol: {
      value: 4,
      name: "Number of Pillar Columns",
      step: 1,
      unit: ""
    },
    pillarRadius: {
      value: 200,
      name: "Pillar Radius",
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
    return 1;
  }
  get numberOfChannelPorts(): number {
    return 4;
  }
  get portSizeFixed(): boolean {
    return false;
  }
  static parse(content: ModuleOutput): Filter {
    const res = new Filter(content.position, content.layer);
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
  clone(): Filter {
    const copy = new Filter(this.position, this.layer, this.rotation);
    copy.properties.lengthX.value = this.properties.lengthX.value;
    copy.properties.lengthY.value = this.properties.lengthY.value;
    copy.properties.cornerRadius.value = this.properties.cornerRadius.value;
    copy.properties.pillarRow.value = this.properties.pillarRow.value;
    copy.properties.pillarCol.value = this.properties.pillarCol.value;
    copy.properties.pillarRadius.value = this.properties.pillarRadius.value;
    copy.properties.height.value = this.properties.height.value;
    return copy;
  }
  setNewModuleId(): void {
    Filter.count++;
    const contentStore = useContentStore();
    while (contentStore.contentMap.has("Filter-" + Filter.count)) {
      Filter.count++;
    }
    this.id = "Filter-" + Filter.count;
  }
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

    // compute mask
    const maskShapes = Array<Shape>();
    const startX =
      (this.properties.lengthX.value -
        this.properties.pillarRadius.value *
          2 *
          this.properties.pillarCol.value) /
        (this.properties.pillarCol.value + 1) +
      this.properties.pillarRadius.value;
    const stepX = startX + this.properties.pillarRadius.value;
    const pillarX = Array.from(
      { length: this.properties.pillarCol.value },
      (_, i) => this.elementsToRender.topLeftCorner[0] + startX + i * stepX
    );
    const startY =
      (this.properties.lengthY.value -
        this.properties.pillarRadius.value *
          2 *
          this.properties.pillarRow.value) /
        (this.properties.pillarRow.value + 1) +
      this.properties.pillarRadius.value;
    const stepY = startY + this.properties.pillarRadius.value;
    const pillarY = Array.from(
      { length: this.properties.pillarRow.value },
      (_, i) => this.elementsToRender.topLeftCorner[1] + startY + i * stepY
    );
    pillarX.forEach((x) => {
      pillarY.forEach((y) => {
        maskShapes.push(
          new Circle(x, y, this.properties.pillarRadius.value, true)
        );
      });
    });
    this.elementsToRender.maskShapes = maskShapes;
    this.updatePort();
  }
}
