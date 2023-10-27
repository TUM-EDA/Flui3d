import { useContentStore } from "@/stores/content";
import { defaultPropertyStep } from "../hardCodedValues";
import ModuleTemplate from "./moduleTemplate";
import { Path } from "../primitives";
import { ModuleProperty } from "../typeDefinations";

export default class DelayChannel extends ModuleTemplate {
  id = "";
  properties: ModuleProperty = {
    width: {
      value: 4000,
      name: "Width",
      step: defaultPropertyStep,
      unit: "µm"
    },
    channelWidth: {
      value: 400,
      name: "Channel Width",
      step: defaultPropertyStep,
      unit: "µm"
    },
    channelDist: {
      value: 800,
      name: "Channel Distance",
      step: defaultPropertyStep,
      unit: "µm"
    },
    turningsNum: { value: 4, name: "Number of Turnings", step: 1, unit: "" },
    turningRadius: {
      value: 400,
      name: "Turning Radius",
      step: defaultPropertyStep,
      unit: "µm"
    },
    portLength: {
      value: 500,
      name: "Length of connection channel",
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
    return 2;
  }
  get numberOfChannelPorts(): number {
    return 2;
  }
  get portSizeFixed(): boolean {
    return false;
  }

  clone(): DelayChannel {
    const copy = new DelayChannel(this.position, this.layer, this.rotation);
    copy.properties.channelWidth.value = this.properties.channelWidth.value;
    copy.properties.channelDist.value = this.properties.channelDist.value;
    copy.properties.width.value = this.properties.width.value;
    copy.properties.turningsNum.value = this.properties.turningsNum.value;
    copy.properties.height.value = this.properties.height.value;
    copy.properties.turningRadius.value = this.properties.turningRadius.value;
    copy.properties.portLength.value = this.properties.portLength.value;
    return copy;
  }
  setNewModuleId(): void {
    DelayChannel.count++;
    const contentStore = useContentStore();
    while (contentStore.contentMap.has("DelayChannel-" + DelayChannel.count)) {
      DelayChannel.count++;
    }
    this.id = "DelayChannel-" + DelayChannel.count;
  }

  updatePortHelper(): void {
    this.channelPorts[0].position[0] = this.position[0];
    this.channelPorts[0].position[1] = this.position[1];
    this.channelPorts[1].position[0] =
      this.position[0] +
      this.properties.channelDist.value * this.properties.turningsNum.value +
      this.properties.portLength.value * 2;
    this.channelPorts[1].position[1] = this.position[1];

    if (this.rotation != 0) {
      const r = this.rotation;
      this.rotation = 0;
      this.setRotation(r);
    }
  }
  updateRender(): void {
    // fix invalid properties
    // this.properties.channelWidth.value / 2 <= r <= this.properties.channelDist.value/ 2

    // this.properties.turningRadius.value =
    //   this.properties.turningRadius.value <
    //   this.properties.channelWidth.value / 2
    //     ? this.properties.channelWidth.value / 2
    //     : this.properties.turningRadius.value >
    //       this.properties.channelDist.value / 2
    //     ? this.properties.channelDist.value / 2
    //     : this.properties.turningRadius.value;

    if (this.properties.turningsNum.value < 1)
      this.properties.turningsNum.value = 1;

    const r = this.properties.turningRadius.value;
    const pl = this.properties.portLength.value;
    const x = pl - this.properties.channelWidth.value / 2;
    this.elementsToRender.topLeftCorner = [
      this.position[0] - this.properties.channelWidth.value / 2,
      this.position[1] -
        this.properties.width.value / 2 -
        this.properties.channelWidth.value / 2
    ];
    this.elementsToRender.centerPoint = [
      this.position[0] +
        (this.properties.channelDist.value *
          this.properties.turningsNum.value) /
          2 +
        r +
        (x > 0 ? pl : 0),
      this.position[1]
    ];
    // length of vertical lines
    const h = this.properties.width.value - 2 * r;

    const hHalf = h / 2 - r;
    const dist = this.properties.channelDist.value - r * 2;
    let pathDef = `M ${this.position[0]} ${this.position[1]}`;
    if (pl > this.properties.channelWidth.value / 2)
      pathDef += `h${pl >= r ? pl - r : pl}`;
    pathDef +=
      r > 0 && pl >= r
        ? `a${r} ${r} 0 0 0 ${r} ${-r} v${-hHalf}`
        : `v${-h / 2}`;
    const rep =
      r > 0
        ? `a${r} ${r} 0 0 1 ${r} ${-r} h${dist} a${r} ${r} 0 0 1 ${r} ${r} v${h} a${r} ${r} 0 0 0 ${r} ${r} h${dist}  a${r} ${r} 0 0 0 ${r} ${-r} v${-h}`
        : `h${dist} v${h} h${dist} v${-h}`;
    pathDef += rep.repeat((this.properties.turningsNum.value - 1) / 2);
    pathDef +=
      r > 0
        ? `a${r} ${r} 0 0 1 ${r} ${-r} h${dist} a${r} ${r} 0 0 1 ${r} ${r}`
        : `h${dist}`;
    if (this.properties.turningsNum.value % 2) {
      pathDef +=
        r > 0 && pl >= r ? `v${hHalf} a${r} ${r} 0 0 0 ${r} ${r}` : `v${h / 2}`;
    } else {
      pathDef +=
        r > 0 && pl >= r
          ? `v${h} a${r} ${r} 0 0 0 ${r} ${r} h${dist} a${r} ${r} 0 0 0 ${r} ${-r} v${-hHalf} a${r} ${r} 0 0 1 ${r} ${-r}`
          : `v${h} a${r} ${r} 0 0 0 ${r} ${r} h${dist} a${r} ${r} 0 0 0 ${r} ${-r} v${
              -h / 2
            }`;
    }
    if (pl > this.properties.channelWidth.value / 2)
      pathDef += `h${pl >= r ? pl - r : pl}`;
    this.elementsToRender.borderShapes = [
      new Path(pathDef, this.properties.channelWidth.value, false)
    ];
    this.updatePort();
  }
}
