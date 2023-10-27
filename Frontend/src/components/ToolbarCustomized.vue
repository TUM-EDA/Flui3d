<template>
  <div
    class="position-fixed rounded bg-light border border-dark d-flex flex-column align-item-center"
    :style="positionStyle"
  >
    <ToolbarChannelWidthVue v-if="controlStore.mode === Mode.Channel" />
    <ToolbarShapeTypeVue v-if="controlStore.mode === Mode.Polygon" />
    <ToolbarChannelTypeVue
      v-else-if="
        controlStore.mode === Mode.InletOutlet ||
        controlStore.mode === Mode.InterLayer
      "
    />
    <ToolbarRadiusVue
      v-else-if="
        controlStore.mode === Mode.RoundedCorner ||
        controlStore.mode === Mode.Circle
      "
    />
  </div>
</template>
<script>
import { computed } from "@vue/reactivity";
import { defineComponent } from "vue";
import ToolbarChannelTypeVue from "./ToolbarChannelType.vue";
import ToolbarRadiusVue from "./ToolbarRadius.vue";
import ToolbarChannelWidthVue from "./ToolbarChannelWidth.vue";
import ToolbarShapeTypeVue from "./ToolbarShapeType.vue";
import { useControlStore } from "@/stores/control";
import { Mode } from "@/library/other";
export default defineComponent({
  components: {
    ToolbarChannelTypeVue,
    ToolbarRadiusVue,
    ToolbarChannelWidthVue,
    ToolbarShapeTypeVue
  },
  setup() {
    const controlStore = useControlStore();
    const positionStyle = computed(() => {
      const btnPosY = document
        .getElementById(`mode${controlStore.mode}_btn`)
        .getBoundingClientRect().y;
      return `top:${btnPosY}px; left:47px;--bs-border-opacity: 0.2; z-index:3`;
    });
    return {
      controlStore,
      positionStyle,
      Mode
    };
  }
});
</script>
