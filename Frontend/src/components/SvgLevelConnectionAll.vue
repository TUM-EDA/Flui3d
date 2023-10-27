<template>
  <g :class="{ pointer: controlStore.mode === Mode.Select }">
    <SvgLevelConnectionVue
      class="crtLayerElm"
      v-for="(id, idx) in contentStore.levelConnectionIds"
      :key="idx"
      :element="contentStore.getElement(id)"
      @mousedown.stop="
        controlStore.mouseDownOnElement(id, $event.shiftKey || $event.ctrlKey)
      "
    />
  </g>
</template>
<script lang="ts">
import { useContentStore } from "@/stores/content";
import { useControlStore } from "@/stores/control";
import { defineComponent } from "vue";
import SvgLevelConnectionVue from "./SvgLevelConnection.vue";
import { Mode } from "@/library/other";
export default defineComponent({
  components: {
    SvgLevelConnectionVue
  },
  setup() {
    const contentStore = useContentStore();
    const controlStore = useControlStore();
    return {
      contentStore,
      controlStore,
      Mode
    };
  }
});
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
