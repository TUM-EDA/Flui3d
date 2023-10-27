<template>
  <div
    class="modal fade"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    id="modulePropBoardModal"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            Create a new {{ moduleStore.selectedModuleCreator.moduleName }}
          </h5>

          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>

        <div class="modal-body">
          <table class="table table-borderless mb-5 w-auto m-auto align-middle">
            <tbody class="text-end">
              <tr
                v-for="(property, idx) in moduleStore.selectedModuleCreator
                  .pendingModule.properties"
                :key="idx"
              >
                <td>{{ property.name }}:</td>
                <td>
                  <div class="input-group flex-nowrap">
                    <input
                      class="form-control"
                      type="number"
                      :value="property.value"
                      @input="onValueChange(property, $event.target.value)"
                      @wheel.prevent.stop="onWheel(property, $event)"
                    />
                    <span
                      v-if="property.unit.length > 0"
                      class="input-group-text"
                      >{{ property.unit }}</span
                    >
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div id="module-preview">
            <svg
              width="100%"
              height="100%"
              :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`"
              xmlns="http://www.w3.org/2000/svg"
              fill="dodgerblue"
              stroke="dodgerblue"
            >
              <SvgModuleVue
                :id="moduleStore.selectedModuleCreator.pendingModule.id"
                :topLeftCorner="
                  moduleStore.selectedModuleCreator.pendingModule
                    .elementsToRender.topLeftCorner
                "
                :borderShapes="
                  moduleStore.selectedModuleCreator.pendingModule
                    .elementsToRender.borderShapes
                "
                :maskShapes="
                  moduleStore.selectedModuleCreator.pendingModule
                    .elementsToRender.maskShapes
                "
                :centerPoint="
                  moduleStore.selectedModuleCreator.pendingModule
                    .elementsToRender.centerPoint
                "
              />
            </svg>
          </div>
        </div>

        <div class="modal-footer">
          <button
            class="btn btn-secondary"
            data-bs-target="#moduleBoardModal"
            data-bs-toggle="modal"
          >
            Back
          </button>

          <button
            class="btn btn-success"
            data-bs-dismiss="modal"
            @click="controlStore.startModulePlacement"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { useControlStore } from "@/stores/control";
import { useMoudleStore } from "@/stores/module";
import { computed } from "@vue/reactivity";
import { defineComponent } from "vue";
import SvgModuleVue from "./SvgModule.vue";
export default defineComponent({
  components: {
    SvgModuleVue
  },
  setup() {
    const moduleStore = useMoudleStore();
    const controlStore = useControlStore();
    const onValueChange = (prop, newValue) => {
      prop.value = +newValue;
      moduleStore.selectedModuleCreator.updatePendingModule();
    };
    const onWheel = (prop, e) => {
      const step = prop.step ? prop.step : 1;
      let x = prop.value % step;
      if (e.deltaY < 0) {
        prop.value += step - x;
      } else {
        x = x === 0 ? step : x;
        if (prop.value >= step) {
          prop.value -= x;
        }
      }
      moduleStore.selectedModuleCreator.updatePendingModule();
    };
    const viewBox = computed(() => {
      const x =
        moduleStore.selectedModuleCreator.pendingModule.elementsToRender
          .topLeftCorner[0] - 400;
      const y =
        moduleStore.selectedModuleCreator.pendingModule.elementsToRender
          .topLeftCorner[1] - 400;
      const w =
        (moduleStore.selectedModuleCreator.pendingModule.elementsToRender
          .centerPoint[0] -
          x) *
          2 +
        800;
      const h =
        (moduleStore.selectedModuleCreator.pendingModule.elementsToRender
          .centerPoint[1] -
          y) *
          2 +
        800;
      return { x, y, w, h };
    });

    return {
      moduleStore,
      onValueChange,
      controlStore,
      onWheel,
      viewBox
    };
  }
});
</script>

<style scoped>
#module-preview {
  width: 100%;
  height: 200px;
  overflow: auto;
}
</style>
