<template>
  <g v-if="channel.channelDef.length > 1">
    <path
      :d="pathDef"
      stroke="inherit"
      fill="none"
      :stroke-width="channel.properties.channelWidth.value"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <g v-for="i in [...Array(channel.channelDef.length - 1).keys()]" :key="i">
      <path
        :d="`M${channel.channelDef[i].position[0]} ${
          channel.channelDef[i].position[1]
        } L${channel.channelDef[i + 1].position[0]} ${
          channel.channelDef[i + 1].position[1]
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
          (channel.channelDef[i].position[0] +
            channel.channelDef[i + 1].position[0]) /
          2
        "
        :y="
          (channel.channelDef[i].position[1] +
            channel.channelDef[i + 1].position[1]) /
          2
        "
        class="channelSegnemtLength"
        >{{
          channelSegInput.segLength(
            channel.channelDef[i],
            channel.channelDef[i + 1]
          )
        }}
        µm</text
      >
    </g>

    <circle
      v-for="(vertex, index) in channel.channelDef"
      :key="index"
      :cx="vertex.position[0]"
      :cy="vertex.position[1]"
      :r="controlStore.editingCircleRadius"
      fill="white"
      :stroke-width="controlStore.editingStrokeWidth"
    />

    <!-- lock chanel segment length -->
    <circle
      v-if="channelSegInput.lengthLocked"
      :cx="coordinateStore.globalCoords[0]"
      :cy="coordinateStore.globalCoords[1]"
      r="10000"
      fill="transparent"
      stroke="transparent"
      @mousemove="channelSegInput.updateChannelSegDirection($event.shiftKey)"
    />
  </g>
</template>
<script lang="ts">
import { Channel } from "@/library/channel";
import { useChannelSegInputStore } from "@/stores/channelSegmentInput";
import { useControlStore } from "@/stores/control";
import { useCoordinateStore } from "@/stores/coordinate";
import { computed, defineComponent } from "vue";
export default defineComponent({
  props: {
    channel: { type: Channel, required: true }
  },
  setup(props) {
    const controlStore = useControlStore();
    const channelSegInput = useChannelSegInputStore();
    const coordinateStore = useCoordinateStore();
    const pathDef = computed(() => {
      let d = `M${props.channel.channelDef[0].position[0]} ${props.channel.channelDef[0].position[1]}`;
      for (let i = 1; i < props.channel.channelDef.length; ++i) {
        d += ` L${props.channel.channelDef[i].position[0]} ${props.channel.channelDef[i].position[1]}`;
      }
      return d;
    });

    return { controlStore, channelSegInput, pathDef, coordinateStore };
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
