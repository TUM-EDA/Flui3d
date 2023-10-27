import { defineStore } from "pinia";
import { useCoordinateStore } from "./coordinate";
import { useContentStore } from "@/stores/content";
import { useMoudleStore } from "./module";
import {
  ChannelPortWithSize,
  ContentUnit,
  ContentUnitGeneral,
  Mode,
  MouseOperation,
  SelectionState,
  ShapeType
} from "../library/other";
import {
  MoveModuleAct,
  MoveNodeElmAct,
  MoveChannelVertexAct,
  SetChannelSize,
  MoveGroupAct,
  DeleteGroupAct,
  SetRotationAct,
  SetRoundedCorner,
  MovePolygonVertexAct,
  BasicElementAct,
  DeleteBasicElmAct,
  useHistoryStore,
  MoveBridgeAct
} from "./history";
import { ChannelSegment, ChannelPort, ChannelPoint } from "@/library/other";
import ModuleTemplate from "@/library/modules/moduleTemplate";
import { useChannelSegInputStore } from "./channelSegmentInput";
import { Channel } from "@/library/channel";
import { LevelConnection } from "@/library/levelConnection";
import { Bridge } from "@/library/bridge";
import { InletOutlet } from "@/library/inletOutlet";
import ComponentPolygon from "@/library/componentPolygon";
import ComponentCircle from "@/library/componentCircle";

const dummyPoint = [0, 0];
const dummyChannelPoint = new ChannelPoint(dummyPoint);
const dummyChannel = new Channel(400, 400, "", dummyChannelPoint);
const dummyPolygon = new ComponentPolygon(400, 400, ShapeType.Hollow, "");
const dummyChannelSegment = {
  cid: "",
  idx: 0,
  start: dummyChannelPoint,
  end: dummyChannelPoint,
  width: 0
};
const isTheSamePoint = (p1: number[], p2: number[]) => {
  return p1[0] === p2[0] && p1[1] === p2[1];
};
export const useControlStore = defineStore("control", {
  state: () => ({
    mode: Mode.Select,
    moduleBoardVisible: false,
    isAddingChannel: false,
    isAddingPolygon: false,
    selectRect: { x1: -1, x2: -1, y1: -1, y2: -1 },
    operation: MouseOperation.Idle,
    selectionState: SelectionState.Idle,
    crtChannel: dummyChannel,
    crtPolygon: dummyPolygon,
    editSettings: {
      //px
      circleRadius: 5,
      strokeWidth: 1
    },

    isPlacingModule: false,
    canPlaceBridge: false,
    showLevelPopper: false,
    startPoint: dummyPoint,
    startRotation: 0,
    crtVertexIdx: 0,
    level: { start: "", end: "", h1: 0, h2: 0 },
    channelSeg: dummyChannelSegment,
    channelSegPre: dummyChannelSegment,
    posOnSeg: -1,
    posOnSegPre: -1,
    roundedChannelRadius: 400,
    circleRadius: 1000,
    channelType: 0, // 0: round, 1: square
    selectedChannelPoints: new Array<ChannelPoint>(),
    movingChannelPoint: dummyChannelPoint,
    movingPointConnectedToPort: false,
    isPanning: false,
    defaultShapeType: ShapeType.Hollow,
    defaultChannelWidth: 400,
    defaultPortRadius: 200,
    defaultViaRadius: 200
  }),
  getters: {
    isEditingBridge(): boolean {
      return (
        this.mode === Mode.Bridge ||
        this.operation === MouseOperation.MovingBridge
      );
    },
    isEditingChannelPoint(): boolean {
      return (
        this.isAddingChannel ||
        this.operation === MouseOperation.MovingChannelVertex
      );
    },
    editingCircleRadius(): number {
      const coordinate = useCoordinateStore();
      return coordinate.windowToGlobal(this.editSettings.circleRadius);
    },
    editingStrokeWidth(): number {
      const coordinate = useCoordinateStore();
      return coordinate.windowToGlobal(this.editSettings.strokeWidth);
    }
  },
  actions: {
    focusOnWorkarea() {
      document.getElementById("workarea")?.focus();
    },
    startPanning() {
      this.isPanning = true;
    },
    stopPanning() {
      this.isPanning = false;
    },
    hidePopper() {
      this.showLevelPopper = false;
    },
    // invoked after resetting contentStore
    resetAppSettings() {
      const coordinateSrtore = useCoordinateStore();
      const historyStore = useHistoryStore();
      const contentStore = useContentStore();
      const channelSegInput = useChannelSegInputStore();
      channelSegInput.$reset();
      coordinateSrtore.$reset();
      coordinateSrtore.resetView();
      historyStore.$reset();
      this.$reset();
      this.defaultChannelWidth = contentStore.defaultChannelWidth;
      // reset content unit count
      Channel.resetCount();
      Bridge.resetCount();
      InletOutlet.resetCount();
      LevelConnection.resetCount();
      ComponentPolygon.resetCount();
    },
    mouseup() {
      this.operation = MouseOperation.Idle;
    },
    setSelectionState(n: number) {
      this.selectionState = n;
    },
    hideElm(elm: ContentUnitGeneral) {
      if (elm instanceof Bridge) {
        elm.show = false;
      } else if (elm instanceof ContentUnit) {
        elm.display = false;
      }
    },
    deleteCrtElement() {
      if (this.selectionState === SelectionState.EditingdSingleElement) {
        this.selectionState = SelectionState.Idle;
        const contentStore = useContentStore();
        this.hideElm(contentStore.crtElement);
        const historyStore = useHistoryStore();
        historyStore.addActivity(
          new DeleteBasicElmAct(contentStore.crtElement, contentStore.crtLayer)
        );
        contentStore.crtId = "";
      } else if (this.selectionState === SelectionState.EditingGroup) {
        this.selectionState = SelectionState.Idle;
        const contentStore = useContentStore();
        const group = Array<ContentUnit>();
        contentStore.crtGroupId.forEach((id) => {
          const elm = contentStore.getElement(id);
          group.push(elm);
          this.hideElm(elm);
        });
        const historyStore = useHistoryStore();
        historyStore.addActivity(
          new DeleteGroupAct(group, contentStore.crtLayer)
        );
        contentStore.crtId = "";
      }
    },
    resetFlags() {
      const contentStore = useContentStore();
      contentStore.crtId = "";
      this.selectionState = SelectionState.Idle;
      this.operation = MouseOperation.Idle;
    },
    removeSelectedRoundedCorner(p: ChannelPoint) {
      p.isSelected = false;
      const idx = this.selectedChannelPoints.indexOf(p);
      if (idx >= 0) {
        this.selectedChannelPoints.splice(idx, 1);
      }
    },
    addSelectedRounedCorner(p: ChannelPoint) {
      p.isSelected = true;
      this.selectedChannelPoints.push(p);
    },
    confirmEditingRoundedCorner() {
      const historyStore = useHistoryStore();
      historyStore.addActivity(
        new SetRoundedCorner(
          this.selectedChannelPoints,
          this.roundedChannelRadius
        )
      );
      this.selectedChannelPoints.forEach((p) => {
        p.roundedRadius = this.roundedChannelRadius;
        p.isSelected = false;
      });
      this.selectedChannelPoints = new Array<ChannelPoint>();
    },
    discardEditingRoundedCorner() {
      this.selectedChannelPoints.forEach((p) => {
        p.isSelected = false;
      });
      this.selectedChannelPoints = new Array<ChannelPoint>();
    },
    setChannelType(t: number) {
      this.channelType = t;
    },
    setRoundedChannelRadius(r: number) {
      this.roundedChannelRadius = r;
    },
    setCircleRadius(r: number) {
      this.circleRadius = r;
    },
    startRotatingModule(r: number) {
      if (this.operation === MouseOperation.Idle) {
        const coordinate = useCoordinateStore();
        this.startPoint = [...coordinate.globalCoords];
        this.startRotation = r;
        this.operation = MouseOperation.RotatingComponent;
      } else {
        this.handleMouseDownLeft();
      }
    },
    stopRotatingModule(module: ModuleTemplate) {
      module.rotation = ((module.rotation % 360) + 360) % 360;
      const offSet = module.rotation - this.startRotation;
      // console.log(offSet);
      if (offSet !== 0) {
        const historyStore = useHistoryStore();
        historyStore.addActivity(new SetRotationAct(module, offSet));
      }
      this.startPoint[0] = this.startPoint[1] = this.startRotation = 0;
      this.mouseup();
    },
    bindChannelPort(port: ChannelPort) {
      // controlStore.mode === "channel" || controlStore.operation === 4;
      // triggered by mouseup =>
      // isAddingChannel || controlStore.operation === 4;
      if (this.isAddingChannel) {
        // insert port position at the 2nd last idx
        const newPoint = new ChannelPoint(port.position);
        newPoint.isConnectedToPort = true;
        newPoint.connectedPort = port;
        this.crtChannel.channelDef.splice(
          this.crtChannel.channelDef.length - 1,
          0,
          newPoint
        );
        // set channel width if possible
        if (port instanceof ChannelPortWithSize) {
          console.log("set channel size");
          this.crtChannel.properties.channelWidth.value = port.portWidth;
          this.crtChannel.properties.channelHeight.value = port.portHeight;
        }
      } else if (this.operation === MouseOperation.MovingChannelVertex) {
        // bind the port to the channel vertex
        const coordinate = useCoordinateStore();
        this.movingChannelPoint.position = port.position;
        this.movingChannelPoint.connectedPort = port;
        coordinate.roundedGlobalCoords = coordinate.roundedGlobalCoords.slice();
        const newAct = new MoveChannelVertexAct(
          this.startPoint,
          this.movingChannelPoint,
          this.movingChannelPoint.isConnectedToPort,
          true
        );
        this.movingChannelPoint.isConnectedToPort = true;
        // set channel width if possible
        if (port instanceof ChannelPortWithSize) {
          newAct.setChannelSize = new SetChannelSize(
            this.crtChannel,
            port.portWidth - this.crtChannel.properties.channelWidth.value,
            port.portHeight - this.crtChannel.properties.channelHeight.value
          );
          this.crtChannel.properties.channelWidth.value = port.portWidth;
          this.crtChannel.properties.channelHeight.value = port.portHeight;
        }

        const historyStore = useHistoryStore();
        historyStore.addActivity(newAct);
        this.crtVertexIdx = 0;
        this.startPoint = dummyPoint;
        this.operation = MouseOperation.Idle;
      }
    },
    setPosOnSeg(value: number) {
      this.posOnSeg = value;
    },
    setBridgeChannelSeg(seg: ChannelSegment) {
      this.channelSeg = seg;
    },
    startMovingChanelVertex(elm: Channel, point: ChannelPoint) {
      if (this.operation === MouseOperation.Idle) {
        this.crtChannel = elm;
        this.movingChannelPoint = point;
        const coordinate = useCoordinateStore();
        // make a copy for new act
        this.startPoint = point.position;
        // break bindings on the vertex
        point.position = point.position.slice();
        this.movingPointConnectedToPort = point.isConnectedToPort;
        point.isConnectedToPort = false;
        coordinate.roundedGlobalCoords = point.position;
        this.operation = MouseOperation.MovingChannelVertex;
      } else {
        this.handleMouseDownLeft();
      }
    },

    startMovingPolygonVertex(elm: ComponentPolygon, point: number[]) {
      if (this.operation === MouseOperation.Idle) {
        this.crtPolygon = elm;
        const coordinate = useCoordinateStore();
        // make a copy for new act
        this.startPoint = point.slice();
        coordinate.roundedGlobalCoords = point;
        this.operation = MouseOperation.MovingPolygonVertex;
      } else {
        this.handleMouseDownLeft();
      }
    },

    stopMovingPolygonVertex() {
      const coordinate = useCoordinateStore();
      const historyStore = useHistoryStore();
      historyStore.addActivity(
        new MovePolygonVertexAct(
          this.startPoint,
          coordinate.roundedGlobalCoords
        )
      );
      coordinate.roundedGlobalCoords = coordinate.roundedGlobalCoords.slice();
      this.startPoint = dummyPoint;
      this.operation = MouseOperation.Idle;
      this.crtPolygon = dummyPolygon;
    },

    stopMovingChannelVertex() {
      const coordinate = useCoordinateStore();
      coordinate.roundedGlobalCoords = coordinate.roundedGlobalCoords.slice();
      const historyStore = useHistoryStore();
      historyStore.addActivity(
        new MoveChannelVertexAct(
          this.startPoint,
          this.movingChannelPoint,
          this.movingPointConnectedToPort,
          false
        )
      );
      this.startPoint = dummyPoint;
      this.operation = MouseOperation.Idle;
      this.movingChannelPoint = dummyChannelPoint;
      this.crtChannel = dummyChannel;
    },

    setLevelEnd(l2: string) {
      const content = useContentStore();
      this.level.end = l2;
      const x = content.layers.get(l2)?.height;
      this.level.h1 = x ? x : 0;
    },
    abortCrtOperation() {
      // reset selection
      this.selectionState = SelectionState.Idle;
      if (this.isAddingChannel) this.stepOutChannel();
      if (this.isAddingPolygon) this.stepOutPolygon();
      if (this.mode === Mode.RoundedCorner) {
        this.confirmEditingRoundedCorner();
      }
    },
    switchMode(mode: number) {
      this.abortCrtOperation();
      if (mode !== this.mode) {
        switch (mode) {
          case Mode.Component: {
            this.showModuleBoard();
            break;
          }
          case Mode.InterLayer: {
            const content = useContentStore();
            this.level.start = this.level.end = content.crtLayer;
            this.level.h1 = this.level.h2 = content.heightOfCrtLayer
              ? content.heightOfCrtLayer
              : 0;
            this.showLevelPopper = true;
            break;
          }
        }
        this.mode = mode;
      }
      this.focusOnWorkarea();
    },

    stopMivingGroup() {
      const content = useContentStore();
      const historyStore = useHistoryStore();
      const coordinateStore = useCoordinateStore();
      const offsetX =
        coordinateStore.roundedGlobalCoords[0] - this.startPoint[0];
      const offsetY =
        coordinateStore.roundedGlobalCoords[1] - this.startPoint[1];
      if (offsetX !== 0 || offsetY !== 0) {
        const group = Array<ContentUnit>();
        content.crtGroupId.forEach((id) => {
          const elm = content.getElement(id);
          group.push(elm);
          switch (elm.type) {
            case "module": {
              elm.updatePosition();
              break;
            }
            default: {
              elm.resetTranslate();
            }
          }
        });
        historyStore.addActivity(new MoveGroupAct(group, offsetX, offsetY));
      }
    },

    stopMovingBridge() {
      const content = useContentStore();
      if (!this.canPlaceBridge) {
        content.crtElement.channelSegment = this.channelSegPre;
        content.crtElement.posOnSeg = this.posOnSegPre;
        console.log("INVALID BRIDGE PLACEMENT");
        // TODO: add alert
      } else {
        const historyStore = useHistoryStore();
        historyStore.addActivity(
          new MoveBridgeAct(
            content.crtElement,
            this.channelSegPre,
            this.posOnSegPre
          )
        );
      }
    },

    stopMovingElement() {
      const content = useContentStore();
      const historyStore = useHistoryStore();
      const coordinateStore = useCoordinateStore();
      const offsetX =
        coordinateStore.roundedGlobalCoords[0] - this.startPoint[0];
      const offsetY =
        coordinateStore.roundedGlobalCoords[1] - this.startPoint[1];
      if (offsetX !== 0 || offsetY !== 0) {
        switch (content.crtElement.type) {
          case "module": {
            content.crtElement.updatePosition();
            historyStore.addActivity(
              new MoveModuleAct(content.crtElement, offsetX, offsetY)
            );
            break;
          }
          default: {
            content.crtElement.resetTranslate();
            historyStore.addActivity(
              new MoveNodeElmAct(content.crtElement, offsetX, offsetY)
            );
            content.crtElement.resetTranslate();
          }
        }
      }
    },
    updateGroupPosition() {
      const content = useContentStore();
      const coordinate = useCoordinateStore();
      content.crtGroupId.forEach((id) => {
        const elm = content.getElement(id);
        switch (elm.type) {
          case "module": {
            elm.setTranslate(
              coordinate.roundedGlobalCoords[0] - this.startPoint[0],
              coordinate.roundedGlobalCoords[1] - this.startPoint[1]
            );
            break;
          }
          default: {
            elm.updatePosition(
              coordinate.roundedGlobalCoords[0] - this.startPoint[0],
              coordinate.roundedGlobalCoords[1] - this.startPoint[1]
            );
          }
        }
      });
    },

    updateCrtElmPosition() {
      const coordinate = useCoordinateStore();
      const content = useContentStore();
      if (content.crtElement.type === "module") {
        content.crtElement.setTranslate(
          coordinate.roundedGlobalCoords[0] - this.startPoint[0],
          coordinate.roundedGlobalCoords[1] - this.startPoint[1]
        );
      }
      // BasicParts
      else {
        // move by offset
        content.crtElement.updatePosition(
          coordinate.roundedGlobalCoords[0] - this.startPoint[0],
          coordinate.roundedGlobalCoords[1] - this.startPoint[1]
        );
      }
    },
    startMovingGroup() {
      if (this.operation === MouseOperation.Idle) {
        const coordinate = useCoordinateStore();
        this.startPoint = [...coordinate.roundedGlobalCoords];
        this.operation = MouseOperation.MovingGroup;
      } else {
        this.handleMouseDownLeft();
      }
    },

    startMovingElement() {
      if (this.operation === MouseOperation.Idle) {
        const coordinate = useCoordinateStore();
        const content = useContentStore();
        switch (content.crtElement.type) {
          case "bridge": {
            this.channelSeg = content.crtElement.channelSegment;
            this.channelSegPre = content.crtElement.channelSegment;
            this.posOnSegPre = content.crtElement.posOnSeg;
            this.operation = MouseOperation.MovingBridge;
            break;
          }
          case "channel":
          case "polygon":
          case "module": {
            this.startPoint = [...coordinate.roundedGlobalCoords];
            this.operation = MouseOperation.MovingElement;
            break;
          }
          default: {
            this.startPoint = [content.crtElement.x, content.crtElement.y];
            this.operation = MouseOperation.MovingElement;
          }
        }
      } else {
        this.handleMouseDownLeft();
      }
    },

    finishBridgePlacement() {
      if (this.canPlaceBridge) {
        const contentStore = useContentStore();
        const newBridge = new Bridge(
          this.channelSeg,
          this.posOnSeg,
          contentStore.crtLayer
        );
        contentStore.contentMap.set(newBridge.id, newBridge);
        contentStore.crtLayerIds?.push(newBridge.id);
        // add to history
        const historyStore = useHistoryStore();
        historyStore.addActivity(
          new BasicElementAct(newBridge, contentStore.crtLayer)
        );
      }
    },

    enableBridgePlacement() {
      this.canPlaceBridge = true;
    },
    disableBridgePlacement() {
      this.canPlaceBridge = false;
      this.posOnSeg = -1;
    },

    finishLevelConnectionPlacement() {
      if (this.level.end !== "" && this.level.end !== this.level.start) {
        const coordinateStore = useCoordinateStore();
        const contentStore = useContentStore();
        const s = this.level.start;
        const t = this.level.end;
        const newLevel = new LevelConnection(
          coordinateStore.roundedGlobalCoords,
          this.defaultViaRadius,
          s,
          t,
          this.channelType
        );
        contentStore.contentMap.set(newLevel.id, newLevel);
        contentStore.levelConnectionIds.push(newLevel.id);
        // contentStore.crtLayerIds?.push(newLevel.id);
        // add to history
        const historyStore = useHistoryStore();
        historyStore.addActivity(
          new BasicElementAct(newLevel, contentStore.crtLayer)
        );
      }
    },
    finishCtrlNodePlacement() {
      const coordinateStore = useCoordinateStore();
      const contentStore = useContentStore();
      const newCtrlNode = new InletOutlet(
        coordinateStore.roundedGlobalCoords,
        this.defaultPortRadius,
        this.channelType,
        contentStore.crtLayer
      );
      contentStore.contentMap.set(newCtrlNode.id, newCtrlNode);
      contentStore.crtLayerIds?.push(newCtrlNode.id);
      // add to history
      const historyStore = useHistoryStore();
      historyStore.addActivity(
        new BasicElementAct(newCtrlNode, contentStore.crtLayer)
      );
    },
    startModulePlacement() {
      const moduleStore = useMoudleStore();
      const coordsStore = useCoordinateStore();
      moduleStore.selectedModuleCreator.pendingModule.position = [
        ...coordsStore.roundedGlobalCoords
      ];
      moduleStore.selectedModuleCreator.pendingModule.updateRender();
      this.isPlacingModule = true;
      this.focusOnWorkarea();
    },
    cancelModulePlacement() {
      this.isPlacingModule = false;
      this.mode = Mode.Select;
    },

    finishModulePlacement() {
      try {
        const moduleStore = useMoudleStore();
        const contentStore = useContentStore();
        // const coordinateStore = useCoordinateStore();
        const newModule = moduleStore.selectedModuleCreator.createModule();
        newModule.layer = contentStore.crtLayer;
        contentStore.contentMap.set(newModule.id, newModule);
        contentStore.crtLayerIds?.push(newModule.id);
        // add to history
        const historyStore = useHistoryStore();
        historyStore.addActivity(
          new BasicElementAct(newModule, contentStore.crtLayer)
        );
        this.isPlacingModule = false;
        this.mode = Mode.Select;
      } catch (e) {
        console.log(e);
      }
    },

    finishCirclePlacement() {
      const coordinateStore = useCoordinateStore();
      const contentStore = useContentStore();
      const circle = new ComponentCircle(
        coordinateStore.roundedGlobalCoords,
        this.circleRadius,
        this.defaultShapeType,
        contentStore.crtLayer
      );
      contentStore.contentMap.set(circle.id, circle);
      contentStore.crtLayerIds?.push(circle.id);
      // add to history
      const historyStore = useHistoryStore();
      historyStore.addActivity(
        new BasicElementAct(circle, contentStore.crtLayer)
      );
    },
    // triggered by mouse down
    addNewChannel() {
      const contentStore = useContentStore();
      const coordinateStore = useCoordinateStore();
      this.crtChannel = new Channel(
        contentStore.defaultChannelWidth,
        contentStore.defaultModuleHeight,
        contentStore.crtLayer,
        new ChannelPoint(coordinateStore.roundedGlobalCoords)
      );
      this.isAddingChannel = true;
    },
    addNewPolygon() {
      const contentStore = useContentStore();
      const coordinateStore = useCoordinateStore();
      this.crtPolygon = new ComponentPolygon(
        contentStore.defaultChannelWidth,
        contentStore.defaultModuleHeight,
        this.defaultShapeType,
        contentStore.crtLayer,
        coordinateStore.roundedGlobalCoords
      );
      this.isAddingPolygon = true;
    },
    setCrtModuleRotation(r: number, shift: boolean, module: ModuleTemplate) {
      if (shift) {
        r += 7.5;
        r = r - (r % 15);
      }
      module.setRotation(r % 360);
    },
    setCrtChannelEnd(shift: boolean) {
      const coordinateStore = useCoordinateStore();
      const channelSegInput = useChannelSegInputStore();
      let x = coordinateStore.globalCoords[0];
      let y = coordinateStore.globalCoords[1];
      if (
        shift &&
        !channelSegInput.lengthLocked &&
        this.crtChannel.channelDef.length >= 2
      ) {
        const i = this.crtChannel.channelDef.length - 2,
          x0 = this.crtChannel.channelDef[i].position[0],
          y0 = this.crtChannel.channelDef[i].position[1];
        if (Math.abs(x - x0) > Math.abs(y - y0)) {
          y = y0;
          x = coordinateStore.roundCoords(x);
        } else {
          x = x0;
          y = coordinateStore.roundCoords(y);
        }
        coordinateStore.roundedGlobalCoords[0] = x;
        coordinateStore.roundedGlobalCoords[1] = y;
      }
    },
    // triggered by mouse up
    addChannelPoint() {
      const coordinateStore = useCoordinateStore();
      const channelSegInput = useChannelSegInputStore();
      // add point if the crt point is different from the last point
      const n = this.crtChannel.channelDef.length;
      if (
        n < 2 ||
        !isTheSamePoint(
          this.crtChannel.channelDef[n - 1].position,
          this.crtChannel.channelDef[n - 2].position
        )
      ) {
        // insert a copy of roundedGlobalCoords at the 2nd last idx
        this.crtChannel.channelDef.splice(
          this.crtChannel.channelDef.length - 1,
          0,
          new ChannelPoint([...coordinateStore.roundedGlobalCoords])
        );
        coordinateStore.snapping = false;
        channelSegInput.lengthLocked = false;
      }
    },
    addPolygonPoint() {
      const coordinateStore = useCoordinateStore();
      // insert a copy of roundedGlobalCoords at the 2nd last idx
      this.crtPolygon.points.splice(this.crtPolygon.points.length - 1, 0, [
        ...coordinateStore.roundedGlobalCoords
      ]);
    },
    stopAddingChannel() {
      const channelInput = useChannelSegInputStore();
      channelInput.lengthLocked = false;
      this.isAddingChannel = false;
    },
    stepOutChannel() {
      const channelInput = useChannelSegInputStore();
      if (channelInput.lengthLocked) {
        channelInput.lengthLocked = false;
      } else {
        this.crtChannel.channelDef.pop();
        if (this.crtChannel.channelDef.length > 1) {
          // add to content
          const contentStore = useContentStore();
          this.crtChannel.setId();
          contentStore.contentMap.set(this.crtChannel.id, this.crtChannel);
          contentStore.crtLayerIds?.push(this.crtChannel.id);
          // add to history
          const historyStore = useHistoryStore();
          historyStore.addActivity(
            new BasicElementAct(this.crtChannel, contentStore.crtLayer)
          );
          this.crtChannel = dummyChannel;
        }
        this.stopAddingChannel();
      }
    },
    stepOutPolygon() {
      this.crtPolygon.points.pop();
      if (this.crtPolygon.points.length > 2) {
        // add to content
        const contentStore = useContentStore();
        this.crtPolygon.setId();
        contentStore.contentMap.set(this.crtPolygon.id, this.crtPolygon);
        contentStore.crtLayerIds?.push(this.crtPolygon.id);
        // add to history
        const historyStore = useHistoryStore();
        historyStore.addActivity(
          new BasicElementAct(this.crtPolygon, contentStore.crtLayer)
        );
        this.crtPolygon = dummyPolygon;
      }
      this.isAddingPolygon = false;
    },
    handleMouseUpLeft() {
      if (this.isAddingChannel) {
        this.addChannelPoint();
      } else if (this.isAddingPolygon) {
        this.addPolygonPoint();
      } else {
        // mode === 'select'
        switch (this.operation) {
          case MouseOperation.Idle:
          case MouseOperation.RotatingComponent:
            break;
          case MouseOperation.Selecting: {
            if (this.selectionState === SelectionState.IsSelectingGroup) {
              this.getSelectedGroup();
            } else {
              this.resetFlags();
            }
            break;
          }
          case MouseOperation.MovingElement: {
            this.stopMovingElement();
            break;
          }
          case MouseOperation.MovingBridge: {
            this.stopMovingBridge();
            break;
          }
          case MouseOperation.MovingChannelVertex: {
            this.stopMovingChannelVertex();
            break;
          }
          case MouseOperation.MovingPolygonVertex: {
            this.stopMovingPolygonVertex();
            break;
          }
          case MouseOperation.MovingGroup: {
            this.stopMivingGroup();
            break;
          }
        }
      }
      this.mouseup();
    },

    handleMouseDownLeft() {
      // initiallize selectRect
      switch (this.mode) {
        case Mode.Select: {
          if (this.operation === MouseOperation.Idle)
            this.initializeSelectRect();
          break;
        }
        case Mode.Polygon: {
          if (!this.isAddingPolygon) {
            this.addNewPolygon();
          }
          break;
        }
        case Mode.Channel: {
          if (!this.isAddingChannel) {
            this.addNewChannel();
          }
          break;
        }
      }
    },
    selectElement(id: string) {
      const contentStore = useContentStore();
      contentStore.selectElement(id);
      this.selectionState = SelectionState.EditingdSingleElement;
    },

    mouseDownOnElement(id: string, shift: boolean) {
      if (this.mode === Mode.Select) {
        const contentStore = useContentStore();
        // editing something
        if (shift && this.selectionState >= 2) {
          if (this.selectionState === SelectionState.EditingdSingleElement) {
            contentStore.crtGroupId = [contentStore.crtId];
            this.selectionState = SelectionState.EditingGroup;
          }
          contentStore.crtGroupId.push(id);
        }
        // not
        else {
          this.selectElement(id);
        }
      } else {
        this.handleMouseDownLeft();
      }
    },

    hideModuleBoard() {
      this.moduleBoardVisible = false;
    },
    showModuleBoard() {
      this.moduleBoardVisible = true;
    },
    initializeSelectRect() {
      const coordinate = useCoordinateStore();
      this.selectRect.x1 = this.selectRect.x2 = coordinate.windowCoords[0];
      this.selectRect.y1 = this.selectRect.y2 = coordinate.windowCoords[1];
      this.operation = MouseOperation.Selecting;
    },
    setSelectRect() {
      this.selectionState = 1;
      const coordinate = useCoordinateStore();
      this.selectRect.x2 = coordinate.windowCoords[0];
      this.selectRect.y2 = coordinate.windowCoords[1];
    },
    normalizeSelectRect() {
      const x1 = Math.min(this.selectRect.x1, this.selectRect.x2),
        y1 = Math.min(this.selectRect.y1, this.selectRect.y2),
        x2 = Math.max(this.selectRect.x1, this.selectRect.x2),
        y2 = Math.max(this.selectRect.y1, this.selectRect.y2);
      this.selectRect.x1 = x1;
      this.selectRect.x2 = x2;
      this.selectRect.y1 = y1;
      this.selectRect.y2 = y2;
    },
    resetSelectRect() {
      this.selectRect.x1 =
        this.selectRect.x2 =
        this.selectRect.y1 =
        this.selectRect.y2 =
          -1;
    },
    hasIntersection(id: string) {
      const rect = document.getElementById(id)?.getBoundingClientRect();
      return rect
        ? rect.x + rect.width >= this.selectRect.x1 &&
            rect.x <= this.selectRect.x2 &&
            rect.y + rect.height >= this.selectRect.y1 &&
            rect.y <= this.selectRect.y2
        : false;
    },
    isInsideSelectRest(id: string) {
      const rect = document.getElementById(id)?.getBoundingClientRect();
      return rect
        ? rect.x + rect.width <= this.selectRect.x1 &&
            rect.x >= this.selectRect.x2 &&
            rect.y + rect.height <= this.selectRect.y1 &&
            rect.y >= this.selectRect.y2
        : false;
    },
    getSelectedGroup() {
      if (this.selectionState === SelectionState.IsSelectingGroup) {
        this.normalizeSelectRect();
        const contentStore = useContentStore();
        const selectedGroup = Array<string>();
        contentStore.crtLayerIds?.forEach((id) => {
          const elm = contentStore.getElement(id);
          if (
            elm.display &&
            elm.type !== "bridge" &&
            this.hasIntersection(id)
          ) {
            selectedGroup.push(id);
          }
        });
        contentStore.crtGroupId = selectedGroup;
        this.setGroupSelect();
        this.resetSelectRect();
      }
    },
    setGroupSelect() {
      const contentStore = useContentStore();
      if (contentStore.crtGroupId.length === 0) {
        this.selectionState = SelectionState.Idle;
      } else if (contentStore.crtGroupId.length === 1) {
        contentStore.selectElement(contentStore.crtGroupId[0]);
        this.selectionState = SelectionState.EditingdSingleElement;
      } else {
        this.selectionState = SelectionState.EditingGroup;
      }
    }
  }
});
