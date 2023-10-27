import { defineStore } from "pinia";
import ModuleFactory from "@/library/modules/moduleFactory";
import { useContentStore } from "./content";
// import ComponentCircleCreator from "../library/componentCircleCreator";

// store of default module settings
// pos, translate and rotation are common propertyName for all the modules
export const useMoudleStore = defineStore("module", {
  state: () => ({
    moduleFactory: ModuleFactory,
    selectedModuleIdx: 0
  }),

  getters: {
    selectedModuleCreator(state) {
      return state.moduleFactory[state.selectedModuleIdx];
    }
  },

  actions: {
    selectModule(idx: number) {
      this.selectedModuleIdx = idx;
    },

    // invoked when initialize design
    initiallizeModuleFactory() {
      this.moduleFactory.forEach((creator) => {
        creator.resetModule();
      });
      const contentStore = useContentStore();
      this.moduleFactory.forEach((moduleCreator) => {
        moduleCreator.pendingModule.properties.height.value =
          contentStore.chipProperties[4].value;
        if ("channelWidth" in moduleCreator.pendingModule.properties) {
          moduleCreator.pendingModule.properties.channelWidth.value =
            contentStore.chipProperties[3].value;
        }
      });
    }
  }
});
