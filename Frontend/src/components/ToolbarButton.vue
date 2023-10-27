<template>
  <ToolbarIconVue
    @click="setMode"
    :isActive="mode === control.mode"
    :title="title"
    :mode="mode"
  >
    <slot />
  </ToolbarIconVue>
</template>
<script>
import { useContentStore } from "@/stores/content";
import { useControlStore } from "@/stores/control";
import ToolbarIconVue from "./ToolbarIcon.vue";
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    title: String,
    mode: Number
  },
  components: {
    ToolbarIconVue
  },
  setup(props) {
    const control = useControlStore();
    const content = useContentStore();
    const setMode = () => {
      content.discardSelected();
      control.switchMode(props.mode);
    };
    return { control, setMode };
  }
});
</script>
