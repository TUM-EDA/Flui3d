<template>
  <g>
    <g opacity="0.4" style="cursor: move">
      <SvgModule
        v-if="element.type === 'module'"
        :topLeftCorner="element.elementsToRender.topLeftCorner"
        :borderShapes="element.elementsToRender.borderShapes"
        :maskShapes="element.elementsToRender.maskShapes"
        :centerPoint="element.elementsToRender.centerPoint"
        :translate="element.translate"
        :rotation="element.rotation"
        :hightlightOffset="hightlightOffset"
      />

      <component
        v-else
        :is="element.vueComponent"
        :element="element"
        :hightlightOffset="hightlightOffset"
      />
    </g>
    <text
      v-if="element.type === 'module'"
      :x="element.elementsToRender.centerPoint[0] + element.translate[0]"
      :y="
        element.elementsToRender.topLeftCorner[1] + element.translate[1] - 100
      "
      style="fill: black; font-size: 400px; text-anchor: middle"
    >
      {{ element.id }}</text
    >
    <g v-if="element.type === 'channel'">
      <!-- show segment length -->
      <g v-for="i in [...Array(element.channelDef.length - 1).keys()]" :key="i">
        <path
          style="cursor: move"
          :d="`M${element.channelDef[i].position[0]} ${
            element.channelDef[i].position[1]
          } L${element.channelDef[i + 1].position[0]} ${
            element.channelDef[i + 1].position[1]
          }`"
          stroke="white"
          fill="none"
          stroke-width="20"
          stroke-dasharray="50,50"
          stroke-linejoin="round"
          marker-start="url(#arrowWhite)"
          marker-end="url(#arrowWhite)"
          opacity="0.7"
        />
        <text
          :x="
            (element.channelDef[i].position[0] +
              element.channelDef[i + 1].position[0]) /
            2
          "
          :y="
            (element.channelDef[i].position[1] +
              element.channelDef[i + 1].position[1]) /
            2
          "
          class="channelSegnemtLength"
          @click.stop="showNumberInput(i, $event)"
          >{{
            channelSegInput.segLength(
              element.channelDef[i],
              element.channelDef[i + 1]
            )
          }}
          µm</text
        >
      </g>
      <!-- <path style="cursor: move" :d="pathDef" stroke="black" fill="none" stroke-width="50" stroke-dasharray="100,100"
        stroke-linejoin="round" marker-start="url(#arrow)" marker-end="url(#arrow)" opacity="0.7" /> -->

      <circle
        v-for="(vertex, index) in element.channelDef"
        :key="index"
        :cx="vertex.position[0]"
        :cy="vertex.position[1]"
        :r="controlStore.editingCircleRadius"
        fill="white"
        :stroke-width="controlStore.editingStrokeWidth"
        @mousedown.stop="mouseDownOnChannelPoint(vertex)"
      />
      <circle
        v-if="controlStore.operation === 4"
        :cx="coordinateStore.globalCoords[0]"
        :cy="coordinateStore.globalCoords[1]"
        r="1000"
        fill="transparent"
        stroke="none"
        @mouseup.stop="stopMovingChannelVertex()"
      />
    </g>
    <g v-if="element.type === 'polygon'">
      <circle
        v-for="(vertex, index) in element.points"
        :key="index"
        :cx="vertex[0]"
        :cy="vertex[1]"
        :r="controlStore.editingCircleRadius"
        fill="white"
        :stroke-width="controlStore.editingStrokeWidth"
        @mousedown.stop="mouseDownOnPolygonPoint(vertex)"
      />
      <circle
        v-if="controlStore.operation === 7"
        :cx="coordinateStore.globalCoords[0]"
        :cy="coordinateStore.globalCoords[1]"
        r="1000"
        fill="transparent"
        stroke="none"
        @mouseup.stop="stopMovingPolygonVertex()"
      />
    </g>

    <g v-else-if="element.type === 'module'">
      <!-- channel ports -->
      <circle
        v-for="(port, index) in element.channelPorts"
        :key="index"
        :cx="port.position[0]"
        :cy="port.position[1]"
        :r="controlStore.editingCircleRadius"
        fill="white"
        :stroke-width="controlStore.editingStrokeWidth"
      />
    </g>
  </g>
</template>

<script>
import SvgChannelVue from "./SvgChannel.vue";
import SvgFlowControlNodeVue from "./SvgFlowControlNode.vue";
import SvgBridgeVue from "./SvgBridge.vue";
import SvgLevelConnectionVue from "./SvgLevelConnection.vue";
import SvgPolygonVue from "./SvgPolygon.vue";
import SvgModule from "./SvgModule.vue";
import SvgCircleVue from "./SvgCircle.vue";
import { computed, defineComponent } from "vue";
import { useControlStore } from "@/stores/control";
import { useContentStore } from "@/stores/content";
import { useChannelSegInputStore } from "@/stores/channelSegmentInput";
import { useCoordinateStore } from "@/stores/coordinate";
export default defineComponent({
  props: {
    element: Object
  },
  data() {
    return {
      hightlightOffset: 200
    };
  },
  components: {
    SvgCircleVue,
    SvgChannelVue,
    SvgFlowControlNodeVue,
    SvgBridgeVue,
    SvgModule,
    SvgLevelConnectionVue,
    SvgPolygonVue
  },
  setup(props) {
    const controlStore = useControlStore();
    const contentStore = useContentStore();
    const channelSegInput = useChannelSegInputStore();
    const coordinateStore = useCoordinateStore();
    const pathDef = computed(() => {
      let d = `M${props.element.channelDef[0].position[0]} ${props.element.channelDef[0].position[1]}`;
      for (let i = 1; i < props.element.channelDef.length; i++) {
        d += ` L${props.element.channelDef[i].position[0]} ${props.element.channelDef[i].position[1]}`;
      }
      return d;
    });

    const mouseDownOnChannelPoint = (point) => {
      controlStore.startMovingChanelVertex(props.element, point);
    };

    const mouseDownOnPolygonPoint = (point) => {
      controlStore.startMovingPolygonVertex(props.element, point);
    };

    const stopMovingChannelVertex = () => {
      controlStore.stopMovingChannelVertex();
    };
    const stopMovingPolygonVertex = () => {
      controlStore.stopMovingPolygonVertex();
    };

    const showNumberInput = (idx, e) => {
      const pos_x = e.pageX;
      const pos_y = e.pageY;
      channelSegInput.showChannelSegLengthInput(
        props.element.channelDef[idx],
        props.element.channelDef[idx + 1],
        pos_x,
        pos_y
      );
    };
    return {
      controlStore,
      contentStore,
      channelSegInput,
      coordinateStore,
      pathDef,
      mouseDownOnChannelPoint,
      mouseDownOnPolygonPoint,
      stopMovingChannelVertex,
      stopMovingPolygonVertex,
      showNumberInput
    };
  }
});
</script>
<style scoped>
.channelSegnemtLength {
  font-size: 300px;
  fill: black;
  text-anchor: middle;
  cursor: pointer;
}
</style>
