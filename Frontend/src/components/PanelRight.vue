<template>
  <div
    class="offcanvas offcanvas-end py-3 px-0"
    data-bs-scroll="true"
    data-bs-backdrop="false"
    tabindex="-1"
    id="offcanvasScrolling"
    aria-labelledby="offcanvasScrollingLabel"
  >
    <div class="offcanvas-body px-0">
      <div class="accordion">
        <!-- PROPERTY INSPECTOR -->
        <PanelRightPropertyVue />
        <!-- PART LIST -->
        <PanelRightPartListVue />
        <!-- CONSTRAINTS & ISSUES -->
        <PanelRightDRCVue />
        <!-- HISTORY -->
        <div class="accordion-item">
          <h2 class="accordion-header" id="panelsStayOpen-headingThree">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#panelsStayOpen-collapseThree"
              aria-expanded="false"
              aria-controls="panelsStayOpen-collapseThree"
            >
              HISTORY
            </button>
          </h2>
          <div
            id="panelsStayOpen-collapseThree"
            class="accordion-collapse collapse"
            aria-labelledby="panelsStayOpen-headingThree"
          >
            <div class="accordion-body panel-item-height">
              <ul class="list-group list-group-flush">
                <li
                  style="cursor: pointer"
                  class="list-group-item"
                  v-for="(activity, idx) in historyStore.activities"
                  :key="idx"
                  :class="{
                    active: idx === historyStore.position,
                    'text-black-50': idx > historyStore.position
                  }"
                  @click="historyStore.setPosition(idx)"
                >
                  {{ activity.description }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { useContentStore } from "@/stores/content";
import { useControlStore } from "@/stores/control";
import { useHistoryStore } from "@/stores/history";
import { defineComponent } from "vue";
import PanelRightPropertyVue from "./PanelRightItems/PanelRightProperty.vue";
import PanelRightDRCVue from "./PanelRightItems/PanelRightDRC.vue";
import PanelRightPartListVue from "./PanelRightItems/PanelRightPartList.vue";

export default defineComponent({
  components: {
    PanelRightPropertyVue,
    PanelRightDRCVue,
    PanelRightPartListVue
  },
  setup() {
    const contentStore = useContentStore();
    const controlStore = useControlStore();
    const historyStore = useHistoryStore();
    const selectFromPartList = (id) => {
      controlStore.switchMode("select");
      controlStore.selectElement(id);
    };

    return {
      contentStore,
      controlStore,
      historyStore,
      selectFromPartList
    };
  }
});
</script>

<style>
.panel-item-height {
  max-height: 300px;
  overflow: auto;
}
</style>
