<template>
  <!-- <div id="grid" title="Press Tab to toggle precision">
    <span>Precision: {{ coordinate.precision }} μm</span><br />
    <span>Grid Size: {{ coordinate.precisionGrid }} μm</span>
  </div> -->

  <div id="zoom">
    <div class="zoom_icon" title="Reset view" @click="coordinate.resetView">
      <i class="fas fa-compress"></i>
    </div>

    <div class="zoom_icon" title="Zoom in" @click="coordinate.zoomIn">
      <i class="fas fa-search-plus"></i>
    </div>
    <input
      type="range"
      id="zoom_range"
      title="zoom"
      name="zoom"
      min="0"
      :max="gridSizeList.length - 1"
      :value="coordinate.zoomIdx"
      disabled="true"
      orient="vertical"
    />

    <div class="zoom_icon" title="Zoom out" @click="coordinate.zoomOut">
      <i class="fas fa-search-minus"></i>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { gridSizeList } from "@/library/hardCodedValues";
import { useCoordinateStore } from "@/stores/coordinate";
const coordinate = useCoordinateStore();
</script>

<style scoped>
#zoom_range {
  align-self: center;
  width: 30px;
  height: 100px;
  -moz-appearance: slider-vertical;
  -webkit-appearance: slider-vertical;
}

.zoom_icon {
  box-sizing: border-box;
  padding: 5px;
  margin: 5px;
  cursor: pointer;
}

.zoom_icon:hover {
  color: dodgerblue;
}

#zoom {
  color: rgb(85, 85, 85);
  text-align: center;
  position: fixed;
  bottom: 20px;
  left: 10px;
  display: flex;
  flex-direction: column;
}

#grid {
  position: fixed;
  bottom: 30px;
  left: 100px;
  font-size: 0.9rem;
}
</style>
