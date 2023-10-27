<template>
  <path
    :d="shape.d"
    fill="transparent"
    :stroke="shape.isFilled ? 'black' : 'inherit'"
    :stroke-width="shape.strokeWidth + hightlightOffset"
    stroke-linejoin="round"
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
