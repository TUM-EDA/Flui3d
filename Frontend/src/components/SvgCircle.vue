<template>
  <circle
    :cx="element.x"
    :cy="element.y"
    :r="element.properties.radius.value"
    stroke="inherit"
    :stroke-width="strokeWidth"
    :fill="fill"
  />
</template>
<script lang="ts">
import ComponentCircle from "@/library/componentCircle";
import { ShapeType } from "@/library/other";
import { defineComponent, computed } from "vue";
export default defineComponent({
  props: {
    element: { type: ComponentCircle, required: true },
    hightlightOffset: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    // hollow : fill=iherit, stroke-width=0
    // solid: fill= white, stroke=1
    // channel: fill = none, stroke=channel width
    const strokeWidth = computed(
      () =>
        props.hightlightOffset +
        (props.element.shapeType === ShapeType.Channel
          ? props.element.properties.channelWidth.value
          : 0)
    );
    const fill = computed(() =>
      props.element.shapeType === ShapeType.Hollow
        ? "inherit"
        : props.element.shapeType === ShapeType.Solid
        ? "white"
        : "none"
    );
    return { ShapeType, strokeWidth, fill };
  }
});
</script>
