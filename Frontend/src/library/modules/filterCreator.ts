import ModuleCreatorTemplate from "./moduleCreatorTemplate";
import Filter from "./filter";

export default class FilterCreator extends ModuleCreatorTemplate {
  moduleName = "Filter";
  description =
    "A chamber equipped with multiple pillars, can be utilized for a variety of applications such as filtering and mixing.";
  sample = "SampleFilter";
  portSizeFixed = false;
  pendingModule = new Filter([500, 1600], "");
  constructor() {
    super();
    this.pendingModule.id = "preview";
    this.updatePendingModule();
  }
  resetModule(): void {
    Filter.count = 0;
    this.pendingModule.properties.lengthX.value = 4000;
    this.pendingModule.properties.lengthY.value = 3200;
    this.pendingModule.properties.cornerRadius.value = 400;
    this.pendingModule.properties.pillarRow.value = 3;
    this.pendingModule.properties.pillarCol.value = 4;
    this.pendingModule.properties.pillarRadius.value = 200;
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
