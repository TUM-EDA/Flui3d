<template>
  <g
    @mouseenter="controlStore.enableBridgePlacement()"
    @mouseleave="onMouseLeave()"
  >
    <circle
      v-if="coordinateStore.snapping"
      :cx="coordinateStore.roundedGlobalCoords[0]"
      :cy="coordinateStore.roundedGlobalCoords[1]"
      r="200"
      fill="cyan"
      opacity="0.7"
    />
    <line
      v-for="(line, idx) in contentStore.channelSegmentsForBridgePlacement"
      :key="idx"
      :x1="line.start.position[0]"
      :y1="line.start.position[1]"
      :x2="line.end.position[0]"
      :y2="line.end.position[1]"
      stroke="transparent"
      :stroke-width="line.width"
      @mousemove="mouseMoveOnSegment(line)"
      @mouseup.stop="mouseClickOnSegment()"
      @mouseenter="mouseEnterSegment(line)"
    />
  </g>
</template>
<script lang="ts">
import { ChannelSegment, Mode } from "@/library/other";
import { useContentStore } from "@/stores/content";
import { useControlStore } from "@/stores/control";
import { useCoordinateStore } from "@/stores/coordinate";
import { defineComponent, onBeforeUnmount } from "vue";

export default defineComponent({
  setup() {
    const contentStore = useContentStore();
    const controlStore = useControlStore();
    const coordinateStore = useCoordinateStore();

    const mouseEnterSegment = (line: ChannelSegment) => {
      if (controlStore.isEditingBridge) {
        controlStore.setBridgeChannelSeg(line);
      } else {
        // adding/editing channel point
        coordinateStore.snapping = true;
      }
    };
    const mouseClickOnSegment = () => {
      if (controlStore.mode === Mode.Bridge) {
        controlStore.finishBridgePlacement();
      } else {
        // editing bridge / adding/editing channel point
        controlStore.handleMouseUpLeft();
      }
    };
    const mouseMoveOnSegment = (line: ChannelSegment) => {
      const x0 = coordinateStore.globalCoords[0];
      const y0 = coordinateStore.globalCoords[1];
      const ab = [
        line.end.position[0] - line.start.position[0],
        line.end.position[1] - line.start.position[1]
      ];
      const ac = [x0 - line.start.position[0], y0 - line.start.position[1]];
      const bc = [x0 - line.end.position[0], y0 - line.end.position[1]];
      // ac * ab
      const l1 = Math.abs(ab[0] * ac[0] + ab[1] * ac[1]);
      // bc * ab
      const l2 = Math.abs(ab[0] * bc[0] + ab[1] * bc[1]);
      const ratio = l1 / (l1 + l2);
      if (controlStore.isEditingBridge) {
        controlStore.setPosOnSeg(ratio);
      } else {
        // adding/editing channel point
        const x = ab[0] * ratio + line.start.position[0];
        const y = ab[1] * ratio + line.start.position[1];
        coordinateStore.roundedGlobalCoords[0] = x;
        coordinateStore.roundedGlobalCoords[1] = y;
      }
    };

    const onMouseLeave = () => {
      coordinateStore.snapping = false;
      controlStore.disableBridgePlacement();
    };
    onBeforeUnmount(() => {
      onMouseLeave();
    });

    return {
      contentStore,
      controlStore,
      coordinateStore,
      onMouseLeave,
      mouseEnterSegment,
      mouseMoveOnSegment,
      mouseClickOnSegment
    };
  }
});
</script>
