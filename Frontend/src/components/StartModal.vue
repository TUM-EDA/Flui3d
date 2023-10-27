<template>
  <div class="container">
    <div
      class="modal fade"
      id="startModal"
      aria-hidden="true"
      aria-labelledby="startModalLabel"
      tabindex="-1"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <div class="d-flex align-items-center"><img src="../assets/logo/Logo.svg" alt="Flui3d - " class="me-2"  style="height: 25px;"><img src="../assets/logo/Logo_Flui3d.svg" alt="Get Started" style="height: 23px;"></div>

            </h5>
          </div>
          <div class="modal-footer">
            <div class="container m-auto w-auto">
              <button
                class="btn btn-primary me-3"
                data-bs-target="#chipPropertyModal"
                data-bs-toggle="modal"
              >
                New Design
              </button>
              <label
                for="fileInput"
                class="btn btn-primary"
                data-bs-dismiss="modal"
                >Import Design</label
              >
              <input
                type="file"
                style="display: none"
                id="fileInput"
                accept=".json"
                name="fileInput"
                @change="loadDesign($event.target.files[0])"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="modal fade"
      id="chipPropertyModal"
      aria-hidden="true"
      aria-labelledby="chipPropertyModalLabel"
      tabindex="-1"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Device Default Properties</h5>
          </div>
          <div class="modal-body">
            <table
              class="table table-borderless mb-5 w-auto m-auto align-middle"
            >
              <tbody class="text-end">
                <tr
                  v-for="(property, idx) in contentStore.chipProperties"
                  :key="idx"
                >
                  <td>{{ property.name }}:</td>
                  <td>
                    <div class="input-group flex-nowrap">
                      <input
                        type="number"
                        class="form-control"
                        :min="property.step"
                        :step="property.step"
                        v-model="chipPropertyValues[idx]"
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
          </div>
          <div class="modal-footer">
            <div class="w-100">
              <button
                class="btn btn-secondary me-3 float-start"
                data-bs-target="#startModal"
                data-bs-toggle="modal"
              >
                Back
              </button>
              <div class="w-auto float-end">
                <button
                  class="btn btn-primary me-3"
                  @click="restoreDefaultChipProps"
                >
                  Restore to default
                </button>
                <button
                  type="button"
                  class="btn btn-success"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  @click="initializeChip"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useContentStore } from "@/stores/content";
import designLoader from "@/library/utilities/designLoader";
import { useMoudleStore } from "@/stores/module";
import { defineComponent, ref } from "vue";

export default defineComponent({
  setup() {
    const moduleStore = useMoudleStore();
    const contentStore = useContentStore();
    let chipPropertyValues = ref([...contentStore.defaultChipProperties]);
    const restoreDefaultChipProps = () => {
      chipPropertyValues.value = [...contentStore.defaultChipProperties];
    };
    const initializeChip = () => {
      contentStore.initializeContent(chipPropertyValues.value);
      restoreDefaultChipProps();
    };
    const loadDesign = (file) => {
      console.log("loading design");
      designLoader.loadDesign(file);
      document.getElementById("fileInput").value = "";
    };
    return {
      moduleStore,
      contentStore,
      initializeChip,
      loadDesign,
      chipPropertyValues,
      restoreDefaultChipProps
    };
  }
});
</script>
