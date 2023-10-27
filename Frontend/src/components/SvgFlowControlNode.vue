<template>
  <g v-if="element.channelType === 0">
    <circle
      :cx="element.x"
      :cy="element.y"
      :r="element.properties.r2.value"
      stroke="inherit"
      fill="white"
      fill-opacity="0.7"
      :stroke-width="hightlightOffset + 30"
    />
    <circle
      :cx="element.x"
      :cy="element.y"
      :r="element.properties.r1.value"
      stroke="none"
      fill="inherit"
    />
  </g>
  <g v-else-if="element.channelType === 1">
    <rect
      :x="element.x - element.properties.r2.value"
      :y="element.y - element.properties.r2.value"
      :width="element.properties.r2.value * 2"
      :height="element.properties.r2.value * 2"
      stroke="inherit"
      fill="white"
      fill-opacity="0.7"
      :stroke-width="hightlightOffset + 30"
    />
    <rect
      :x="element.x - element.properties.r1.value"
      :y="element.y - element.properties.r1.value"
      :width="element.properties.r1.value * 2"
      :height="element.properties.r1.value * 2"
      stroke="none"
      fill="inherit"
    />
  </g>
</template>
<script>
import { useContentStore } from "@/stores/content";
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    element: {
      x: Number,
      y: Number,
      id: String
    },
    hightlightOffset: {
      type: Number,
      default: 0
    }
  },
  setup() {
    const contentStore = useContentStore();
    return { contentStore };
  }
});
</script>
