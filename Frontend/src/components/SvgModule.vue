<template>
  <g
    :transform="contentStore.moduleTransform(translate, rotation, centerPoint)"
  >
    <g v-if="maskShapes.length > 0 && hightlightOffset == 0">
      <defs>
        <mask :id="maskId">
          <rect
            :x="topLeftCorner[0]"
            :y="topLeftCorner[1]"
            width="100%"
            height="100%"
            fill="white"
          />
          <g fill="white">
            <component
              v-for="(shape, idx) in maskShapes"
              :key="idx"
              :is="shape.vueComponent"
              :shape="shape"
            />
          </g>
        </mask>
      </defs>
      <g :mask="maskRef">
        <component
          v-for="(shape, idx) in borderShapes"
          :key="idx"
          :is="shape.vueComponent"
          :shape="shape"
          :hightlightOffset="hightlightOffset"
      /></g>
    </g>

    <g v-else>
      <component
        v-for="(shape, idx) in borderShapes"
        :key="idx"
        :is="shape.vueComponent"
        :shape="shape"
        :hightlightOffset="hightlightOffset"
      />
    </g>
  </g>
</template>

<script>
import { defineComponent, computed } from "vue";
import PrimitiveChannel from "./SvgModulePrimitives/PrimitiveChannel.vue";
import PrimitiveCircle from "./SvgModulePrimitives/PrimitiveCircle.vue";
import PrimitivePolygon from "./SvgModulePrimitives/PrimitivePolygon.vue";
import PrimitiveRectangle from "./SvgModulePrimitives/PrimitiveRectangle.vue";
import { useContentStore } from "@/stores/content";
import { useMoudleStore } from "@/stores/module";
export default defineComponent({
  props: {
    id: String,
    rotation: {
      type: Number,
      default: () => 0
    },
    translate: {
      type: Array,
      default: () => [0, 0]
    },
    centerPoint: Array,
    topLeftCorner: Array,
    borderShapes: Array,
    maskShapes: Array,
    hightlightOffset: {
      type: Number,
      default: 0
    }
  },
  components: {
    PrimitiveChannel,
    PrimitiveCircle,
    PrimitivePolygon,
    PrimitiveRectangle
  },
  setup(props) {
    const moduleStore = useMoudleStore();
    const contentStore = useContentStore();
    const maskId = computed(() => props.id + "-mask");
    const maskRef = computed(() => "url(#" + maskId.value + ")");
    return { moduleStore, contentStore, maskId, maskRef };
  }
});
</script>
