import ModuleCreatorTemplate from "./moduleCreatorTemplate";
import Chamber from "./chamber";

export default class ChamberCreator extends ModuleCreatorTemplate {
  moduleName = "Chamber";
  description =
    "A microfluidic chamber is a device that can be utilized for various purposes, including but not limited to, fluid storage and cell culture.";
  portSizeFixed = false;
  sample = "SampleChamber";
  pendingModule = new Chamber([500, 1600], "");
  constructor() {
    super();
    this.pendingModule.id = "preview";
    this.updatePendingModule();
  }
  resetModule(): void {
    Chamber.count = 0;
    this.pendingModule.properties.lengthX.value = 4000;
    this.pendingModule.properties.lengthY.value = 3200;
    this.pendingModule.properties.cornerRadius.value = 400;
    this.pendingModule.properties.height.value = 400;
    this.pendingModule.updateRender();
  }

  updatePendingModule(): void {
    this.pendingModule.position[1] =
      this.pendingModule.properties.lengthY.value / 2;
    this.pendingModule.updateRender();
  }
  updatePendingModulePosition(pos: number[]): void {
    this.pendingModule.position = [...pos];
    this.pendingModule.updateRender();
  }
}
