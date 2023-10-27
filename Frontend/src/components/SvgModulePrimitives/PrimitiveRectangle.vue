<template>
  <rect
    :x="shape?.x"
    :y="shape?.y"
    :rx="shape?.r"
    :ry="shape?.r"
    :width="shape?.width"
    :height="shape?.height"
    :fill="shape?.isFilled ? 'black' : 'inherit'"
    stroke="inherit"
    stroke-linejoin="round"
    :stroke-width="hightlightOffset"
  />
</template>
<script>
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    shape: Object,
    hightlightOffset: Number
  }
});
</script>
