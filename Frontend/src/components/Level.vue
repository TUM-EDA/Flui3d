<template>
  <div class="d-flex px-2 rounded bg-light">
    <span>Elevation: 0 µm</span>
    <div
      class="rounded pe-2 ms-2"
      :class="{ flash: controlStore.mode === Mode.InterLayer }"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="420"
        height="20"
        viewBox="-10 0 410 20"
      >
        <rect
          x="0"
          y="5"
          width="400"
          height="10"
          fill="#333333"
          rx="5"
          ry="5"
          opacity="0.15"
        />

        <!-- avtive layer -->
        <rect
          :x="
            (contentStore.heightOfCrtLayer * 400) / contentStore.chipThickness
          "
          y="5"
          r="10"
          :width="
            (contentStore.defaultModuleHeight * 400) /
            contentStore.chipThickness
          "
          height="10"
          rx="5"
          ry="5"
          fill="none"
          :stroke="contentStore.colorOfCrtLayer"
          stroke-width="10"
          opacity="0.5"
        />
        <rect
          v-for="(layer, idx) in Array.from(contentStore.layers.values())"
          :key="idx"
          style="cursor: pointer"
          :x="(layer.height * 400) / contentStore.chipThickness"
          y="5"
          :width="
            (contentStore.defaultModuleHeight * 400) /
            contentStore.chipThickness
          "
          height="10"
          rx="5"
          ry="5"
          :fill="layer.color"
          stroke="none"
          @click="contentStore.changeCrtLayer(layer.label)"
        />

        <g v-if="controlStore.mode === Mode.InterLayer">
          <circle
            v-for="(layer, idx) in Array.from(contentStore.layers.values())"
            :key="idx"
            :cx="
              ((layer.height + contentStore.defaultModuleHeight / 2) * 400) /
              contentStore.chipThickness
            "
            cy="10"
            r="5"
            fill="white"
            :stroke="layer.color"
            stroke-width="5"
          />
          <line
            v-if="controlStore.level.end !== ''"
            :x1="levelPreviewStart"
            :x2="levelPreviewPoint(controlStore.level.end)"
            y1="10"
            y2="10"
            stroke="cyan"
            stroke-width="15"
            stroke-linecap="round"
            opacity="0.8"
          />
          <circle
            :cx="levelPreviewStart"
            cy="10"
            r="4"
            fill="white"
            stroke="none"
          />
          <circle
            :cx="levelPreviewPoint(controlStore.level.end)"
            cy="10"
            r="4"
            fill="white"
            stroke="none"
          />

          <circle
            v-for="(layer, idx) in Array.from(contentStore.layers.values())"
            :key="idx"
            :cx="
              ((layer.height + contentStore.defaultModuleHeight / 2) * 400) /
              contentStore.chipThickness
            "
            cy="10"
            r="10"
            fill="transparent"
            stroke="none"
            @mouseenter="controlStore.setLevelEnd(layer.label)"
          />
        </g>
        <g
          v-else-if="
            controlStore.selectionState === 2 &&
            contentStore.crtElement.type === 'level connection'
          "
        >
          <line
            :x1="
              levelPreviewPoint(
                contentStore.crtElement.properties.startLv.value
              )
            "
            :x2="
              levelPreviewPoint(contentStore.crtElement.properties.endLv.value)
            "
            y1="10"
            y2="10"
            stroke="cyan"
            stroke-width="15"
            stroke-linecap="round"
            opacity="0.8"
          />
          <circle
            :cx="
              levelPreviewPoint(
                contentStore.crtElement.properties.startLv.value
              )
            "
            cy="10"
            r="4"
            fill="white"
            stroke="none"
          />
          <circle
            :cx="
              levelPreviewPoint(contentStore.crtElement.properties.endLv.value)
            "
            cy="10"
            r="4"
            fill="white"
            stroke="none"
          />
        </g>
      </svg>
    </div>

    <span class="ms-2">{{ contentStore.chipThickness }} µm</span>
  </div>
</template>
<script setup>
import { computed } from "vue";
import { useContentStore } from "@/stores/content";
import { useControlStore } from "@/stores/control";
import { Mode } from "@/library/other";
const controlStore = useControlStore();
const contentStore = useContentStore();
const levelPreviewStart = computed(
  () =>
    ((contentStore.layers.get(controlStore.level.start).height +
      contentStore.defaultModuleHeight / 2) *
      400) /
    contentStore.chipThickness
);
const levelPreviewPoint = (levelId) =>
  ((contentStore.layers.get(levelId).height +
    contentStore.defaultModuleHeight / 2) *
    400) /
  contentStore.chipThickness;
</script>
<style scoped>
.flash {
  animation: flash 1s ease-in-out;
}

@keyframes flash {
  50% {
    background-color: lightgreen;
  }
}
</style>
