import ModuleCreatorTemplate from "./moduleCreatorTemplate";
import Droplet from "./droplet";

export default class DropletCreator extends ModuleCreatorTemplate {
  moduleName = "Droplet";
  description =
    "A droplet generator is a component that creates tiny droplets of fluid. It is used for applications such as drug discovery, cell encapsulation, and chemical synthesis.";
  portSizeFixed = false;
  sample = "SampleDroplet";
  pendingModule = new Droplet([500, 1200], "");
  constructor() {
    super();
    this.pendingModule.id = "preview";
    this.updatePendingModule();
  }
  resetModule(): void {
    Droplet.count = 0;
    this.pendingModule.properties.disperseW.value = 400;
    this.pendingModule.properties.continuousW.value = 400;
    this.pendingModule.properties.dropletW.value = 200;
    this.pendingModule.properties.dropletL.value = 360;
    this.pendingModule.properties.connectionL.value = 1200;
    this.pendingModule.properties.height.value = 400;
    this.pendingModule.updateRender();
  }
  updatePendingModule(): void {
    this.pendingModule.position[1] =
      this.pendingModule.properties.connectionL.value;
    this.pendingModule.updateRender();
  }
  updatePendingModulePosition(pos: number[]): void {
    this.pendingModule.position = [...pos];
    this.pendingModule.updateRender();
  }
}
