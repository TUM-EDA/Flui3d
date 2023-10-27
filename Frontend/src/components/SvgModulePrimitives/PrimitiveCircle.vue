<template>
  <circle
    :cx="shape.cx"
    :cy="shape.cy"
    :r="shape.r"
    stroke="inherit"
    :stroke-width="hightlightOffset"
    :fill="shape.isFilled ? 'black' : 'inherit'"
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
