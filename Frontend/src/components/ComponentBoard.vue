<template>
  <div class="container">
    <div
      class="modal modal-xl fade"
      id="moduleBoardModal"
      tabindex="-1"
      aria-hidden="true"
      @click="controlStore.cancelModulePlacement()"
    >
      <div
        class="modal-dialog modal-dialog-centered modal-dialog-scrollable"
        @click.stop=""
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add Component</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              @click="controlStore.cancelModulePlacement()"
            ></button>
          </div>
          <div class="modal-body">
            <div class="d-flex flex-wrap justify-content-evenly">
              <ComponentBoardItem
                v-for="(moduleCreator, index) in moduleStore.moduleFactory"
                :key="index"
                :moduleCreator="moduleCreator"
                @click="moduleStore.selectModule(index)"
                data-bs-target="#modulePropBoardModal"
                data-bs-toggle="modal"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <ComponentPropertyBoard />
  </div>
</template>
<script>
import { useControlStore } from "@/stores/control";
import { useMoudleStore } from "@/stores/module";
import { defineComponent } from "vue";
import ComponentBoardItem from "./ComponentBoardItem.vue";
import ComponentPropertyBoard from "./ComponentPropertyBoard.vue";
export default defineComponent({
  components: {
    ComponentBoardItem,
    ComponentPropertyBoard
  },
  setup() {
    const moduleStore = useMoudleStore();
    const controlStore = useControlStore();
    return {
      moduleStore,
      controlStore
    };
  }
});
</script>
