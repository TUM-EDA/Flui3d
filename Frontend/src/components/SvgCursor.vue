<template>
  <g>
    <circle
      v-if="
        controlStore.mode === Mode.Channel || controlStore.mode === Mode.Polygon
      "
      :cx="coordinateStore.roundedGlobalCoords[0]"
      :cy="coordinateStore.roundedGlobalCoords[1]"
      :r="contentStore.defaultChannelWidth / 2"
      opacity="0.5"
    />
    <g v-else-if="controlStore.isPlacingModule" opacity="0.5">
      <SvgModuleVue
        id="cursor-module"
        :topLeftCorner="
          moduleStore.selectedModuleCreator.pendingModule.elementsToRender
            .topLeftCorner
        "
        :borderShapes="
          moduleStore.selectedModuleCreator.pendingModule.elementsToRender
            .borderShapes
        "
        :maskShapes="
          moduleStore.selectedModuleCreator.pendingModule.elementsToRender
            .maskShapes
        "
        :centerPoint="
          moduleStore.selectedModuleCreator.pendingModule.elementsToRender
            .centerPoint
        "
      />

      <!-- click to place the module -->
      <circle
        :cx="coordinateStore.globalCoords[0]"
        :cy="coordinateStore.globalCoords[1]"
        r="10000"
        fill="transparent"
        stroke="transparent"
        @click.stop="controlStore.finishModulePlacement"
        @mousemove="updateModulePosition"
      />
    </g>
    <!-- circle -->
    <g v-else-if="controlStore.mode === Mode.Circle" opacity="0.5">
      <circle
        :cx="coordinateStore.roundedGlobalCoords[0]"
        :cy="coordinateStore.roundedGlobalCoords[1]"
        :r="controlStore.circleRadius"
        fill="inherit"
        stroke="none"
      />

      <!-- click for placement -->
      <circle
        :cx="coordinateStore.globalCoords[0]"
        :cy="coordinateStore.globalCoords[1]"
        r="10000"
        fill="transparent"
        stroke="transparent"
        @click.stop="controlStore.finishCirclePlacement"
      />
    </g>

    <g v-else-if="controlStore.mode === Mode.InletOutlet" opacity="0.5">
      <SvgFlowControlNodeVue
        :element="{
          x: coordinateStore.roundedGlobalCoords[0],
          y: coordinateStore.roundedGlobalCoords[1],
          properties: {
            r1: { value: controlStore.defaultPortRadius },
            r2: { value: controlStore.defaultPortRadius + 200 }
          },
          translate: [0, 0],
          channelType: controlStore.channelType
        }"
      />

      <!-- click to place the control node -->
      <circle
        :cx="coordinateStore.globalCoords[0]"
        :cy="coordinateStore.globalCoords[1]"
        r="10000"
        fill="transparent"
        stroke="transparent"
        @click.stop="controlStore.finishCtrlNodePlacement"
      />
    </g>

    <g v-else-if="controlStore.mode === Mode.Bridge">
      <SvgBridgeVue
        :element="{
          id: 'cursor',
          channelSegment: controlStore.channelSeg,
          posOnSeg: controlStore.posOnSeg,
          properties: {
            height: { value: 800 },
            slopeL: { value: 30 },
            slopeR: { value: 30 }
          },

          rotation: controlStore.canPlaceBridge
            ? controlStore.bridgeRotation
            : 0,
          width: controlStore.canPlaceBridge
            ? controlStore.bridgeWidth
            : contentStore.defaultChannelWidth
        }"
      />
      <!-- placement event in snapping channel segment -->
    </g>

    <g v-else-if="controlStore.mode === Mode.InterLayer" opacity="0.5">
      <SvgLevelConnectionVue
        :element="{
          x: coordinateStore.roundedGlobalCoords[0],
          y: coordinateStore.roundedGlobalCoords[1],
          properties: {
            startLv: { value: contentStore.crtLayer },
            endLv: { value: contentStore.crtLayer },
            r: { value: controlStore.defaultViaRadius }
          },
          translate: [0, 0],
          channelType: controlStore.channelType,
          display: true
        }"
      />
      <circle
        :cx="coordinateStore.globalCoords[0]"
        :cy="coordinateStore.globalCoords[1]"
        r="10000"
        fill="transparent"
        stroke="transparent"
        @click.stop="controlStore.finishLevelConnectionPlacement"
      />
    </g>
  </g>
</template>

<script>
import { useCoordinateStore } from "@/stores/coordinate";
import { useMoudleStore } from "@/stores/module";
import { defineComponent } from "vue";
import { useControlStore } from "../stores/control";
import SvgModuleVue from "./SvgModule.vue";
import SvgFlowControlNodeVue from "./SvgFlowControlNode.vue";
import SvgBridgeVue from "./SvgBridge.vue";
import SvgLevelConnectionVue from "./SvgLevelConnection.vue";
import { useContentStore } from "@/stores/content";
import { Mode } from "@/library/other";

export default defineComponent({
  components: {
    SvgModuleVue,
    SvgFlowControlNodeVue,
    SvgBridgeVue,
    SvgLevelConnectionVue
  },
  setup() {
    const controlStore = useControlStore();
    const coordinateStore = useCoordinateStore();
    const contentStore = useContentStore();
    const moduleStore = useMoudleStore();
    const updateModulePosition = () => {
      moduleStore.selectedModuleCreator.updatePendingModulePosition(
        coordinateStore.roundedGlobalCoords
      );
    };
    return {
      controlStore,
      coordinateStore,
      contentStore,
      moduleStore,
      updateModulePosition,
      Mode
    };
  }
});
</script>
