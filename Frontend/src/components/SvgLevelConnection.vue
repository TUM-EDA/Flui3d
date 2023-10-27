<template>
  <g
    v-show="element.display"
    :stroke="contentStore.colorOfCrtLayer"
    :opacity="insersect ? 1 : 0.7"
  >
    <g
      :stroke-width="hightlightOffset"
      :fill="insersect ? contentStore.colorOfCrtLayer : 'grey'"
    >
      <circle
        v-if="element.channelType === 0"
        :cx="element.x"
        :cy="element.y"
        :r="element.properties.r.value"
      />
      <rect
        v-else-if="element.channelType === 1"
        :x="element.x - element.properties.r.value"
        :y="element.y - element.properties.r.value"
        :width="element.properties.r.value * 2"
        :height="element.properties.r.value * 2"
      />
    </g>
    <g stroke-width="50" stroke="black" opacity="0.7">
      <circle
        v-if="element.channelType === 0"
        :cx="element.x"
        :cy="element.y"
        :r="element.properties.r.value"
        fill="none"
      />
      <rect
        v-else-if="element.channelType === 1"
        :x="element.x - element.properties.r.value"
        :y="element.y - element.properties.r.value"
        :width="element.properties.r.value * 2"
        :height="element.properties.r.value * 2"
        fill="none"
      />
      <line
        :x1="element.x"
        :y1="element.y - offset"
        :x2="element.x"
        :y2="element.y + offset"
      />
      <line
        :x1="element.x - offset"
        :y1="element.y"
        :x2="element.x + offset"
        :y2="element.y"
      />
    </g>
  </g>
</template>
<script>
import { useContentStore } from "@/stores/content";
import { useControlStore } from "@/stores/control";
import { computed, defineComponent } from "vue";
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
  setup(props) {
    const contentStore = useContentStore();
    const controlStore = useControlStore();
    const offset = computed(() => props.element.properties.r.value + 50);
    const h1 = computed(
      () =>
        contentStore.layers.get(props.element.properties.startLv.value).height
    );
    const h2 = computed(
      () => contentStore.layers.get(props.element.properties.endLv.value).height
    );
    const insersect = computed(() => {
      const h = contentStore.heightOfCrtLayer;
      return (
        h >= Math.min(h1.value, h2.value) && h <= Math.max(h1.value, h2.value)
      );
    });
    return { contentStore, controlStore, offset, insersect };
  }
});
</script>
