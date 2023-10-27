<template>
  <svg
    class="svg_canvas"
    :width="coordinateStore.canvasSide"
    :height="coordinateStore.canvasSide"
    viewBox="0 0 1000000 1000000"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g :transform="coordinateStore.globalTransform">
      <!-- inactivelayers-->
      <g opacity="0.3" id="svgContent">
        <g
          v-for="(layer, idx) in Array.from(contentStore.layers.values())"
          :key="idx"
          :stroke="layer.color"
          :fill="layer.color"
          :id="layer.id"
        >
          <SvgElement
            v-for="id in contentStore.layers.get(layer.id)?.contentIds"
            :element="(contentStore.contentMap.get(id) as ContentUnitGeneral)"
            :key="id"
          />
        </g>
      </g>
      <!-- layer current -->
      <g
        :stroke="contentStore.colorOfCrtLayer"
        :fill="contentStore.colorOfCrtLayer"
      >
        <SvgElement
          :element="(contentStore.contentMap.get(id) as ContentUnitGeneral)"
          :class="{ crtLayerElm: controlStore.mode === Mode.Select }"
          v-for="id in contentStore.crtLayerIds"
          :key="id"
          @mousedown.left.stop="
            controlStore.mouseDownOnElement(
              id,
              $event.shiftKey || $event.ctrlKey
            )
          "
        />
        <SvgLevelConnectionAllVue />

        <SvgCursor
          v-if="
            controlStore.mode === Mode.Channel ||
            controlStore.mode === Mode.Polygon ||
            controlStore.mode === Mode.InletOutlet ||
            controlStore.mode === Mode.Bridge ||
            controlStore.mode === Mode.InterLayer ||
            controlStore.mode === Mode.Circle ||
            controlStore.isPlacingModule
          "
        />

        <!-- adding new channel -->
        <SvgChannelDraw
          v-if="controlStore.isAddingChannel"
          :channel="controlStore.crtChannel"
        />
        <!-- adding new polygon -->
        <SvgPolygonDrawVue
          v-if="controlStore.isAddingPolygon"
          :polygon="controlStore.crtPolygon"
        />
        <!-- editing element -->
        <SvgEditElement
          v-if="
            controlStore.selectionState === SelectionState.EditingdSingleElement
          "
          :element="contentStore.crtElement"
        />
        <SvgEditGroupVue
          v-if="controlStore.selectionState === SelectionState.EditingGroup"
        />

        <SvgChannelPortsVue
          v-if="
            controlStore.mode === Mode.Channel ||
            controlStore.operation === MouseOperation.MovingChannelVertex
          "
        />

        <ChannelSegmentsForBridgePlacementVue
          v-if="
            controlStore.isEditingBridge ||
            (controlStore.isAddingChannel && !channelSegInput.lengthLocked) ||
            (controlStore.selectionState ===
              SelectionState.EditingdSingleElement &&
              controlStore.isEditingChannelPoint)
          "
        />
        <SvgChannelPointsRoundedVue
          v-if="controlStore.mode === Mode.RoundedCorner"
        />
        <!-- panning -->
        <circle
          style="cursor: grabbing"
          v-if="controlStore.isPanning"
          :cx="coordinateStore.globalCoords[0]"
          :cy="coordinateStore.globalCoords[1]"
          r="10000"
          fill="transparent"
          stroke="none"
          @mousemove.stop="
            coordinateStore.panWithMovement($event.movementX, $event.movementY)
          "
        />
      </g>
    </g>
  </svg>
</template>
<script lang="ts">
import { useCoordinateStore } from "@/stores/coordinate";
import { useContentStore } from "@/stores/content";
import SvgElement from "./SvgElement.vue";
import { defineComponent } from "vue";
import SvgChannelDraw from "./SvgChannelDraw.vue";
import { useControlStore } from "@/stores/control";
import SvgCursor from "./SvgCursor.vue";
import ChannelSegmentsForBridgePlacementVue from "./ChannelSegmentsForBridgePlacement.vue";
import SvgEditElement from "./SvgEditElement.vue";
import SvgChannelPortsVue from "./SvgChannelPorts.vue";
import SvgChannelPointsRoundedVue from "./SvgChannelPointsRounded.vue";
import SvgLevelConnectionAllVue from "./SvgLevelConnectionAll.vue";
import SvgEditGroupVue from "./SvgEditGroup.vue";
import SvgPolygonDrawVue from "./SvgPolygonDraw.vue";
import { useChannelSegInputStore } from "@/stores/channelSegmentInput";
import {
  Mode,
  SelectionState,
  MouseOperation,
  ContentUnitGeneral
} from "@/library/other";

export default defineComponent({
  components: {
    SvgElement,
    SvgChannelDraw,
    SvgCursor,
    ChannelSegmentsForBridgePlacementVue,
    SvgEditElement,
    SvgChannelPortsVue,
    SvgChannelPointsRoundedVue,
    SvgLevelConnectionAllVue,
    SvgEditGroupVue,
    SvgPolygonDrawVue
  },
  props: {
    isActive: Boolean,
    idx: Number
  },
  setup() {
    const coordinateStore = useCoordinateStore();
    const contentStore = useContentStore();
    const controlStore = useControlStore();
    const channelSegInput = useChannelSegInputStore();
    return {
      coordinateStore,
      channelSegInput,
      contentStore,
      controlStore,
      Mode,
      SelectionState,
      MouseOperation,
      ContentUnitGeneral
    };
  }
});
</script>

<style>
.svg_canvas {
  position: absolute;
  opacity: 0.7;
}

.crtLayerElm:hover {
  cursor: pointer;
  filter: brightness(1.5);
}
</style>
