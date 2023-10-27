<template>
  <path
    :d="pathDef"
    stroke="inherit"
    :stroke-width="strokeWidth"
    stroke-linejoin="round"
    :fill="fill"
  />
</template>
<script lang="ts">
import ComponentPolygon from "@/library/componentPolygon";
import { ShapeType } from "@/library/other";
import { useContentStore } from "@/stores/content";
import { defineComponent, computed } from "vue";
export default defineComponent({
  props: {
    element: { type: ComponentPolygon, required: true },
    hightlightOffset: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    // hollow : fill=iherit, stroke-width=0
    // solid: fill= white, stroke=1
    // channel: fill = none, stroke=channel width
    const contentStore = useContentStore();
    const pathDef = computed(() =>
      contentStore.polygonPathDefinition(
        props.element.points,
        props.element.properties.radius.value
      )
    );
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
    return { pathDef, ShapeType, strokeWidth, fill };
  }
});
</script>
