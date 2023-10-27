import ModuleCreatorTemplate from "./moduleCreatorTemplate";
import TransitionWidth from "./transitionWidth";

export default class TransitionWidthCreator extends ModuleCreatorTemplate {
  moduleName = "Width Transition";
  description =
    "A component that is used to connect two channels that have different widths. It serves as a connector between the channels, allowing fluid to flow from one channel to another smoothly.";

  sample = "SampleTransition";
  portSizeFixed = true;
  pendingModule = new TransitionWidth([500, 200], "");
  constructor() {
    super();
    this.pendingModule.id = "preview";
    this.updatePendingModule();
  }
  resetModule(): void {
    TransitionWidth.count = 0;
    this.pendingModule.properties.transitionL.value = 400;
    this.pendingModule.properties.width1.value = 400;
    this.pendingModule.properties.width2.value = 200;
    this.pendingModule.properties.connectionL.value = 400;
    this.pendingModule.properties.height.value = 400;
    this.pendingModule.updateRender();
  }
  updatePendingModule(): void {
    this.pendingModule.position[1] =
      Math.max(
        this.pendingModule.properties.width1.value,
        this.pendingModule.properties.width2.value
      ) / 2;
    this.pendingModule.updateRender();
  }
  updatePendingModulePosition(pos: number[]): void {
    this.pendingModule.position = [...pos];
    this.pendingModule.updateRender();
  }
}
