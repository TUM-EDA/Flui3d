import ModuleTemplate from "./moduleTemplate";
import { Polygon, Path, pointTransform } from "../primitives";
import { ChannelPortWithSize } from "../other";
import { ComponentObject, ModuleProperty } from "../typeDefinations";
import {
  PayloadChannel,
  PayloadPolygon,
  PayloadShape,
  Point
} from "../payloadPrimitives";
import { defaultPropertyStep } from "../hardCodedValues";
import { useContentStore } from "@/stores/content";

export default class TransitionHeight extends ModuleTemplate {
  id = "";
  properties: ModuleProperty = {
    transitionL: {
      value: 400,
      name: "Transition Length",
      step: defaultPropertyStep,
      unit: "µm"
    },
    height: {
      value: 400,
      name: "Transition Height Left",
      step: defaultPropertyStep,
      unit: "µm"
    },
    height_after: {
      value: 200,
      name: "Transition Height Right",
      step: defaultPropertyStep,
      unit: "µm"
    },
    connectionL: {
      value: 400,
      name: "Connection Channel Length",
      step: defaultPropertyStep,
      unit: "µm"
    },
    width: {
      value: 400,
      name: "Transition Width",
      step: defaultPropertyStep,
      unit: "µm"
    }
  };
  get getModuleIndex(): number {
    return 6;
  }
  get numberOfChannelPorts(): number {
    return 2;
  }
  get portSizeFixed(): boolean {
    return true;
  }

  getHeight(): number {
    return Math.max(
      this.properties.height.value,
      this.properties.height_after.value
    );
  }

  clone(): TransitionHeight {
    const copy = new TransitionHeight(this.position, this.layer, this.rotation);
    copy.properties.transitionL.value = this.properties.transitionL.value;
    copy.properties.height.value = this.properties.height.value;
    copy.properties.height_after.value = this.properties.height_after.value;
    copy.properties.width.value = this.properties.width.value;
    copy.properties.connectionL.value = this.properties.connectionL.value;
    return copy;
  }
  setNewModuleId(): void {
    TransitionHeight.count++;
    const contentStore = useContentStore();
    while (
      contentStore.contentMap.has("TransitionHeight-" + TransitionHeight.count)
    ) {
      TransitionHeight.count++;
    }
    this.id = "TransitionHeight-" + TransitionHeight.count;
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
      this.channelPorts[0].portWidth = this.properties.width.value;
      this.channelPorts[0].portHeight = this.properties.height.value;
    }

    if (this.channelPorts[1] instanceof ChannelPortWithSize) {
      this.channelPorts[1].portWidth = this.properties.width.value;
      this.channelPorts[1].portHeight = this.properties.height_after.value;
    }

    if (this.rotation != 0) {
      const r = this.rotation;
      this.rotation = 0;
      this.setRotation(r);
    }
  }
  updateRender(): void {
    this.elementsToRender.topLeftCorner = [
      this.position[0],
      this.position[1] - this.properties.width.value / 2
    ];
    this.elementsToRender.centerPoint = [
      this.position[0] +
        this.properties.transitionL.value / 2 +
        this.properties.connectionL.value,
      this.position[1]
    ];

    // 1--2
    // 0--3
    const points = [
      [
        this.position[0] + this.properties.connectionL.value,
        this.position[1] + this.properties.width.value / 2
      ],
      [
        this.position[0] + this.properties.connectionL.value,
        this.position[1] - this.properties.width.value / 2
      ],
      [
        this.position[0] +
          this.properties.connectionL.value +
          this.properties.transitionL.value,
        this.position[1] - this.properties.width.value / 2
      ],
      [
        this.position[0] +
          this.properties.connectionL.value +
          this.properties.transitionL.value,
        this.position[1] + this.properties.width.value / 2
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
        new Path(connection1, this.properties.width.value, false)
      );
      this.elementsToRender.borderShapes.push(
        new Path(connection2, this.properties.width.value, false)
      );
    }

    this.updatePort();
  }

  //override
  buildPayload(z: number): ComponentObject {
    const shapes = Array<PayloadShape>();
    const channels = Array<PayloadChannel>();
    const toBuild = this.elementsToRender.borderShapes;
    if (toBuild[0] instanceof Polygon) {
      const p1 = pointTransform(
        this.position[0] + this.properties.connectionL.value,
        this.position[1] - this.properties.width.value / 2,
        this.translate,
        this.rotation,
        this.elementsToRender.centerPoint
      );
      const p2 = pointTransform(
        this.position[0] +
          this.properties.connectionL.value +
          this.properties.transitionL.value,
        this.position[1] - this.properties.width.value / 2,
        this.translate,
        this.rotation,
        this.elementsToRender.centerPoint
      );
      const p3 = pointTransform(
        this.position[0] + this.properties.connectionL.value,
        this.position[1] + this.properties.width.value / 2,
        this.translate,
        this.rotation,
        this.elementsToRender.centerPoint
      );
      const v1 = new Point(p1[0], p1[1], z);
      const v2 = new Point(p2[0], p2[1], z);
      const v3 = new Point(
        p2[0],
        p2[1],
        z + this.properties.height_after.value
      );
      const v4 = new Point(p1[0], p1[1], z + this.properties.height.value);
      shapes.push(
        new PayloadPolygon(
          [v1, v2, v3, v4],
          false,
          p3[0] - p1[0],
          p3[1] - p1[1],
          0
        )
      );
    }
    if (toBuild[1] instanceof Path)
      channels.push(
        toBuild[1].buildPayload(
          z,
          this.properties.height.value,
          this.translate,
          this.rotation,
          this.elementsToRender.centerPoint
        )
      );
    if (toBuild[2] instanceof Path)
      channels.push(
        toBuild[2].buildPayload(
          z,
          this.properties.height_after.value,
          this.translate,
          this.rotation,
          this.elementsToRender.centerPoint
        )
      );
    return {
      id: this.id,
      shapes: shapes,
      channels: channels,
      ports: Array<string>()
    };
  }
}
