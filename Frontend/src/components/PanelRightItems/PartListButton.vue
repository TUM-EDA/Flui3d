<template>
  <button class="btn btn-light btn-sm me-2 mb-1" @click="selectElement">
    {{ id }}
  </button>
</template>
<script lang="ts">
import { LevelConnection } from "@/library/levelConnection";
import { ContentUnitGeneral, Mode } from "@/library/other";
import { useContentStore } from "@/stores/content";
import { useControlStore } from "@/stores/control";
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const contentStore = useContentStore();
    const controlStore = useControlStore();
    const selectElement = () => {
      const elm = contentStore.getElement(props.id);
      if (elm instanceof ContentUnitGeneral) {
        controlStore.switchMode(Mode.Select);
        if (!(elm instanceof LevelConnection)) {
          contentStore.changeCrtLayer(elm.layer);
        }
        controlStore.selectElement(props.id);
      }
    };
    return { contentStore, selectElement };
  }
});
</script>
