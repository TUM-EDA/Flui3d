<template>
  <div class="accordion-item">
    <h2 class="accordion-header" id="panelsStayOpen-partListHeading">
      <button
        class="accordion-button collapsed"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#panelsStayOpen-partList"
        aria-expanded="false"
        aria-controls="panelsStayOpen-partList"
      >
        PART LIST
      </button>
    </h2>
    <div
      id="panelsStayOpen-partList"
      class="accordion-collapse collapse"
      aria-labelledby="panelsStayOpen-partListHeading"
    >
      <div class="accordion-body panel-item-height">
        <div
          v-for="(layer, idx) in contentStore.layers"
          :key="idx"
          class="d-flex p-2"
          :style="`border-top:${layer[1].color} 1px solid`"
        >
          <div class="me-3 p-1" :style="`color:${layer[1].color}`">
            {{ layer[1].label }}
          </div>

          <div>
            <PartListButtonVue
              v-for="(id, elmIdx) in layer[1].contentIds.filter(
                (eid) => contentStore.getElement(eid).display
              )"
              :key="elmIdx"
              :id="id"
            />
          </div>
        </div>
        <div class="p-2" style="border-top: grey 1px solid">
          <div>
            <PartListButtonVue
              v-for="(id, elmIdx) in contentStore.levelConnectionIds.filter(
                (eid) => contentStore.getElement(eid).display
              )"
              :key="elmIdx"
              :id="id"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { useContentStore } from "@/stores/content";
import { defineComponent } from "vue";
import PartListButtonVue from "./PartListButton.vue";
export default defineComponent({
  components: {
    PartListButtonVue
  },
  setup() {
    const contentStore = useContentStore();
    return { contentStore };
  }
});
</script>
