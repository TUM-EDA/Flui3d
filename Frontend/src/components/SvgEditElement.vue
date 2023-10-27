<template>
  <g>
    <SvgElementHighlight
      :element="element"
      @mousedown.left.stop="controlStore.startMovingElement"
    />
    <circle
      v-if="
        element.type === 'module' &&
        controlStore.operation !== MouseOperation.MovingElement
      "
      class="rotateButton"
      :cx="element.elementsToRender.topLeftCorner[0]"
      :cy="element.elementsToRender.topLeftCorner[1]"
      :r="controlStore.editingCircleRadius"
      fill="LimeGreen"
      stroke="transparent"
      stroke-width="200"
      :transform="
        contentStore.moduleTransform(
          element.translate,
          element.rotation,
          element.elementsToRender.centerPoint
        )
      "
      @mousedown.left.stop="controlStore.startRotatingModule(element.rotation)"
    />
    <circle
      v-if="controlStore.operation === MouseOperation.RotatingComponent"
      class="rotateButton"
      :cx="coordinateStore.globalCoords[0]"
      :cy="coordinateStore.globalCoords[1]"
      r="10000"
      fill="transparent"
      stroke="transparent"
      @mousemove="setRotation($event)"
      @mouseup.left.stop="controlStore.stopRotatingModule(element)"
    />
  </g>
</template>

<script>
import { defineComponent } from "vue";
import { useControlStore } from "@/stores/control";
import SvgElementHighlight from "./SvgElementHighlight.vue";
import { useCoordinateStore } from "@/stores/coordinate";
import { useContentStore } from "@/stores/content";
import { MouseOperation } from "@/library/other";
export default defineComponent({
  props: {
    element: Object
  },
  components: {
    SvgElementHighlight
  },
  setup(props) {
    const controlStore = useControlStore();
    const coordinateStore = useCoordinateStore();
    const contentStore = useContentStore();
    const setRotation = (e) => {
      const x1 =
        controlStore.startPoint[0] -
        props.element.elementsToRender.centerPoint[0];
      const y1 =
        controlStore.startPoint[1] -
        props.element.elementsToRender.centerPoint[1];
      const x2 =
        coordinateStore.globalCoords[0] -
        props.element.elementsToRender.centerPoint[0];
      const y2 =
        coordinateStore.globalCoords[1] -
        props.element.elementsToRender.centerPoint[1];
      const r =
        ((Math.atan2(y2, x2) - Math.atan2(y1, x1)) * 180) / Math.PI + 360;
      controlStore.setCrtModuleRotation(
        controlStore.startRotation + r,
        e.shiftKey,
        props.element
      );
    };
    return {
      controlStore,
      coordinateStore,
      contentStore,
      setRotation,
      MouseOperation
    };
  }
});
</script>
