<template>
  <div class="d-flex px-2 py-1 align-items-center w-auto">
    Channel Width:
    <input
      class="form-control mx-2"
      style="width: 100px"
      type="number"
      min="10"
      step="10"
      v-model="contentStore.chipProperties[3].value"
    />
    µm
  </div>
</template>
<script>
import { useContentStore } from "@/stores/content";
import { useControlStore } from "@/stores/control";
import { computed } from "@vue/reactivity";
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    const controlStore = useControlStore();
    const contentStore = useContentStore();
    const positionStyle = computed(() => {
      const btnPosY = document
        .getElementById(`${controlStore.mode}_btn`)
        .getBoundingClientRect().y;
      return `top:${btnPosY}px; left:47px;--bs-border-opacity: 0.2; z-index:3`;
    });
    return {
      positionStyle,
      contentStore
    };
  }
});
</script>
