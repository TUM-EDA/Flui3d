<template>
  <div
    class="modal fade"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    id="outputOptionModal"
    tabindex="-1"
    aria-hidden="true"
  >
    <div
      class="modal-dialog modal-dialog-centered"
      :class="{ 'xl-width': showStlPreview }"
    >
      <STLPreviewVue v-if="showStlPreview" />
      <div class="modal-content" v-else>
        <div class="modal-header">
          <h5 class="modal-title">Output Options</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="loadSTL()">
            <div class="mb-4">
              <label class="form-label" for="presicionSelect"
                >Precision: {{ precisionValue[precisionIdx] }}</label
              >
              <div class="px-5">
                <input
                  class="form-range px-1"
                  type="range"
                  min="0"
                  max="2"
                  v-model="precisionIdx"
                />
                <ul
                  class="w-100 d-flex justify-content-between p-0 m-0"
                  style="list-style-type: none; font-size: small"
                >
                  <li>low</li>
                  <li>medium</li>
                  <li>high</li>
                </ul>
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label" for="presicionSelect"
                >Output Format:</label
              >
              <select
                id="presicionSelect"
                class="form-select"
                aria-label="Default select example"
                required
                v-model="isBinary"
              >
                <option :value="true">Binary</option>
                <option :value="false">ASCII</option>
              </select>
            </div>

            <div class="mb-4">
              <label class="form-label" for="presicionSelect"
                >Exposure Penetration Compensation:</label
              >

              <div class="form-check form-switch">
                <input
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="globalEPC"
                  v-model="globalChecked"
                />
                <label class="form-check-label" for="globalEPC">Global</label>
              </div>
              <div class="mb-3">
                <label class="form-check-label" for="heightCompensation"
                  >Compensation per layer:</label
                >
                <div class="input-group flex-nowrap">
                  <input
                    class="form-control"
                    min="0"
                    type="number"
                    step="50"
                    id="heightCompensation"
                    v-model="globalCompensation"
                    :disabled="!globalChecked"
                    :required="globalChecked"
                  />
                  <span class="input-group-text">µm</span>
                </div>
              </div>

              <div class="form-check form-switch">
                <input
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="localEPC"
                  v-model="localChecked"
                />
                <label class="form-check-label" for="localEPC">Local</label>
              </div>
              <div class="mb-3 row">
                <div class="col">
                  <label class="form-check-label" for="compensationMin"
                    >Compensation min.:</label
                  >
                  <div class="input-group flex-nowrap">
                    <input
                      class="form-control"
                      min="0"
                      step="50"
                      type="number"
                      id="compensationMin"
                      v-model="localCompensationMin"
                      :disabled="!localChecked"
                      :required="localChecked"
                    />
                    <span class="input-group-text">µm</span>
                  </div>
                </div>
                <div class="col">
                  <label class="form-check-label" for="minAt">at:</label>
                  <div class="input-group flex-nowrap">
                    <input
                      class="form-control"
                      min="0"
                      type="number"
                      id="minAt"
                      step="50"
                      v-model="minAt"
                      :disabled="!localChecked"
                      :required="localChecked"
                    />
                    <span class="input-group-text">µm</span>
                  </div>
                </div>
              </div>
              <div class="mb-3 row">
                <div class="col">
                  <label class="form-check-label" for="compensationMax"
                    >Compensation max:</label
                  >
                  <div class="input-group flex-nowrap">
                    <input
                      class="form-control"
                      :min="localCompensationMin"
                      type="number"
                      id="compensationMax"
                      step="50"
                      v-model="localCompensationMax"
                      :disabled="!localChecked"
                      :required="localChecked"
                    />
                    <span class="input-group-text">µm</span>
                  </div>
                </div>
                <div class="col">
                  <label class="form-check-label" for="maxAt">at:</label>
                  <div class="input-group flex-nowrap">
                    <input
                      class="form-control"
                      :min="minAt"
                      type="number"
                      step="50"
                      id="maxAt"
                      v-model="maxAt"
                      :disabled="!localChecked"
                      :required="localChecked"
                    />
                    <span class="input-group-text">µm</span>
                  </div>
                </div>
              </div>
            </div>
            <hr />
            <div class="d-flex">
              <button
                type="button"
                class="btn btn-outline-secondary position-absolute"
                @click="downloadSVGZip"
              >
                Download SVG
              </button>
              <button type="submit" class="btn btn-primary m-auto">
                Generate
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { useContentStore } from "@/stores/content";
import { defineComponent, onMounted, ref } from "vue";
import STLPreviewVue from "./STLPreview.vue";
import JSZip from "jszip";
import { saveAs } from "file-saver";
export default defineComponent({
  components: { STLPreviewVue },
  setup() {
    const contentStore = useContentStore();
    const precisionIdx = ref(1);
    const precisionValue = ["Low", "Medium", "High"];
    const globalChecked = ref(false);
    const localChecked = ref(false);
    const globalCompensation = ref(100);
    const localCompensationMin = ref(100);
    const localCompensationMax = ref(800);
    const minAt = ref(200);
    const maxAt = ref(4000);
    const showStlPreview = ref(false);
    const isBinary = ref(true);

    const loadSTL = () => {
      showStlPreview.value = true;
      contentStore.requestNewStlData(
        precisionValue[precisionIdx.value],
        globalChecked.value,
        globalCompensation.value,
        localChecked.value,
        localCompensationMin.value,
        minAt.value,
        localCompensationMax.value,
        maxAt.value,
        isBinary.value
      );
    };
    const downloadSVGZip = () => {
      const zip = new JSZip();
      const color = "#0d6efd";
      const svgTag = `<svg width="${contentStore.chipLengthX / 10}" height="${
        contentStore.chipLengthY / 10
      }" viewBox="-5 -5 ${contentStore.chipLengthX + 5} ${
        contentStore.chipLengthY + 5
      }" xmlns="http://www.w3.org/2000/svg" fill="${color}" stroke="${color}">`;

      const chipBoundary = `<rect x="0" y="0" width="${contentStore.chipLengthX}" height="${contentStore.chipLengthY}" fill="none" stroke-width="10" stroke="black"/>`;
      try {
        const svgContent = document.getElementById("svgContent");
        svgContent.childNodes.forEach((layerContent) => {
          const layer = contentStore.layers.get(layerContent.id);
          if (layer) {
            const svgData = `${svgTag}${chipBoundary}${layerContent.innerHTML}</svg>`;
            zip.file(`${layer.label}_${layer.height}.svg`, svgData);
          }
        });
        zip.generateAsync({ type: "blob" }).then(function (content) {
          saveAs(content, `${contentStore.title}_svg.zip`);
        });
      } catch (err) {
        console.log(err);
      }
    };

    onMounted(() => {
      const myModalEl = document.getElementById("outputOptionModal");
      myModalEl.addEventListener("hidden.bs.modal", () => {
        showStlPreview.value = false;
      });
    });
    return {
      globalChecked,
      localChecked,
      globalCompensation,
      localCompensationMin,
      localCompensationMax,
      minAt,
      maxAt,
      showStlPreview,
      loadSTL,
      isBinary,
      precisionIdx,
      precisionValue,
      downloadSVGZip
    };
  }
});
</script>

<style scoped>
.xl-width {
  min-width: 1100px;
}
</style>
