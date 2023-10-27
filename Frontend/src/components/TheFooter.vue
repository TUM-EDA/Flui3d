<template>
  <div
    class="container-fluid d-flex justify-content-between position-fixed start-0 bottom-0 border-top bg-light px-5"
    style="z-index: 1046; height: 22px; min-width: 950px"
  >
    <div class="d-flex">
      <Popper>
        <!-- <button
          class="btn btn-sm py-0 mx-1"
          title="Level Inspection"
          data-bs-toggle="collapse"
          data-bs-target="#levelPanel"
          aria-expanded="false"
          aria-controls="levelPanel"
        >
          <i class="fa-solid fa-list"></i>
        </button> -->
        <button class="btn btn-sm py-0 mx-1" title="Level Inspection">
          <i class="fa-solid fa-list"></i>
        </button>
        <template #content>
          <PanelLevelVue />
        </template>
      </Popper>
      <div id="popperVia">
        <PopperWrapperGreen
          content="Please select the layer to which the via should connect."
          :arrow="true"
          :show="showPopper"
        >
          <LevelVue @mouseenter="controlStore.hidePopper()" />
        </PopperWrapperGreen>
      </div>
    </div>
    <div style="min-width: 300px">
      <span class="mx-2">Snap Precision: {{ coordinate.precision }} μm</span>
      <span class="mx-2">Grid Size: {{ coordinate.precisionGrid }} μm</span>
    </div>

    <span
      >X: {{ coordinate.roundedGlobalCoords[0].toFixed() }} µm, Y:
      {{ coordinate.roundedGlobalCoords[1].toFixed() }}
      µm</span
    >
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import Popper from "vue3-popper";
import { useCoordinateStore } from "@/stores/coordinate";
import { useControlStore } from "@/stores/control";
import LevelVue from "./Level.vue";
import { computed } from "@vue/reactivity";
import { Mode } from "@/library/other";
import PanelLevelVue from "./PanelLevel.vue";
import PopperWrapperGreen from "./PopperWrapperGreen.vue";
export default defineComponent({
  components: {
    LevelVue,
    Popper,
    PanelLevelVue,
    PopperWrapperGreen
  },
  setup() {
    const controlStore = useControlStore();
    const showPopper = computed(
      () =>
        controlStore.mode === Mode.InterLayer && controlStore.showLevelPopper
    );
    const coordinate = useCoordinateStore();
    return { showPopper, coordinate, controlStore };
  }
});
</script>
<style>
:root {
  --popper-theme-background-color: white;
  --popper-theme-background-color-hover: white;
  --popper-theme-border-width: 0px;
  --popper-theme-border-style: solid;
  --popper-theme-border-color: #333333;
  --popper-theme-border-radius: 6px;
  --popper-theme-padding: 10px;
  --popper-theme-box-shadow: 0 6px 30px -6px rgba(0, 0, 0, 0.25);
}
</style>
