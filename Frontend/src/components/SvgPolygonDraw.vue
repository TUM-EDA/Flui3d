<template>
  <g v-if="polygon.points.length > 1">
    <path
      :d="pathDef"
      stroke="inherit"
      fill="none"
      :stroke-width="polygon.properties.channelWidth.value"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <circle
      v-for="(vertex, index) in polygon.points"
      :key="index"
      :cx="vertex[0]"
      :cy="vertex[1]"
      :r="controlStore.editingCircleRadius"
      fill="white"
      :stroke-width="controlStore.editingStrokeWidth"
    />
  </g>
</template>
<script>
import ComponentPolygon from "@/library/componentPolygon";
import { useControlStore } from "@/stores/control";
import { computed, defineComponent } from "vue";
export default defineComponent({
  props: {
    polygon: ComponentPolygon
  },
  setup(props) {
    const controlStore = useControlStore();
    const pathDef = computed(() => {
      let d = `M${props.polygon.points[0][0]} ${props.polygon.points[0][1]}`;
      for (let i = 1; i < props.polygon.points.length; ++i) {
        d += ` L${props.polygon.points[i][0]} ${props.polygon.points[i][1]}`;
      }
      return d + "Z";
    });

    return { controlStore, pathDef };
  }
});
</script>
