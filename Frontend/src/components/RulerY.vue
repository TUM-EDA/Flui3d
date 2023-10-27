<template>
  <g :transform="coordinateStrore.windowTranslate" class="ruler">
    <text
      v-for="num in nums"
      :key="num"
      :x="
        coordinateStrore.globalToWindow(-coordinateStrore.globalTranslateX) + 70
      "
      :y="coordinateStrore.globalToWindow(num)"
      fill="grey"
      font-size="small"
      text-anchor="middle"
      >{{ num }}</text
    >
  </g>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useCoordinateStore } from "@/stores/coordinate";
import { useContentStore } from "@/stores/content";

export default defineComponent({
  setup() {
    const coordinateStrore = useCoordinateStore();
    const contentStore = useContentStore();
    const nums = computed(() => {
      return coordinateStrore.range(
        coordinateStrore.startY,
        coordinateStrore.endY,
        coordinateStrore.step
      );
    });
    return {
      contentStore,
      coordinateStrore,
      nums
    };
  }
});
</script>

<style scoped>
.ruler {
  user-select: none;
}
</style>
