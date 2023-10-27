<template>
  <g :transform="transform">
    <defs>
      <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color: black; stop-opacity: 0.25" />

        <stop
          :offset="topOffset"
          style="stop-color: black; stop-opacity: 0.75"
        />

        <stop offset="100%" style="stop-color: black; stop-opacity: 0.25" />
      </linearGradient>
    </defs>
    <line
      :x1="x1"
      :y1="y"
      :x2="x2"
      :y2="y"
      stroke="inherit"
      :stroke-width="width + hightlightOffset"
    />
    <rect
      :x="x1"
      :y="y - width / 2"
      :width="x2 - x1"
      :height="width"
      :fill="gradientRef"
      opacity="0.9"
    />
  </g>
</template>
<script>
import { Channel } from "@/library/channel";
import { useContentStore } from "@/stores/content";
import { useCoordinateStore } from "@/stores/coordinate";
import { defineComponent, computed } from "vue";
export default defineComponent({
  props: {
    element: {
      posOnSeg: Number,
      channelSegment: Object
    },
    hightlightOffset: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const coordinate = useCoordinateStore();
    const contentStore = useContentStore();
    const gradientId = computed(() => `${props.element.id}-gradient`);
    const gradientRef = computed(() => `url(#${gradientId.value})`);
    const lengthLeft = computed(
      () =>
        props.element.properties.height.value /
        Math.tan((props.element.properties.slopeL.value / 180) * Math.PI)
    );
    const lengthRight = computed(
      () =>
        props.element.properties.height.value /
        Math.tan((props.element.properties.slopeR.value / 180) * Math.PI)
    );
    const topOffset = computed(
      () => lengthLeft.value / (lengthLeft.value + lengthRight.value)
    );
    const vx = computed(
      () =>
        props.element.channelSegment.end.position[0] -
        props.element.channelSegment.start.position[0]
    );
    const vy = computed(
      () =>
        props.element.channelSegment.end.position[1] -
        props.element.channelSegment.start.position[1]
    );
    // (x, y) is the highest point of the bridge
    const x = computed(() =>
      props.element.posOnSeg >= 0
        ? props.element.channelSegment.start.position[0] +
          vx.value * props.element.posOnSeg
        : coordinate.roundedGlobalCoords[0]
    );

    const y = computed(() =>
      props.element.posOnSeg >= 0
        ? props.element.channelSegment.start.position[1] +
          vy.value * props.element.posOnSeg
        : coordinate.roundedGlobalCoords[1]
    );

    const x1 = computed(() => x.value - lengthLeft.value);
    const x2 = computed(() => x.value + lengthRight.value);
    const width = computed(() => {
      if (props.element.posOnSeg >= 0) {
        const channel = contentStore.getElement(
          props.element.channelSegment.cid
        );
        if (channel instanceof Channel) {
          return channel.properties.channelWidth.value;
        }
      }
      return contentStore.defaultChannelWidth;
    });

    const transform = computed(() => {
      return `rotate(${
        (props.element.posOnSeg >= 0
          ? Math.atan2(vy.value, vx.value) * 180
          : 0) / Math.PI
      } ${x.value} ${y.value})`;
    });
    return {
      y,
      x1,
      x2,
      contentStore,
      transform,
      width,
      gradientId,
      gradientRef,
      topOffset
    };
  }
});
</script>
