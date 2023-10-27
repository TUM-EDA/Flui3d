<template>
  <div class="accordion-item">
    <h2 class="accordion-header" id="panelsStayOpen-headingTwo">
      <button
        class="accordion-button collapsed"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#panelsStayOpen-collapseTwo"
        aria-expanded="false"
        aria-controls="panelsStayOpen-collapseTwo"
      >
        DESIGN RULE CHECK
      </button>
    </h2>
    <div
      id="panelsStayOpen-collapseTwo"
      class="accordion-collapse collapse"
      aria-labelledby="panelsStayOpen-headingTwo"
    >
      <div class="accordion-body panel-item-height" style="max-height: 500px">
        <button class="btn btn-primary btn-sm mb-3 me-3" @click="runDRC()">
          <i class="fa-solid fa-magnifying-glass"></i> Run DRC
        </button>

        <ul class="list-group list-group-flush">
          <li
            class="list-group-item px-0"
            v-for="(designRule, idx) in designRules"
            :key="idx"
          >
            <!-- Design Rules -->
            <div class="form-check form-switch">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    v-model="designRule.isChecked"
                  />
                  <label class="form-check-label me-2">
                    {{ designRule.description }}
                  </label>
                </div>

                <div
                  class="input-group flex-nowrap my-2 w-auto"
                  v-if="idx === 0"
                >
                  <input
                    class="form-control p-1"
                    style="width: 100px"
                    type="number"
                    min="10"
                    step="10"
                    v-model="channelWidthMin"
                  />
                  <span class="input-group-text p-1">µm</span>
                </div>
                <div
                  class="input-group flex-nowrap my-2 w-auto"
                  v-else-if="idx === 1"
                >
                  <input
                    class="form-control p-1"
                    style="width: 100px"
                    type="number"
                    min="10"
                    step="10"
                    v-model="compDistMin"
                  />
                  <span class="input-group-text p-1">µm</span>
                </div>
                <div
                  class="input-group flex-nowrap my-2 w-auto"
                  v-else-if="idx === 2"
                >
                  <input
                    class="form-control p-1"
                    style="width: 100px"
                    type="number"
                    min="10"
                    step="10"
                    v-model="minPortRadius"
                  />
                  <span class="input-group-text p-1">µm</span>
                </div>
                <div
                  class="input-group flex-nowrap my-2 w-auto"
                  v-else-if="idx === 3"
                >
                  <input
                    class="form-control p-1"
                    style="width: 100px"
                    type="number"
                    min="10"
                    step="10"
                    v-model="minViaRadius"
                  />
                  <span class="input-group-text p-1">µm</span>
                </div>
              </div>

              <div v-if="designRule.isChecked">
                <i
                  class="fa-solid fa-check text-success"
                  v-if="designRule.result === 0"
                ></i>
                <button
                  v-else-if="designRule.result > 0"
                  class="btn btn-warning"
                  style="
                    --bs-btn-padding-y: 0;
                    --bs-btn-padding-x: 0.25rem;
                    --bs-btn-font-size: 0.75rem;
                  "
                  type="button"
                  data-bs-toggle="collapse"
                  :data-bs-target="`#collapse${idx}`"
                  aria-expanded="false"
                  :aria-controls="`#collapse${idx}`"
                >
                  {{ designRule.result }}
                  {{ designRule.result === 1 ? "warning" : "warnings" }}
                </button>
                <div
                  v-if="designRule.result > 0"
                  class="collapse mt-2"
                  :id="`collapse${idx}`"
                >
                  <div class="card card-body py-0 border-warning">
                    <ol class="list-group list-group-flush list-group-numbered">
                      <li
                        class="list-group-item px-0 d-flex"
                        v-for="(failedElm, idx) in designRule.failedItems"
                        :key="idx"
                      >
                        <PartListButtonVue
                          v-if="typeof failedElm === 'string'"
                          :id="failedElm"
                        />
                        <div v-else>
                          <PartListButtonVue
                            v-for="(id, idx) in failedElm"
                            :key="idx"
                            :id="id"
                          />
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {
  runDRC,
  designRules,
  channelWidthMin,
  compDistMin,
  minPortRadius,
  minViaRadius
} from "@/library/utilities/designRuleCheck";
import { defineComponent } from "vue";
import PartListButtonVue from "./PartListButton.vue";
export default defineComponent({
  components: {
    PartListButtonVue
  },
  setup() {
    return {
      runDRC,
      designRules,
      channelWidthMin,
      compDistMin,
      minPortRadius,
      minViaRadius
    };
  }
});
</script>
<style scoped>
li::before {
  margin: 5px 5px 0 0;
}
</style>
