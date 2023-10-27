<template>
  <div
    class="btn-group btn-group-sm border border-dark bg-light"
    style="--bs-border-opacity: 0.2; z-index: 3"
    role="group"
  >
    <input
      type="radio"
      class="btn-check"
      name="shapeTypeRadio"
      id="shapeType1"
      :value="ShapeType.Hollow"
      v-model="controlStore.defaultShapeType"
    />
    <label
      class="btn btn-outline-info"
      style="border: none; color: inherit"
      for="shapeType1"
      >Hollow</label
    >
    <input
      type="radio"
      class="btn-check"
      name="shapeTypeRadio"
      id="shapeType2"
      :value="ShapeType.Solid"
      v-model="controlStore.defaultShapeType"
    />
    <label
      class="btn btn-outline-info"
      style="border: none; color: inherit"
      for="shapeType2"
      >Solid</label
    >
    <input
      type="radio"
      class="btn-check"
      name="shapeTypeRadio"
      id="shapeType3"
      :value="ShapeType.Channel"
      v-model="controlStore.defaultShapeType"
    />
    <label
      class="btn btn-outline-info"
      style="border: none; color: inherit"
      for="shapeType3"
      >Channel</label
    >
  </div>
</template>
<script>
import { useControlStore } from "@/stores/control";
import { defineComponent } from "vue";
import { ShapeType } from "@/library/other";

export default defineComponent({
  setup() {
    const controlStore = useControlStore();

    return { controlStore, ShapeType };
  }
});
</script>
