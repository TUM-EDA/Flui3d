<template>
  <g>
    <SvgElementHighlightVue
      v-for="(id, idx) in contentStore.crtGroupId"
      :key="idx"
      :element="contentStore.getElement(id)"
      @mousedown.stop="
        mouseDownOnSelected($event.shiftKey || $event.ctrlKey, id)
      "
    />
    <!-- <circle
      v-if="controlStore.operation === 5"
      class="moving"
      :cx="coordinateStore.globalCoords[0]"
      :cy="coordinateStore.globalCoords[1]"
      r="10000"
      fill="transparent"
      stroke="transparent"
      @mouseup.stop="controlStore.stopMivingGroup()"
    /> -->
  </g>
</template>
<script lang="ts">
  import { useContentStore } from "@/stores/content";
  import { useControlStore } from "@/stores/control";
  import { useCoordinateStore } from "@/stores/coordinate";
  import { defineComponent } from "vue";
  import SvgElementHighlightVue from "./SvgElementHighlight.vue";

  export default defineComponent({
    components: {
      SvgElementHighlightVue,
    },
    setup() {
      const controlStore = useControlStore();
      const contentStore = useContentStore();
      const coordinateStore = useCoordinateStore();
      const mouseDownOnSelected = (shift: boolean, id: string) => {
        if (shift) {
          contentStore.removeFromSelected(id);
          if (contentStore.crtGroupId.length === 1) {
            contentStore.selectElement(contentStore.crtGroupId[0]);
            controlStore.setSelectionState(2);
            contentStore.resetCrtGroup();
          }
        } else {
          controlStore.startMovingGroup();
        }
      };
      return {
        contentStore,
        controlStore,
        coordinateStore,
        mouseDownOnSelected,
      };
    },
  });
</script>
