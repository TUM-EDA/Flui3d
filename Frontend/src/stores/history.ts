import {
  BasicPart,
  ChannelPoint,
  ChannelSegment,
  ContentUnit,
  ContentUnitGeneral
} from "@/library/other";
import { defineStore } from "pinia";
import { useContentStore } from "./content";
import { useControlStore } from "./control";
import ModuleTemplate from "@/library/modules/moduleTemplate";
import { Channel } from "@/library/channel";
import { LevelConnection } from "@/library/levelConnection";
import { Bridge } from "@/library/bridge";
import { InletOutlet } from "@/library/inletOutlet";

interface Activity {
  description: string;
  undo(): void;
  redo(): void;
}

const actDescription = {
  newElm: "New ",
  move: "Move ",
  delete: "Delete ",
  moveVertex: "Move Vertex",
  setProperty: "Change Property of",
  setRotation: "Set Rotation of",
  setRoundedCorner: "Set Rounded Corners"
};
export class SetRoundedCorner implements Activity {
  oldState: { point: ChannelPoint; oldVal: number }[];
  newVal: number;
  constructor(points: ChannelPoint[], newVal: number) {
    const pre = Array<{ point: ChannelPoint; oldVal: number }>();
    points.forEach((p) => {
      pre.push({ point: p, oldVal: p.roundedRadius });
    });
    this.oldState = pre;
    this.newVal = newVal;
  }
  get description(): string {
    return `${actDescription.setRoundedCorner}`;
  }
  undo(): void {
    this.oldState.forEach((s) => {
      s.point.roundedRadius = s.oldVal;
    });
  }
  redo(): void {
    this.oldState.forEach((s) => {
      s.point.roundedRadius = this.newVal;
    });
  }
}
export class DeleteLevelAct implements Activity {
  contentStore = useContentStore();
  level: {
    height: number;
    color: string;
    label: string;
    id: string;
    contentIds: string[];
  };
  levelId: string;
  levelContent: string[];
  constructor(
    level: {
      height: number;
      color: string;
      label: string;
      id: string;
      contentIds: string[];
    },
    id: string,
    levelContent: string[]
  ) {
    this.level = level;
    this.levelId = id;
    this.levelContent = levelContent;
  }
  get description(): string {
    return `${actDescription.delete} ${this.level.label}`;
  }
  undo(): void {
    this.contentStore.layers.set(this.levelId, this.level);
  }
  redo(): void {
    this.contentStore.removeLevelSafely(this.levelId);
  }
}

export class CreateLevelAct implements Activity {
  contentStore = useContentStore();
  level: {
    height: number;
    color: string;
    label: string;
    id: string;
    contentIds: string[];
  };
  levelId: string;
  constructor(
    level: {
      height: number;
      color: string;
      label: string;
      id: string;
      contentIds: string[];
    },
    id: string
  ) {
    this.level = level;
    this.levelId = id;
  }
  get description(): string {
    return `${actDescription.newElm} ${this.level.label}`;
  }
  undo(): void {
    this.contentStore.removeLevelSafely(this.levelId);
  }
  redo(): void {
    this.contentStore.layers.set(this.levelId, this.level);
  }
}

export class SetRotationAct implements Activity {
  module: ModuleTemplate;
  offset: number;
  constructor(module: ModuleTemplate, offset: number) {
    this.module = module;
    this.offset = offset;
  }
  get description(): string {
    return `${actDescription.setRotation} ${this.module.id}`;
  }
  undo(): void {
    this.module.setRotation(this.module.rotation - this.offset);
  }

  redo(): void {
    this.module.setRotation(this.module.rotation + this.offset);
  }
}
export class ChangeChipPropertyAct implements Activity {
  property: { name: string; value: number };
  offset: number;
  constructor(prop: { name: string; value: number }, offset: number) {
    this.property = prop;
    this.offset = offset;
  }
  get description(): string {
    return `${actDescription.setProperty} Chip [${this.property.name}]`;
  }
  undo(): void {
    this.property.value -= this.offset;
  }

  redo(): void {
    this.property.value += this.offset;
  }
}

export class ChangeStringPropertyAct implements Activity {
  elm: ContentUnit;
  property: { name: string; value: string };
  oldString: string;
  newString: string;
  subAct?: Activity;
  constructor(
    elm: ContentUnit,
    prop: { name: string; value: string },
    oldString: string,
    newString: string,
    subAct?: Activity
  ) {
    this.elm = elm;
    this.property = prop;
    this.newString = newString;
    this.oldString = oldString;
    if (subAct) this.subAct = subAct;
  }

  get description(): string {
    return `${actDescription.setProperty} ${this.elm.id} [${this.property.name}]`;
  }

  rerenderIfIsModule(): void {
    if (this.elm instanceof ModuleTemplate) {
      this.elm.updateRender();
    }
  }
  undo(): void {
    this.property.value = this.oldString;
    this.rerenderIfIsModule();
    if (this.subAct) {
      this.subAct.undo();
    }
  }

  redo(): void {
    this.property.value = this.newString;
    this.rerenderIfIsModule();
    if (this.subAct) {
      this.subAct.redo();
    }
  }
}

export class ChangeContentUnitPropertyAct extends ChangeChipPropertyAct {
  elm: ContentUnitGeneral;
  subAct?: Activity;
  constructor(
    elm: ContentUnitGeneral,
    prop: { name: string; value: number },
    offset: number,
    subAct?: Activity
  ) {
    super(prop, offset);
    this.elm = elm;
    if (subAct) this.subAct = subAct;
  }
  get description(): string {
    return `${actDescription.setProperty} ${this.elm.id} [${this.property.name}]`;
  }
  rerenderIfIsModule(): void {
    if (this.elm instanceof ModuleTemplate) {
      this.elm.updateRender();
    }
  }
  undo(): void {
    this.property.value -= this.offset;
    this.rerenderIfIsModule();
    if (this.subAct) {
      this.subAct.undo();
    }
  }

  redo(): void {
    this.property.value += this.offset;
    this.rerenderIfIsModule();
    if (this.subAct) {
      this.subAct.redo();
    }
  }
}

export class SetChannelSize implements Activity {
  channel: Channel;
  offsetW: number;
  offsetH: number;
  constructor(channel: Channel, offsetW: number, offsetH: number) {
    this.channel = channel;
    this.offsetW = offsetW;
    this.offsetH = offsetH;
  }
  get description(): string {
    return actDescription.setProperty + "[channel size] " + this.channel.id;
  }
  undo(): void {
    this.channel.properties.channelWidth.value -= this.offsetW;
    this.channel.properties.channelHeight.value -= this.offsetH;
  }

  redo(): void {
    this.channel.properties.channelWidth.value += this.offsetW;
    this.channel.properties.channelHeight.value += this.offsetH;
  }
}
export class MovePolygonVertexAct implements Activity {
  offsetX: number;
  offsetY: number;
  polygonPoint: number[];
  constructor(oldPos: number[], point: number[]) {
    this.offsetX = point[0] - oldPos[0];
    this.offsetY = point[1] - oldPos[1];
    this.polygonPoint = point;
  }

  get description(): string {
    return actDescription.moveVertex;
  }

  undo(): void {
    this.polygonPoint[0] -= this.offsetX;
    this.polygonPoint[1] -= this.offsetY;
  }

  redo(): void {
    this.polygonPoint[0] += this.offsetX;
    this.polygonPoint[1] += this.offsetY;
  }
}

export class MoveChannelVertexAct implements Activity {
  oldPos: number[];
  newPos: number[];
  connectedToPortBefore: boolean;
  connectedToPortAfter: boolean;
  channelPoint: ChannelPoint;
  setChannelSize: undefined | SetChannelSize;
  constructor(
    oldPos: number[],
    channelPoint: ChannelPoint,
    connectedToPortBefore: boolean,
    connectedToPortAfter: boolean,
    setChannelSize = undefined
  ) {
    this.oldPos = oldPos;
    this.newPos = channelPoint.position;
    this.connectedToPortBefore = connectedToPortBefore;
    this.connectedToPortAfter = connectedToPortAfter;
    this.channelPoint = channelPoint;
    this.setChannelSize = setChannelSize;
  }

  get description(): string {
    return actDescription.moveVertex;
  }

  undo(): void {
    this.channelPoint.position = this.oldPos;
    this.channelPoint.isConnectedToPort = this.connectedToPortBefore;
    if (this.setChannelSize) {
      this.setChannelSize.undo();
    }
  }

  redo(): void {
    this.channelPoint.position = this.newPos;
    this.channelPoint.isConnectedToPort = this.connectedToPortAfter;
    if (this.setChannelSize) {
      this.setChannelSize.redo();
    }
  }
}

export class MoveBridgeAct implements Activity {
  oldChannelSeg: ChannelSegment;
  newChannelSeg: ChannelSegment;
  oldPosOnSeg: number;
  newPosOnSeg: number;
  element: Bridge;
  constructor(elm: Bridge, oldChannelSeg: ChannelSegment, oldPos: number) {
    this.element = elm;
    this.oldChannelSeg = oldChannelSeg;
    this.oldPosOnSeg = oldPos;
    this.newChannelSeg = this.element.channelSegment;
    this.newPosOnSeg = this.element.posOnSeg;
  }

  get description(): string {
    return actDescription.move + this.element.id;
  }

  undo(): void {
    this.element.channelSegment = this.oldChannelSeg;
    this.element.posOnSeg = this.oldPosOnSeg;
  }

  redo(): void {
    this.element.channelSegment = this.newChannelSeg;
    this.element.posOnSeg = this.newPosOnSeg;
  }
}

export class MoveModuleAct implements Activity {
  offsetX: number;
  offsetY: number;
  element: ModuleTemplate;
  constructor(elm: ModuleTemplate, x: number, y: number) {
    this.element = elm;
    this.offsetX = x;
    this.offsetY = y;
  }

  get description(): string {
    return actDescription.move + this.element.id;
  }

  undo(): void {
    this.element.setTranslate(-this.offsetX, -this.offsetY);
    this.element.updatePosition();
  }

  redo(): void {
    this.element.setTranslate(this.offsetX, this.offsetY);
    this.element.updatePosition();
  }
}

export class MoveNodeElmAct implements Activity {
  offsetX: number;
  offsetY: number;
  element: BasicPart;
  constructor(elm: BasicPart, x: number, y: number) {
    this.element = elm;
    this.offsetX = x;
    this.offsetY = y;
  }

  get description(): string {
    return actDescription.move + this.element.id;
  }

  undo(): void {
    this.element.updatePosition(-this.offsetX, -this.offsetY);
    this.element.resetTranslate();
  }

  redo(): void {
    this.element.updatePosition(this.offsetX, this.offsetY);
    this.element.resetTranslate();
  }
}

export class MoveGroupAct implements Activity {
  offsetX: number;
  offsetY: number;
  group: Array<ContentUnit>;
  constructor(group: Array<ContentUnit>, x: number, y: number) {
    this.group = group;
    this.offsetX = x;
    this.offsetY = y;
  }
  get description(): string {
    return actDescription.move + "group";
  }

  undo(): void {
    this.group.forEach((elm) => {
      if (
        elm instanceof Channel ||
        elm instanceof LevelConnection ||
        elm instanceof InletOutlet
      ) {
        elm.updatePosition(-this.offsetX, -this.offsetY);
        elm.resetTranslate();
      } else if (elm instanceof ModuleTemplate) {
        elm.setTranslate(-this.offsetX, -this.offsetY);
        elm.updatePosition();
      }
    });
  }

  redo(): void {
    this.group.forEach((elm) => {
      if (
        elm instanceof Channel ||
        elm instanceof LevelConnection ||
        elm instanceof InletOutlet
      ) {
        elm.updatePosition(this.offsetX, this.offsetY);
        elm.resetTranslate();
      } else if (elm instanceof ModuleTemplate) {
        elm.setTranslate(this.offsetX, this.offsetY);
        elm.updatePosition();
      }
    });
  }
}

export class DeleteBasicElmAct implements Activity {
  element: ContentUnitGeneral;
  level: string;
  constructor(elm: ContentUnitGeneral, lv: string) {
    this.element = elm;
    this.level = lv;
  }

  get description(): string {
    return actDescription.delete + this.element.id;
  }

  undo(): void {
    if (this.element instanceof Bridge) {
      this.element.show = true;
    } else if (this.element instanceof ContentUnit) {
      this.element.display = true;
    }
  }

  redo(): void {
    if (this.element instanceof Bridge) {
      this.element.show = false;
    } else if (this.element instanceof ContentUnit) {
      this.element.display = false;
    }
  }
}

// bridges not included
export class DeleteGroupAct implements Activity {
  group: ContentUnit[];
  level: string;
  constructor(elm: ContentUnit[], lv: string) {
    this.group = elm;
    this.level = lv;
  }

  get description(): string {
    return actDescription.delete + "group";
  }

  undo(): void {
    this.group.forEach((elm) => {
      elm.display = true;
    });
  }

  redo(): void {
    this.group.forEach((elm) => {
      elm.display = false;
    });
  }
}

export class PasteAct extends DeleteGroupAct {
  constructor(elm: ContentUnit[], lv: string) {
    super(elm, lv);
  }
  get description(): string {
    return "Paste";
  }

  undo(): void {
    this.group.forEach((elm) => {
      elm.display = false;
    });
  }

  redo(): void {
    this.group.forEach((elm) => {
      elm.display = true;
    });
  }
}

export class BasicElementAct implements Activity {
  contentStore = useContentStore();
  controlStore = useControlStore();
  element: ContentUnit;
  level: string;
  constructor(elm: ContentUnit, lv: string) {
    this.element = elm;
    this.level = lv;
  }

  get description(): string {
    return actDescription.newElm + this.element.id;
  }

  undo(): void {
    if (
      this.element.id === this.contentStore.crtId ||
      this.contentStore.crtGroupId.indexOf(this.element.id) >= 0
    ) {
      this.controlStore.resetFlags();
    }
    if (this.element.type === "level connection") {
      this.contentStore.levelConnectionIds.pop();
    } else {
      this.contentStore.getLevelElmIds(this.level)?.pop();
    }
    this.contentStore.contentMap.delete(this.element.id);
  }

  redo(): void {
    if (this.element.type === "level connection") {
      this.contentStore.levelConnectionIds.push(this.element.id);
    } else {
      this.contentStore.getLevelElmIds(this.level)?.push(this.element.id);
    }

    this.contentStore.contentMap.set(this.element.id, this.element);
  }
}

export const useHistoryStore = defineStore("history", {
  state: () => ({
    activities: Array<Activity>(),
    position: -1, // index of the newest activity already done
    actLenMax: 50
  }),
  actions: {
    setPosition(n: number) {
      while (n > this.position) {
        this.redo();
      }
      while (n < this.position) {
        this.undo();
      }
    },

    baforeAddingNewActivity() {
      if (this.position < this.activities.length - 1) {
        this.activities = this.activities.slice(0, this.position + 1);
      } else if (this.activities.length == this.actLenMax) {
        this.activities.shift();
        this.position -= 1;
      }
    },

    addActivity(act: Activity) {
      this.baforeAddingNewActivity();
      this.activities.push(act);
      this.position += 1;
    },

    undo() {
      if (this.position >= 0) {
        const undoAct = this.activities[this.position];
        this.position -= 1;
        undoAct.undo();
      }
    },

    redo() {
      if (this.position < this.activities.length - 1) {
        this.position += 1;
        const redoAct = this.activities[this.position];
        redoAct.redo();
      }
    }
  }
});
