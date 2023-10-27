<template>
  <div class="p-0">
    <div
      v-for="(layer, idx) in Array.from(contentStore.layers.values())
        .slice()
        .reverse()"
      :key="idx"
      class="d-flex m-2"
    >
      <button
        class="btn btn-outline-danger me-3 btn-sm"
        @click="contentStore.deleteLevel(layer.label)"
      >
        <i class="fa-solid fa-minus"></i>
      </button>
      <div
        class="me-3 layer-label pt-1"
        :style="layerButtonColorStyle(layer)"
        style="width: 40px"
      >
        {{ layer.label }}
      </div>
      <input
        type="range"
        class="form-range me-3"
        style="width: 200px"
        min="0"
        :max="contentStore.maxLevelHeight"
        step="100"
        :value="layer.height"
        @input="changeLevelHeight(layer, $event.target.value)"
      />
      <input
        type="number"
        class="form-control py-0 me-2 mb-1"
        style="width: 80px; border: none"
        min="0"
        :max="contentStore.maxLevelHeight"
        v-model="layer.height"
        @input="changeLevelHeight(layer, $event.target.value)"
      />
      µm
    </div>

    <form class="d-flex m-2" @submit.prevent="addNewLevel">
      <button class="btn btn-outline-success me-3 btn-sm" title="New Level">
        <i class="fa-solid fa-plus"></i>
      </button>
      <input
        type="number"
        class="form-control me-3 py-0"
        min="100"
        :max="contentStore.maxLevelHeight"
        step="100"
        v-model="h"
        required
      />
      µm
    </form>
  </div>
</template>
<script setup>
import { useContentStore } from "@/stores/content";
import { ref } from "vue";
const layerButtonColorStyle = (layer) => {
  return { backgroundColor: layer.color };
};
const changeLevelHeight = (layer, value) => {
  layer.height = +value;
};
const contentStore = useContentStore();
const h = ref(undefined);
const addNewLevel = () => {
  contentStore.createNewLevel(h.value);
  h.value = undefined;
};
</script>

<style scoped>
.layer-label {
  padding: 0 3px;
  color: white;
  border: none;
  border-radius: 5px;
  text-align: center;
}
</style>
