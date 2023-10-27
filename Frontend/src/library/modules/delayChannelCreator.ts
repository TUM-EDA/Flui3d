import ModuleCreatorTemplate from "./moduleCreatorTemplate";
import DelayChannel from "./delayChannel";

export default class DelayChannelCreator extends ModuleCreatorTemplate {
  moduleName = "Serpentine Channel";
  description =
    "A serpentine-shaped channel can be used to passively mix fluids or delay their flow.";
  portSizeFixed = false;
  sample = "SampleDelayChannel";
  pendingModule = new DelayChannel([500, 2400], "");
  constructor() {
    super();
    this.pendingModule.id = "preview";
    this.updatePendingModule();
  }
  resetModule(): void {
    DelayChannel.count = 0;
    this.pendingModule.properties.width.value = 4000;
    this.pendingModule.properties.channelWidth.value = 400;
    this.pendingModule.properties.channelDist.value = 800;
    this.pendingModule.properties.turningsNum.value = 4;
    this.pendingModule.properties.turningRadius.value = 400;
    this.pendingModule.properties.height.value = 400;
    this.pendingModule.updateRender();
  }
  updatePendingModule(): void {
    this.pendingModule.position[1] =
      this.pendingModule.properties.width.value / 2 +
      this.pendingModule.properties.channelWidth.value;
    this.pendingModule.updateRender();
  }
  updatePendingModulePosition(pos: number[]): void {
    this.pendingModule.position = [...pos];
    this.pendingModule.updateRender();
  }
}
