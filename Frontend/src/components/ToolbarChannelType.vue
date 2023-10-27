<template>
  <div class="d-flex align-item-center">
    <div
      role="group"
      class="btn-group-sm btn-group border border-dark m-1"
      style="--bs-border-opacity: 0.2; z-index: 3"
    >
      <ToolbarIconVue
        :isActive="controlStore.channelType === 0"
        @click="controlStore.setChannelType(0)"
      >
        <NodeRoundIcon />
      </ToolbarIconVue>
      <ToolbarIconVue
        :isActive="controlStore.channelType === 1"
        @click="controlStore.setChannelType(1)"
      >
        <NodeSquareIcon />
      </ToolbarIconVue>
    </div>

    <div class="d-flex px-2 py-1 align-items-center w-auto">
      Radius:

      <div v-if="controlStore.mode === Mode.InletOutlet">
        <input
          class="form-control mx-2"
          style="width: 100px"
          type="number"
          min="10"
          step="10"
          v-model="controlStore.defaultPortRadius"
        />
      </div>

      <div v-else-if="controlStore.mode === Mode.InterLayer">
        <input
          class="form-control mx-2"
          style="width: 100px"
          type="number"
          min="10"
          step="10"
          v-model="controlStore.defaultViaRadius"
        />
      </div>
      µm
    </div>
  </div>
</template>
<script>
import { useControlStore } from "@/stores/control";
import { computed } from "@vue/reactivity";
import { defineComponent } from "vue";
import ToolbarIconVue from "./ToolbarIcon.vue";
import NodeRoundIcon from "@/assets/icons/node-round-icon.vue";
import NodeSquareIcon from "@/assets/icons/node-square-icon.vue";
import { Mode } from "@/library/other";

export default defineComponent({
  components: {
    ToolbarIconVue,
    NodeRoundIcon,
    NodeSquareIcon
  },
  setup() {
    const controlStore = useControlStore();
    const positionStyle = computed(() => {
      const btnPosY = document
        .getElementById(`${controlStore.mode}_btn`)
        .getBoundingClientRect().y;
      return `top:${btnPosY}px; left:47px;--bs-border-opacity: 0.2; z-index:3`;
    });
    return { controlStore, positionStyle, Mode };
  }
});
</script>
