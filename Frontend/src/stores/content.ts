import { defineStore } from "pinia";
import { useControlStore } from "./control";
import {
  ChannelSegment,
  ChannelPoint,
  ContentUnit,
  BasicPart,
  ContentUnitGeneral,
  STLLoadingState,
  Mode
} from "../library/other";
import {
  CreateLevelAct,
  useHistoryStore,
  DeleteLevelAct,
  PasteAct
} from "./history";
import {
  defaultPropertyStep,
  layerColorDefault,
  postUrl
} from "@/library/hardCodedValues";
import ModuleTemplate from "@/library/modules/moduleTemplate";
import { Channel } from "@/library/channel";
import { Bridge } from "@/library/bridge";
import { LevelConnection } from "@/library/levelConnection";
import { InletOutlet } from "@/library/inletOutlet";
import { buildRequestBody } from "@/library/utilities/payloadBuilder";
import { useMoudleStore } from "./module";
const sweepingFlag = (a: number[], b: number[], p: number[]) => {
  const x = (p[1] - a[1]) * (b[0] - a[0]) - (p[0] - a[0]) * (b[1] - a[1]);
  return x > 0 ? 0 : 1;
};
const getChannelSegDefinition = (
  A: number[],
  B: number[],
  C: number[],
  r: number,
  command?: string
) => {
  const AB = [B[0] - A[0], B[1] - A[1]];
  const AC = [C[0] - A[0], C[1] - A[1]];
  const dAB = Math.sqrt(AB[0] ** 2 + AB[1] ** 2);
  const dAC = Math.sqrt(AC[0] ** 2 + AC[1] ** 2);
  const cosA = (AB[0] * AC[0] + AB[1] * AC[1]) / (dAB * dAC);
  const tanAHalf = Math.sqrt((1 - cosA) / (1 + cosA));
  const d0 = r / tanAHalf;
  command = command ? command : "L";
  if (d0 > dAB || d0 > dAC) {
    return ` ${command} ${A[0]} ${A[1]}`;
  } else {
    const ratio1 = d0 / dAB;
    const ratio2 = d0 / dAC;
    const p1 = [A[0] + AB[0] * ratio1, A[1] + AB[1] * ratio1];
    const p2 = [A[0] + AC[0] * ratio2, A[1] + AC[1] * ratio2];
    const flag = sweepingFlag(B, C, A);
    return ` ${command} ${p1[0]} ${p1[1]} A ${r} ${r} 0 0 ${flag} ${p2[0]} ${p2[1]}`;
  }
};

export const useContentStore = defineStore("content", {
  state: () => ({
    title: "my_new_design",
    crtLayer: "Lv0",
    levelCount: 1,
    layers: new Map([
      [
        "Lv0",
        {
          height: 200,
          color: "#0d6efd",
          label: "Lv0",
          id: "Lv0",
          contentIds: Array<string>()
        }
      ]
    ]),
    contentMap: new Map(),
    chipProperties: [
      {
        name: "Device Length",
        value: 20000,
        step: defaultPropertyStep,
        unit: "µm"
      },
      {
        name: "Device Width",
        value: 15000,
        step: defaultPropertyStep,
        unit: "µm"
      },
      {
        name: "Device Thickness",
        value: 4000,
        step: defaultPropertyStep,
        unit: "µm"
      },
      {
        name: "Channel Width",
        value: 400,
        step: defaultPropertyStep,
        unit: "µm"
      },
      {
        name: "Module Height",
        value: 400,
        step: defaultPropertyStep,
        unit: "µm"
      },
      {
        name: "Layer Distance",
        value: 600,
        step: defaultPropertyStep,
        unit: "µm"
      },
      { name: "Number of Levels", value: 1, step: 1, unit: "" },
      {
        name: "Bottom Layer Elevation",
        value: 200,
        step: defaultPropertyStep,
        unit: "µm"
      }
    ],
    defaultChipProperties: [20000, 15000, 4000, 400, 400, 600, 1, 200], //hard coded
    stlData: new ArrayBuffer(0),
    stlLoadingState: STLLoadingState.Idle,
    crtId: "",
    levelConnectionIds: Array<string>(),
    crtGroupId: Array<string>(),
    clipboard: Array<ContentUnit>(),
    showRadiusInput: false
  }),
  getters: {
    editingNodeElement(): boolean {
      return (
        this.crtElement instanceof LevelConnection ||
        this.crtElement instanceof InletOutlet
      );
    },
    maxLevelHeight(state) {
      return state.chipProperties[2].value - state.chipProperties[4].value;
    },
    heightOfCrtLayer(state) {
      return state.layers.get(state.crtLayer)?.height;
    },
    colorOfCrtLayer(state) {
      return state.layers.get(state.crtLayer)?.color;
    },
    crtLayerIds(state) {
      return state.layers.get(state.crtLayer)?.contentIds;
    },
    crtElement(state) {
      if (state.crtId !== "") return state.contentMap.get(state.crtId);
      else return null;
    },
    chipThickness(state) {
      return state.chipProperties[2].value;
    },
    chipLengthX(state) {
      return state.chipProperties[0].value;
    },
    chipLengthY(state) {
      return state.chipProperties[1].value;
    },
    defaultChannelWidth(state) {
      return state.chipProperties[3].value;
    },
    defaultModuleHeight(state) {
      return state.chipProperties[4].value;
    },
    bottomElevation(state) {
      return state.chipProperties[7].value;
    },
    crtNodeElmRadiusProperty(): { value: number } {
      if (this.crtElement instanceof LevelConnection) {
        return this.crtElement.properties.r;
      } else if (this.crtElement instanceof InletOutlet) {
        return this.crtElement.properties.r1;
      } else {
        throw "invalid element";
      }
    },

    // these two getters can be repleced with a state that mutates when a channel is added or deleted
    channelSegmentsForBridgePlacement(state) {
      // console.log("updating channel segments");
      const channelSeg = Array<ChannelSegment>();
      state.layers.get(state.crtLayer)?.contentIds.forEach((id) => {
        if (id !== this.crtId) {
          const channel = state.contentMap.get(id);
          if (channel instanceof Channel && channel.display) {
            for (let i = 0; i < channel.channelDef.length - 1; ++i) {
              channelSeg.push({
                cid: channel.id,
                idx: i,
                start: channel.channelDef[i],
                end: channel.channelDef[i + 1],
                width: channel.properties.channelWidth.value
              });
            }
          }
        }
      });
      return channelSeg;
    },
    channelPointsCanBeRounded(state) {
      // console.log("computing roundable channel point");
      return state.layers.get(state.crtLayer)?.contentIds.reduce((pre, id) => {
        const c = state.contentMap.get(id);
        if (c instanceof Channel) {
          const end = c.channelDef.length - 1;
          return pre.concat(c.channelDef.slice(1, end));
        } else return pre;
      }, Array<ChannelPoint>());
    }
  },
  actions: {
    // for both hollow and solid polygons
    polygonPathDefinition(points: number[][], r?: number): string {
      try {
        if (points.length < 3) {
          throw "polygon has <3 vertices";
        }
        let d = "";
        if (r && r > 0) {
          let A = points[0];
          let B = points[points.length - 1];
          let C = points[1];
          d += getChannelSegDefinition(A, B, C, r, "M");
          for (let i = 1; i < points.length; i++) {
            B = A;
            A = C;
            C = points[(i + 1) % points.length];
            d += getChannelSegDefinition(A, B, C, r);
          }
        } else {
          d += `M ${points[0][0]} ${points[0][1]}`;
          for (let i = 1; i < points.length; i++) {
            d += ` L ${points[i][0]} ${points[i][1]}`;
          }
        }
        return d + "Z";
      } catch (err) {
        console.log(err);
        return "";
      }
    },
    channelDefinition(channel: Channel): string {
      try {
        if (channel.channelDef.length < 2) {
          throw `${channel.id} has <2 vertices`;
        }
        const controlStore = useControlStore();
        let d = `M ${channel.channelDef[0].position[0]} ${channel.channelDef[0].position[1]}`;
        for (let i = 1; i < channel.channelDef.length - 1; i++) {
          if (
            channel.channelDef[i].isSelected ||
            channel.channelDef[i].roundedRadius > 0
          ) {
            const r = channel.channelDef[i].isSelected
              ? controlStore.roundedChannelRadius
              : channel.channelDef[i].roundedRadius;
            const A = channel.channelDef[i].position;
            const B = channel.channelDef[i - 1].position;
            const C = channel.channelDef[i + 1].position;
            d += getChannelSegDefinition(A, B, C, r);
          } else {
            d += ` L ${channel.channelDef[i].position[0]} ${channel.channelDef[i].position[1]}`;
          }
        }
        d += ` L ${
          channel.channelDef[channel.channelDef.length - 1].position[0]
        } ${channel.channelDef[channel.channelDef.length - 1].position[1]}`;
        return d;
      } catch (err) {
        console.log(err);
        return "";
      }
    },
    paste() {
      if (this.clipboard.length > 0) {
        const controlStore = useControlStore();
        if (controlStore.mode === Mode.Select && this.clipboard.length > 0) {
          this.crtGroupId = Array<string>();
          const group = Array<ContentUnit>();
          this.clipboard.forEach((elm) => {
            if (elm instanceof BasicPart || elm instanceof ModuleTemplate) {
              const copy = elm.clone();
              if (copy instanceof ModuleTemplate) {
                copy.setNewModuleId();
                copy.initializeChannelPorts();
                this.addToContent(copy);
                this.crtLayerIds?.push(copy.id);
                // move by offset
                copy.setTranslate(1000, 1000);
                copy.updatePosition();
              } else {
                copy.updatePosition(1000, 1000);
                copy.resetTranslate();
              }
              copy.layer = this.crtLayer;
              this.crtGroupId.push(copy.id);
              group.push(copy);
            }
          });
          const history = useHistoryStore();
          history.addActivity(new PasteAct(group, this.crtLayer));
          controlStore.setGroupSelect();
        }
      }
    },
    copy() {
      this.clipboard = Array<ContentUnit>();
      // reset channel points
      this.crtLayerIds?.forEach((id) => {
        const elm = this.getElement(id);
        if (elm instanceof Channel) {
          elm.resetBridges();
        }
      });
      // bind bridges to channel points
      this.crtLayerIds?.forEach((id) => {
        const elm = this.getElement(id);
        if (elm && elm.display && elm instanceof Bridge) {
          elm.channelSegment.start.bridges.push(elm);
        }
      });
      const controlStore = useControlStore();
      if (controlStore.selectionState === 2) {
        this.clipboard.push(<ContentUnit>this.crtElement);
      } else if (controlStore.selectionState === 3) {
        this.crtGroupId.forEach((id) => {
          this.clipboard.push(<ContentUnit>this.getElement(id));
        });
      }
    },
    addToContent(newElm: ContentUnitGeneral) {
      this.contentMap.set(newElm.id, newElm);
    },
    addElmentToContent(elm: ContentUnitGeneral) {
      this.addToContent(elm);
      if (elm instanceof LevelConnection) {
        this.levelConnectionIds.push(elm.id);
      } else {
        this.crtLayerIds?.push(elm.id);
      }
    },
    removeFromSelected(target: string) {
      const i = this.crtGroupId.findIndex((id) => id === target);
      if (i >= 0) this.crtGroupId.splice(i, 1);
    },
    resetCrtGroup() {
      this.crtGroupId = Array<string>();
    },
    getLevelElmIds(levelId: string) {
      return this.layers.get(levelId)?.contentIds;
    },
    getLevelHeight(levelId: string) {
      return this.layers.get(levelId)?.height;
    },
    getElement(id: string) {
      return this.contentMap.get(id);
    },
    discardSelected() {
      this.crtId = "";
    },
    editOnCrtElement() {
      if (this.crtElement.type === "module") {
        this.crtElement.updateRender();
      }
    },
    selectElement(id: string): void {
      this.crtId = id;
    },
    removeLevelSafely(id: string) {
      if (this.crtLayer === id) {
        this.crtLayer = this.layers.keys().next().value;
      }
      this.layers.delete(id);
    },

    deleteLevel(id: string) {
      // cannot delete the only level
      if (this.layers.size <= 1) {
        console.log("cannot delete the only level");
        return;
      }
      // check dependency of level transition
      for (const tid of this.levelConnectionIds) {
        const transition = this.contentMap.get(tid);
        if (
          transition.properties.startLv.value === id ||
          transition.properties.endLv.value === id
        ) {
          console.log("invalid delete");
          return;
        }
      }

      const level = this.layers.get(id);
      const levelContent = this.layers.get(id)?.contentIds;
      if (level !== undefined && levelContent !== undefined) {
        const historyStore = useHistoryStore();
        historyStore.addActivity(new DeleteLevelAct(level, id, levelContent));
        this.removeLevelSafely(id);
      }
    },

    getColorByIdx(idx: number) {
      return layerColorDefault[idx % layerColorDefault.length];
    },

    createNewLevel(h: number) {
      while (this.layers.has(`Lv${this.levelCount}`)) {
        this.levelCount++;
      }
      const label = `Lv${this.levelCount}`;
      const newLevelInfo = {
        height: h,
        color: this.getColorByIdx(this.levelCount),
        label: label,
        id: label,
        contentIds: new Array<string>()
      };
      this.layers.set(label, newLevelInfo);
      const historyStore = useHistoryStore();
      historyStore.addActivity(new CreateLevelAct(newLevelInfo, label));
    },
    initializeContent(chipPropertyValues: number[]) {
      this.$reset();
      this.chipProperties.forEach((p, idx) => {
        p.value = chipPropertyValues[idx];
      });
      // reset component properties
      const moduleStore = useMoudleStore();
      moduleStore.initiallizeModuleFactory();
      const controlStore = useControlStore();
      controlStore.resetAppSettings();
      this.levelCount = this.chipProperties[6].value;
      for (let i = 0; i < this.levelCount; ++i) {
        const label = `Lv${i}`;
        this.layers.set(label, {
          height:
            this.chipProperties[7].value + i * this.chipProperties[5].value,
          color: layerColorDefault[i % layerColorDefault.length],
          label: label,
          id: label,
          contentIds: new Array<string>()
        });
      }
    },

    changeCrtLayer(idx: string) {
      this.crtId = "";
      this.crtLayer = idx;
      const control = useControlStore();
      control.resetFlags();
      if (control.mode === Mode.InterLayer) {
        control.level.start = idx;
      }
    },
    moduleTransform(translate: number[], rotation = 0, center = [0, 0]) {
      return `translate(${translate[0]} ${translate[1]}) rotate(${rotation} ${center[0]} ${center[1]})`;
    },
    requestNewStlData(
      precision: string,
      globalCompCheck: boolean,
      globalComp: number,
      localCompCheck: boolean,
      localCompMin: number,
      minAt: number,
      localCompMax: number,
      maxAt: number,
      binary: boolean
    ) {
      this.stlLoadingState = STLLoadingState.Loading;
      const requestBody = buildRequestBody(
        precision,
        globalCompCheck,
        globalComp,
        localCompCheck,
        localCompMin,
        minAt,
        localCompMax,
        maxAt
      );
      const token = window.localStorage["jwtTokenFMT"];
      const header = new Headers();
      if (token) {
        header.append("x-access-token", `${token}`);
      }
      header.append("Content-Type", "application/x-www-form-urlencoded");
      fetch(postUrl, {
        method: "POST",
        headers: header,
        body: `chip=${requestBody}&binary=${binary}`
      })
        .then((resp: Response) => {
          if (resp.ok) {
            return resp.arrayBuffer();
          }
          throw "request failed";
        })
        .then((data: ArrayBuffer) => {
          this.stlData = data;
          this.stlLoadingState = STLLoadingState.Succeed;
          console.log("stl loaded");
        })
        .catch((e) => {
          // display error msg
          this.stlLoadingState = STLLoadingState.Fail;
          console.log(e);
        });
    },
    changeChipProperty(idx: number, val: number) {
      this.chipProperties[idx].value = +val;
    }
  }
});
