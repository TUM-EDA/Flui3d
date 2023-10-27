<template>
  <div class="d-flex flex-column align-item-center">
    <div class="w-auto my-2 mx-auto" v-if="controlStore.mode === Mode.Circle">
      <ToolbarShapeTypeVue />
    </div>
    <div class="d-flex px-2 py-1 align-items-center w-auto">
      Radius:

      <div v-if="controlStore.mode === Mode.RoundedCorner">
        <input
          class="form-control mx-2"
          style="width: 100px"
          type="number"
          min="10"
          step="10"
          v-model="controlStore.roundedChannelRadius"
        />
      </div>

      <div v-else-if="controlStore.mode === Mode.Circle">
        <input
          class="form-control mx-2"
          style="width: 100px"
          type="number"
          min="10"
          step="10"
          v-model="controlStore.circleRadius"
        />
      </div>
      µm
      <div
        v-if="
          controlStore.mode === Mode.RoundedCorner &&
          controlStore.selectedChannelPoints.length > 0
        "
        class="d-flex"
      >
        <button
          class="btn btn-outline-success btn-sm ms-2"
          @click="controlStore.confirmEditingRoundedCorner"
        >
          <i class="fa-solid fa-check"></i>
        </button>
        <button
          class="btn btn-outline-danger btn-sm ms-2"
          @click="controlStore.discardEditingRoundedCorner"
        >
          <i class="fa-solid fa-ban"></i>
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import { useControlStore } from "@/stores/control";
import { computed } from "@vue/reactivity";
import { defineComponent } from "vue";
import ToolbarShapeTypeVue from "./ToolbarShapeType.vue";
import { Mode } from "@/library/other";

export default defineComponent({
  components: {
    ToolbarShapeTypeVue
  },
  setup() {
    const controlStore = useControlStore();
    const positionStyle = computed(() => {
      const btnPosY = document
        .getElementById(`${controlStore.mode}_btn`)
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
