import ModuleCreatorTemplate from "./moduleCreatorTemplate";
import TeslaValve from "./teslaValve";

export default class TeslaValveCreator extends ModuleCreatorTemplate {
  moduleName = "Tesla Valve";
  description =
    "Tesla valves are commonly used for applications such as flow control, mixing, and droplet generation.";

  sample = "SampleTeslaValve";
  portSizeFixed = false;
  pendingModule = new TeslaValve([500, 1000], "");
  constructor() {
    super();
    this.pendingModule.id = "preview";
    this.updatePendingModule();
  }
  resetModule(): void {
    TeslaValve.count = 0;
    this.pendingModule.properties.channelWidth.value = 400;
    this.pendingModule.properties.segPairNum.value = 2;
    this.pendingModule.properties.segLenX.value = 2000;
    this.pendingModule.properties.segLenY.value = 1200;
    this.pendingModule.properties.height.value = 400;
    this.pendingModule.updateRender();
  }
  updatePendingModule(): void {
    this.pendingModule.position[1] =
      this.pendingModule.properties.segLenY.value / 2 +
      this.pendingModule.properties.channelWidth.value;
    this.pendingModule.updateRender();
  }
  updatePendingModulePosition(pos: number[]): void {
    this.pendingModule.position = [...pos];
    this.pendingModule.updateRender();
  }
}
