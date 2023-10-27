import ModuleTemplate from "./moduleTemplate";
import { ModuleOutput } from "../typeDefinations";

// maintains the default module properties and create modules
export default abstract class ModuleCreatorTemplate {
  abstract moduleName: string;

  // might add "unit", "step" etc. for each property
  // defaultProperties: ModuleProperties;
  abstract description: string;
  abstract sample: string;
  abstract portSizeFixed: boolean;

  // for preview on module property board
  //pendingModule = new Module(defaultposition, args);
  abstract pendingModule: ModuleTemplate;
  // update preview, note that the position may need to be modified accordingly, which will not affect the placement
  abstract updatePendingModule(): void;

  abstract resetModule(): void;

  // initializeChannelPorts(m: ModuleTemplate): void {
  //   if (this.portSizeFixed) {
  //     m.initializeChannelPortsWithSize();
  //   } else {
  //     m.initializeChannelPortsWithoutSize();
  //   }
  // }
  // add pending module to content and create a clone of pending module
  createModule(): ModuleTemplate {
    const res = this.pendingModule.clone();
    // reset position
    this.pendingModule.position = [
      this.pendingModule.position[0] -
        this.pendingModule.elementsToRender.topLeftCorner[0] +
        400,
      this.pendingModule.position[1] -
        this.pendingModule.elementsToRender.topLeftCorner[1] +
        400
    ];
    this.pendingModule.updateRender();
    res.setNewModuleId();
    res.initializeChannelPorts();
    res.updateRender();
    return res;
  }
  parseModule(content: ModuleOutput): ModuleTemplate {
    const res = this.pendingModule.clone();
    res.position = content.position;
    res.rotation = content.rotation;
    res.id = content.id;
    for (const [key, value] of Object.entries(content.properties)) {
      if (key in res.properties) {
        res.properties[key].value = value;
      } else {
        throw `invalid property ${key}`;
      }
    }
    res.layer = content.layer;
    res.initializeChannelPorts();
    res.updateRender();
    return res;
  }
}
