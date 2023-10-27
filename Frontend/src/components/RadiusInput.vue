<template>
  <div class="position-fixed" :style="formStyle">
    <div class="input-group flex-nowrap">
      <span class="input-group-text">Radius:</span>
      <input
        class="form-control"
        type="number"
        style="width: 80px"
        min="1"
        :value="contentStore.crtNodeElmRadiusProperty.value"
        @input="onInput(+$event.target.value)"
        @blur="onChange(+$event.target.value)"
        @wheel.prevent.stop="changePropertyOnWheel($event)"
        @click="onFocus($event)"
      />
      <span class="input-group-text">µm</span>
    </div>
  </div>
</template>
<script>
import { InletOutlet } from "@/library/inletOutlet";
import { useContentStore } from "@/stores/content";
import { useCoordinateStore } from "@/stores/coordinate";
import {
  ChangeContentUnitPropertyAct,
  useHistoryStore
} from "@/stores/history";
import { computed, defineComponent, ref } from "vue";
export default defineComponent({
  setup() {
    const contentStore = useContentStore();
    const coordinateStore = useCoordinateStore();
    const historyStore = useHistoryStore();
    const valueCache = ref(0);
    const valueCacheR2 = ref(0);
    const onFocus = (e) => {
      valueCache.value = +e.target.value;
      if (contentStore.crtElement instanceof InletOutlet) {
        valueCacheR2.value = contentStore.crtElement.properties.r2.value;
      }
    };
    const onInput = (newValue) => {
      if (contentStore.crtElement instanceof InletOutlet) {
        contentStore.crtElement.properties.r2.value = newValue + 200;
      }
      contentStore.crtNodeElmRadiusProperty.value = +newValue;
    };

    const onChange = (newValue) => {
      const offSet = newValue - valueCache.value;
      if (offSet !== 0) {
        if (contentStore.crtElement instanceof InletOutlet) {
          const act = new ChangeContentUnitPropertyAct(
            contentStore.crtElement,
            contentStore.crtElement.properties.r2,
            contentStore.crtElement.properties.r2.value - valueCacheR2.value
          );
          historyStore.addActivity(
            new ChangeContentUnitPropertyAct(
              contentStore.crtElement,
              contentStore.crtNodeElmRadiusProperty,
              offSet,
              act
            )
          );
        } else {
          historyStore.addActivity(
            new ChangeContentUnitPropertyAct(
              contentStore.crtElement,
              contentStore.crtNodeElmRadiusProperty,
              offSet
            )
          );
        }

        valueCache.value = newValue;
      }
    };
    const changePropertyOnWheel = (e) => {
      const activeElement = document.activeElement;
      if (e.target === activeElement) {
        const prop = contentStore.crtNodeElmRadiusProperty;
        const step = prop.step ? prop.step : 1;
        let x = prop.value % step;
        if (e.deltaY < 0) {
          x = prop.value + step - x;
        } else {
          x = x === 0 ? step : x;
          if (prop.value > step) {
            x = prop.value - x;
          }
        }
        onInput(x);
      }
    };
    const formStyle = computed(() => {
      if (contentStore.editingNodeElement) {
        return `left:${coordinateStore.svgXToWindow(
          contentStore.crtElement.x + 400
        )}px;top:${coordinateStore.svgYToWindow(contentStore.crtElement.y)}px`;
      } else {
        throw "invalid element";
      }
    });

    return {
      contentStore,
      onFocus,
      onInput,
      onChange,
      formStyle,
      changePropertyOnWheel
    };
  }
});
</script>
