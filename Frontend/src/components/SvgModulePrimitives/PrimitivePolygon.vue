<template>
  <path
    :d="pathDef"
    stroke="inherit"
    :stroke-width="hightlightOffset"
    stroke-linejoin="round"
    :fill="shape.isFilled ? 'black' : 'inherit'"
  />
</template>
<script>
import { useContentStore } from "@/stores/content";
import { defineComponent, computed } from "vue";
export default defineComponent({
  props: {
    shape: Object,
    hightlightOffset: Number
  },
  setup(props) {
    const contentStore = useContentStore();
    const pathDef = computed(() =>
      contentStore.polygonPathDefinition(props.shape.points, props.shape.r)
    );
    return { pathDef };
  }
});
</script>
