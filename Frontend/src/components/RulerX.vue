<template>
  <g :transform="coordinateStrore.windowTranslate" class="ruler">
    <text
      v-for="num in nums"
      :key="num"
      :x="coordinateStrore.globalToWindow(num)"
      :y="
        coordinateStrore.globalToWindow(-coordinateStrore.globalTranslateY) + 50
      "
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

export default defineComponent({
  setup() {
    const coordinateStrore = useCoordinateStore();
    const nums = computed(() =>
      coordinateStrore.range(
        coordinateStrore.startX,
        coordinateStrore.endX,
        coordinateStrore.step
      )
    );

    return {
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
