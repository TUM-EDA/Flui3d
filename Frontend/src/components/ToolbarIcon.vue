<template>
  <button
    :id="`mode${mode}_btn`"
    :title="title"
    style="border: none"
    class="btn btn-outline-info p-2"
    :class="{ active: isActive }"
  >
    <svg
      width="20"
      height="20"
      viewBox="-1 -1 20 20"
      fill="#333333"
      stroke="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <slot />
    </svg>
  </button>
</template>
<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    title: String,
    isActive: Boolean,
    mode: Number
  }
});
</script>
