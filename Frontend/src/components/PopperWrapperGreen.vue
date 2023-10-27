<template>
  <!-- Hardcoded "hover", "openDelay" and "closeDelay" -->
  <Popper v-bind="$attrs" hover>
    <slot />
    <template #content="props">
      <slot name="content" v-bind="props" />
    </template>
  </Popper>
</template>

<script>
import { defineComponent } from "vue";
import Popper from "vue3-popper";

export default defineComponent({
  name: "PopperWrapperGreen",
  components: {
    Popper
  }
});
</script>
<style scoped>
:deep(.popper) {
  background: green;
  color: white;
  border-width: 0px;
  border-radius: 6px;
  padding: 20px;
  box-shadow: 0 6px 30px -6px rgba(0, 0, 0, 0.25);
}
:deep(.popper #arrow::before) {
  background: green;
}

:deep(.popper:hover),
:deep(.popper:hover > #arrow::before) {
  background: green;
}
</style>
