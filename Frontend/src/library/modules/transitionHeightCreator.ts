import ModuleCreatorTemplate from "./moduleCreatorTemplate";
import TransitionHeight from "./transitionHeight";

export default class TransitionHeightCreator extends ModuleCreatorTemplate {
  moduleName = "Height Transition";
  description =
    "A component that is used to connect two channels that have different heights. It serves as a connector between the channels, allowing fluid to flow from one channel to another smoothly.";

  sample = "SampleTransition";
  portSizeFixed = true;
  pendingModule = new TransitionHeight([500, 200], "");
  constructor() {
    super();
    this.pendingModule.id = "preview";
    this.updatePendingModule();
  }
  resetModule(): void {
    TransitionHeight.count = 0;
    this.pendingModule.properties.transitionL.value = 400;
    this.pendingModule.properties.height_after.value = 200;
    this.pendingModule.properties.connectionL.value = 400;
    this.pendingModule.properties.width.value = 400;
    this.pendingModule.properties.height.value = 400;
    this.pendingModule.updateRender();
  }
  updatePendingModule(): void {
    this.pendingModule.position[1] =
      this.pendingModule.properties.width.value / 2;
    this.pendingModule.updateRender();
  }
  updatePendingModulePosition(pos: number[]): void {
    this.pendingModule.position = [...pos];
    this.pendingModule.updateRender();
  }
}
