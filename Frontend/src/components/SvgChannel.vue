<template>
  <g>
    <!-- channel start & end-->
    <circle
      v-if="element.channelDef[0].isConnectedToPort"
      :cx="element.channelDef[0].position[0]"
      :cy="element.channelDef[0].position[1]"
      stroke="none"
      fill="inherit"
      :r="(element.properties.channelWidth.value + hightlightOffset) / 2"
    />
    <circle
      v-if="element.channelDef[element.channelDef.length - 1].isConnectedToPort"
      :cx="element.channelDef[element.channelDef.length - 1].position[0]"
      :cy="element.channelDef[element.channelDef.length - 1].position[1]"
      stroke="none"
      fill="inherit"
      :r="(element.properties.channelWidth.value + hightlightOffset) / 2"
    />
    <path
      :id="element.id"
      :ref="element.id"
      :d="contentStore.channelDefinition(element)"
      stroke="inherit"
      fill="none"
      :stroke-width="element.properties.channelWidth.value + hightlightOffset"
      stroke-linejoin="round"
    />
  </g>
</template>
<script>
import { useContentStore } from "@/stores/content";
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    element: {
      id: String,
      channelDef: Array,
      translate: Array
    },
    hightlightOffset: {
      type: Number,
      default: 0
    }
  },
  setup() {
    const contentStore = useContentStore();
    return { contentStore };
  }
});
</script>
