<template>
  <g :id="element.id" v-show="element.display">
    <SvgModule
      v-if="element.type === 'module'"
      :id="element.id"
      :topLeftCorner="element.elementsToRender.topLeftCorner"
      :borderShapes="element.elementsToRender.borderShapes"
      :maskShapes="element.elementsToRender.maskShapes"
      :centerPoint="element.elementsToRender.centerPoint"
      :translate="element.translate"
      :rotation="element.rotation"
    />
    <component v-else :is="element.vueComponent" :element="element" />
  </g>
</template>

<script>
import SvgPolygonVue from "./SvgPolygon.vue";
import SvgCircleVue from "./SvgCircle.vue";
import SvgChannelVue from "./SvgChannel.vue";
import SvgFlowControlNodeVue from "./SvgFlowControlNode.vue";
import SvgBridgeVue from "./SvgBridge.vue";
import SvgLevelConnectionVue from "./SvgLevelConnection.vue";
import SvgModule from "./SvgModule.vue";
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    element: Object
  },
  components: {
    SvgChannelVue,
    SvgFlowControlNodeVue,
    SvgBridgeVue,
    SvgModule,
    SvgLevelConnectionVue,
    SvgPolygonVue,
    SvgCircleVue
  }
});
</script>
