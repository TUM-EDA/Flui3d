<template>
  <div class="accordion-item">
    <h2 class="accordion-header" id="propertyPanelHeading">
      <button
        class="accordion-button"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#propertyPanel"
        aria-expanded="true"
        aria-controls="propertyPanel"
      >
        PROPERTY INSPECTOR
      </button>
    </h2>
    <div
      id="propertyPanel"
      class="accordion-collapse collapse show"
      aria-labelledby="propertyPanelHeading"
    >
      <div class="accordion-body panel-item-height" style="max-height: 500px">
        <div v-if="controlStore.selectionState === 2">
          <h5>{{ contentStore.crtElement.id }}</h5>
          <div
            v-if="
              contentStore.crtElement.type === 'polygon' ||
              contentStore.crtElement.type === 'circle'
            "
            class="d-flex justify-content-evenly p-2"
          >
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                name="shapeType"
                id="inlineRadio1"
                :value="ShapeType.Hollow"
                v-model="contentStore.crtElement.shapeType"
              />
              <label class="form-check-label" for="inlineRadio1">Hollow</label>
            </div>

            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                name="shapeType"
                id="inlineRadio2"
                :value="ShapeType.Solid"
                v-model="contentStore.crtElement.shapeType"
              />
              <label class="form-check-label" for="inlineRadio2">Solid</label>
            </div>

            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                name="shapeType"
                id="inlineRadio2"
                :value="ShapeType.Channel"
                v-model="contentStore.crtElement.shapeType"
              />
              <label class="form-check-label" for="inlineRadio2">Channel</label>
            </div>
          </div>
          <table class="table table-borderless w-auto m-auto align-middle">
            <tbody v-if="contentStore.crtElement.type === 'level connection'">
              <tr>
                <td>{{ contentStore.crtElement.properties.startLv.name }}:</td>
                <td>
                  <select
                    class="form-select"
                    aria-label="Default select example"
                    @change="changeStartLv($event.target.value)"
                  >
                    <option
                      v-for="(level, idx) in Array.from(
                        contentStore.layers.values()
                      )"
                      :key="idx"
                      :value="level.label"
                      :selected="
                        level.label ===
                        contentStore.crtElement.properties.startLv.value
                      "
                    >
                      {{ level.label }} - {{ level.height }} µm
                    </option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>{{ contentStore.crtElement.properties.endLv.name }}:</td>
                <td>
                  <select
                    class="form-select"
                    aria-label="Default select example"
                    @change="changeEndLv($event.target.value)"
                  >
                    <option
                      v-for="(level, idx) in Array.from(
                        contentStore.layers.values()
                      )"
                      :key="idx"
                      :value="level.label"
                      :selected="
                        level.label ===
                        contentStore.crtElement.properties.endLv.value
                      "
                    >
                      {{ level.label }} - {{ level.height }} µm
                    </option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>{{ contentStore.crtElement.properties.r.name }}:</td>
                <td>
                  <input
                    class="form-control"
                    type="number"
                    min="1"
                    :value="contentStore.crtElement.properties.r.value"
                    @input="
                      onElmPropInput(
                        contentStore.crtElement.properties.r,
                        $event.target.value
                      )
                    "
                    @blur="
                      onElmPropChange(
                        contentStore.crtElement.properties.r,
                        +$event.target.value
                      )
                    "
                    @wheel.prevent.stop="
                      onWheelEditElement(
                        contentStore.crtElement.properties.r,
                        $event
                      )
                    "
                    @click="onFocusProp($event)"
                  />
                </td>
              </tr>
            </tbody>
            <tbody v-else class="text-end">
              <tr
                v-for="(property, idx) in contentStore.crtElement.properties"
                :key="idx"
              >
                <td>{{ property.name }}:</td>
                <td>
                  <div class="input-group flex-nowrap">
                    <input
                      class="form-control"
                      type="number"
                      :value="property.value"
                      @input="onElmPropInput(property, $event.target.value)"
                      @blur="onElmPropChange(property, +$event.target.value)"
                      @wheel.prevent.stop="onWheelEditElement(property, $event)"
                      @click="onFocusProp($event)"
                    />
                    <span
                      v-if="property.unit.length > 0"
                      class="input-group-text"
                      >{{ property.unit }}</span
                    >
                  </div>
                </td>
              </tr>
              <!-- rotation for modules -->
              <tr v-if="contentStore.crtElement.type === 'module'">
                <td>Rotation:</td>
                <td>
                  <div class="input-group flex-nowrap">
                    <input
                      class="form-control"
                      type="number"
                      min="0"
                      max="360"
                      :value="contentStore.crtElement.rotation"
                      @input="
                        contentStore.crtElement.setRotation(
                          +$event.target.value
                        )
                      "
                      @click="onFocusRotation($event)"
                      @blur="onRotationPropChange()"
                    />
                    <span class="input-group-text">°</span>
                  </div>
                </td>
              </tr>
              <!-- deal with level connection -->
            </tbody>
          </table>
        </div>
        <div v-else>
          <h5>Device Properties</h5>
          <table class="table table-borderless w-auto m-auto align-middle">
            <tbody class="text-end">
              <tr
                v-for="(property, idx) in contentStore.chipProperties.slice(
                  0,
                  5
                )"
                :key="idx"
              >
                <td>{{ property.name }}:</td>
                <td>
                  <div class="input-group flex-nowrap">
                    <input
                      class="form-control"
                      type="number"
                      min="1"
                      :value="property.value"
                      @input="
                        contentStore.changeChipProperty(
                          idx,
                          $event.target.value
                        )
                      "
                      @wheel.prevent.stop="
                        changePropertyOnWheel(property, $event)
                      "
                      @blur="
                        onChipPropChange(property, +$event.target.value, idx)
                      "
                      @click="onFocusProp($event)"
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
      </div>
      <!-- only show the first 5 chip properties -->
    </div>
  </div>
</template>
<script>
import { useContentStore } from "@/stores/content";
import { useControlStore } from "@/stores/control";
import {
  ChangeChipPropertyAct,
  ChangeContentUnitPropertyAct,
  ChangeStringPropertyAct,
  useHistoryStore
} from "@/stores/history";
import { useMoudleStore } from "@/stores/module";
import { defineComponent, ref } from "vue";
import { ShapeType } from "@/library/other";

export default defineComponent({
  setup() {
    const contentStore = useContentStore();
    const controlStore = useControlStore();
    const historyStore = useHistoryStore();
    const valueCache = ref(0);
    const onElmPropInput = (prop, newValue) => {
      prop.value = +newValue;
      contentStore.editOnCrtElement();
    };
    const onFocusProp = (e) => {
      valueCache.value = +e.target.value;
    };
    const onFocusRotation = (e) => {
      controlStore.startRotation = +e.target.value;
    };
    const onRotationPropChange = () => {
      setTimeout(() => {
        controlStore.stopRotatingModule(contentStore.crtElement);
      }, 200);
    };
    const onElmPropChange = (prop, newValue) => {
      const offset = newValue - valueCache.value;
      if (offset !== 0) {
        historyStore.addActivity(
          new ChangeContentUnitPropertyAct(
            contentStore.crtElement,
            prop,
            offset
          )
        );
        valueCache.value = newValue;
      }
    };
    const onChipPropChange = (prop, newValue, propIdx) => {
      const offset = newValue - valueCache.value;
      const moduleStore = useMoudleStore();
      if (offset !== 0)
        historyStore.addActivity(new ChangeChipPropertyAct(prop, offset));
      if (propIdx >= 3) {
        moduleStore.initiallizeModuleFactory();
      }
    };

    const changeStartLv = (value) => {
      historyStore.addActivity(
        new ChangeStringPropertyAct(
          contentStore.crtElement,
          contentStore.crtElement.properties.startLv,
          contentStore.crtElement.properties.startLv.value,
          value
        )
      );
      contentStore.crtElement.properties.startLv.value = value;
    };
    const changeEndLv = (value) => {
      historyStore.addActivity(
        new ChangeStringPropertyAct(
          contentStore.crtElement,
          contentStore.crtElement.properties.endLv,
          contentStore.crtElement.properties.endLv.value,
          value
        )
      );
      contentStore.crtElement.properties.endLv.value = value;
    };

    const changePropertyOnWheel = (prop, e) => {
      const activeElement = document.activeElement;
      if (e.target === activeElement) {
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
      }
    };

    const onWheelEditElement = (prop, e) => {
      changePropertyOnWheel(prop, e);
      contentStore.editOnCrtElement();
    };

    return {
      contentStore,
      controlStore,
      onWheelEditElement,
      changePropertyOnWheel,
      onElmPropInput,
      onChipPropChange,
      onElmPropChange,
      onFocusProp,
      changeStartLv,
      changeEndLv,
      onFocusRotation,
      onRotationPropChange,
      ShapeType
    };
  }
});
</script>
