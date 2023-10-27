<template>
  <g>
    <circle
      v-for="(point, index) in canBeRounded"
      :key="index"
      :cx="point.position[0]"
      :cy="point.position[1]"
      :r="controlStore.editingCircleRadius"
      fill="white"
      :stroke-width="controlStore.editingStrokeWidth"
      @click="controlStore.addSelectedRounedCorner(point)"
      style="cursor: pointer"
    />
    <circle
      v-for="(point, index) in controlStore.selectedChannelPoints"
      :key="index"
      :cx="point.position[0]"
      :cy="point.position[1]"
      :r="controlStore.editingCircleRadius"
      fill="gold"
      :stroke-width="controlStore.editingStrokeWidth"
      @click="controlStore.removeSelectedRoundedCorner(point)"
      style="cursor: pointer"
    />
  </g>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useControlStore } from "@/stores/control";
import { useContentStore } from "../stores/content";
import { Channel } from "@/library/channel";
import { ChannelPoint } from "@/library/other";
export default defineComponent({
  setup() {
    const controlStore = useControlStore();
    const contentStore = useContentStore();
    const canBeRounded = computed(() =>
      contentStore.crtLayerIds?.reduce((pre, id) => {
        const c = contentStore.getElement(id);
        if (c instanceof Channel && c.display) {
          const end = c.channelDef.length - 1;
          return pre.concat(c.channelDef.slice(1, end));
        } else return pre;
      }, Array<ChannelPoint>())
    );
    return {
      canBeRounded,
      controlStore,
      contentStore
    };
  }
});
</script>
