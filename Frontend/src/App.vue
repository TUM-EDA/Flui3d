<template>
  <div
    id="main"
    @mousemove="handleMouseMove($event)"
    @mouseenter="showCoords"
    @mouseleave="hideCoords"
  >
    <TheHeader />
    <Toolbar />
    <TheFooter />
    <svg
      id="background_grid"
      :style="bgSize"
      :transform="bgTransform"
      transform-origin="0 0"
    ></svg>

    <svg
      id="workarea"
      ref="workarea"
      xmlns="http://www.w3.org/2000/svg"
      tabindex="0"
      @wheel.prevent.stop="onWheel($event)"
      @mousedown.left="controlStore.handleMouseDownLeft()"
      @mouseup.left="controlStore.handleMouseUpLeft()"
      @contextmenu.prevent="handleMouseUpRight()"
      @keydown.esc="handleMouseUpRight()"
      @keydown.delete="controlStore.deleteCrtElement()"
      @keydown.ctrl.z="historyStore.undo()"
      @keydown.ctrl.y="historyStore.redo()"
      @keyup.enter="showInputDraw()"
      @keydown.ctrl.c="contentStore.copy()"
      @keydown.ctrl.v="contentStore.paste()"
      @keydown.space="controlStore.startPanning()"
      @keyup.space="controlStore.stopPanning()"
      @keydown.tab.prevent="coordinateStore.togglePrecision()"
    >
      <defs>
        <marker
          id="arrowBlack"
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
        <marker
          id="arrowWhite"
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="10"
          markerHeight="10"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 L 2 5 z" fill="white" />
        </marker>
        <!-- mask: white for fill, black(none) for no fill -->
        <mask id="boundary">
          <!-- 100% width/height not properly supported by chrome -->
          <rect x="0" y="0" width="100000" height="100000" fill="white" />
          <rect
            :x="coordinateStore.globalToWindow(0)"
            :y="coordinateStore.globalToWindow(0)"
            :width="
              coordinateStore.globalToWindow(
                contentStore.chipProperties[0].value
              )
            "
            :height="
              coordinateStore.globalToWindow(
                contentStore.chipProperties[1].value
              )
            "
            :transform="originTransform"
          />
        </mask>
      </defs>
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="#aaaaaa"
        fill-opacity="0.3"
        mask="url(#boundary)"
      />
      <g :transform="originTransform">
        <!-- boundary -->
        <rect
          fill="none"
          stroke="dodgerblue"
          id="chipBoundary"
          :x="coordinateStore.globalToWindow(0)"
          :y="coordinateStore.globalToWindow(0)"
          :width="
            coordinateStore.globalToWindow(contentStore.chipProperties[0].value)
          "
          :height="
            coordinateStore.globalToWindow(contentStore.chipProperties[1].value)
          "
        />
        <!-- origin -->
        <path
          :d="pathOfOrigin"
          fill="none"
          stroke="black"
          marker-start="url(#arrowBlack)"
          marker-end="url(#arrowBlack)"
        />
      </g>

      <SvgCanvas />
      <RulerX />
      <RulerY />

      <svg
        id="select_rect"
        class="svgcanvas"
        xmlns="http://www.w3.org/2000/svg"
        v-if="controlStore.selectionState === 1"
      >
        <rect
          :x="selectRectAttr.x"
          :y="selectRectAttr.y"
          :width="selectRectAttr.w"
          :height="selectRectAttr.h"
          fill="none"
          stroke="black"
          stroke-width="1"
          stroke-dasharray="2,2"
        />
      </svg>
    </svg>
    <ZoomPanel />

    <ChannelSegLengthInputVue v-if="channelInput.showInput" />
    <RadiusInputVue
      v-if="
        controlStore.selectionState === 2 && contentStore.editingNodeElement
      "
    />

    <PanelRight />
    <ComponentBoard />
    <!-- <STLPreviewVue /> -->
    <StartModal />
    <PanelLevel />
    <OutputOptionModalVue />
    <HelpVue />
  </div>
</template>

<script>
import Toolbar from "./components/Toolbar.vue";
import SvgCanvas from "./components/SvgCanvas.vue";
import TheFooter from "./components/TheFooter.vue";
import TheHeader from "./components/TheHeader.vue";
import RulerX from "./components/RulerX.vue";
import RulerY from "./components/RulerY.vue";
import ZoomPanel from "./components/ZoomPanel.vue";
import { useCoordinateStore } from "./stores/coordinate";
import { computed, defineComponent } from "vue";
import { useContentStore } from "./stores/content";
import ComponentBoard from "./components/ComponentBoard.vue";
import { useControlStore } from "./stores/control";
import PanelRight from "./components/PanelRight.vue";
import StartModal from "./components/StartModal.vue";
import PanelLevel from "./components/PanelLevel.vue";
import { useHistoryStore } from "./stores/history";
import ChannelSegLengthInputVue from "./components/ChannelSegLengthInput.vue";
import { useChannelSegInputStore } from "./stores/channelSegmentInput";
import RadiusInputVue from "./components/RadiusInput.vue";
import OutputOptionModalVue from "./components/OutputOptionModal.vue";
import HelpVue from "./components/Help.vue";

export default defineComponent({
  name: "App",
  components: {
    Toolbar,
    TheFooter,
    TheHeader,
    RulerX,
    RulerY,
    ZoomPanel,
    ComponentBoard,
    SvgCanvas,
    PanelRight,
    StartModal,
    PanelLevel,
    ChannelSegLengthInputVue,
    RadiusInputVue,
    OutputOptionModalVue,
    HelpVue
  },
  created(){
    document.title = "Flui3d - Online Microfluidic Design Tool for 3D Printing"
  },
  setup() {
    const controlStore = useControlStore();
    const coordinateStore = useCoordinateStore();
    const contentStore = useContentStore();
    const channelInput = useChannelSegInputStore();
    const handleMouseMove = (e) => {
      coordinateStore.changeCoords(e.clientX, e.clientY);

      if (controlStore.isAddingChannel) {
        controlStore.setCrtChannelEnd(e.shiftKey);
      } else {
        // 0: idle (mouseDown == false)
        // 1: select + mousedown
        // 2: move
        // 3: move bridge
        // 4: move vertex
        // 5: move group
        // 6: rotate
        switch (controlStore.operation) {
          case 0:
          case 4:
          case 6:
            break;
          case 1: {
            controlStore.setSelectRect();
            break;
          }
          case 2: {
            controlStore.updateCrtElmPosition();
            break;
          }
          case 3: {
            if (controlStore.canPlaceBridge) {
              contentStore.crtElement.channelSegment = controlStore.channelSeg;
              contentStore.crtElement.posOnSeg = controlStore.posOnSeg;
            } else {
              contentStore.crtElement.posOnSeg = -1;
            }
            break;
          }
          case 5: {
            controlStore.updateGroupPosition();
            break;
          }
          // case 6: {
          //   // implemented in SvgElementEdit
          //   break;
          // }
        }
      }
    };

    const handleMouseUpRight = () => {
      if (controlStore.isAddingChannel) controlStore.stepOutChannel();
      if (controlStore.isAddingPolygon) controlStore.stepOutPolygon();
    };

    const selectRectAttr = computed(() => {
      let [x, y, w, h] = [0, 0, 0, 0];
      if (controlStore.selectRect.x1 <= controlStore.selectRect.x2) {
        x = controlStore.selectRect.x1;
        w = controlStore.selectRect.x2 - controlStore.selectRect.x1;
      } else {
        x = controlStore.selectRect.x2;
        w = controlStore.selectRect.x1 - controlStore.selectRect.x2;
      }
      if (controlStore.selectRect.y1 <= controlStore.selectRect.y2) {
        y = controlStore.selectRect.y1;
        h = controlStore.selectRect.y2 - controlStore.selectRect.y1;
      } else {
        y = controlStore.selectRect.y2;
        h = controlStore.selectRect.y1 - controlStore.selectRect.y2;
      }
      return { x, y, w, h };
    });

    function onWheel(e) {
      if (e.deltaY < 0) {
        coordinateStore.zoomInAtMouse();
      } else {
        coordinateStore.zoomOutAtMouse();
      }
    }
    const originTransform = computed(
      () =>
        `translate(${
          (coordinateStore.globalTranslateX * coordinateStore.gridSize) / 100
        }, ${
          (coordinateStore.globalTranslateY * coordinateStore.gridSize) / 100
        })`
    );
    const k = computed(
      () => (coordinateStore.precision * coordinateStore.gridSize) / 2
    );
    const bgTransform = computed(() => {
      const x =
        (coordinateStore.globalToWindow(coordinateStore.globalTranslateX) %
          k.value) -
        k.value;
      const y =
        (coordinateStore.globalToWindow(coordinateStore.globalTranslateY) %
          k.value) -
        k.value;
      return `translate(${x}, ${y})`;
    });
    const bgSize = computed(() => {
      const x =
        (coordinateStore.precisionGrid * coordinateStore.gridSize) / 100;
      return `background-size: ${x}px ${x}px, ${x}px ${x}px,
        ${x * 5}px ${x * 5}px, ${x * 5}px ${x * 5}px`;
    });
    const pathOfOrigin = computed(() => {
      return `M 0 50 v -50 h 50`;
    });

    const showCoords = () => {
      coordinateStore.$patch({ coordsVisible: true });
    };
    const hideCoords = () => {
      coordinateStore.$patch({ coordsVisible: false });
    };

    const showInputDraw = () => {
      if (
        controlStore.isAddingChannel &&
        controlStore.crtChannel.channelDef.length > 1
      ) {
        channelInput.showChannelSegLengthInput(
          controlStore.crtChannel.channelDef[
            controlStore.crtChannel.channelDef.length - 2
          ],
          controlStore.crtChannel.channelDef[
            controlStore.crtChannel.channelDef.length - 1
          ]
        );
      }
    };
    const historyStore = useHistoryStore();
    return {
      pathOfOrigin,
      controlStore,
      contentStore,
      coordinateStore,
      channelInput,
      historyStore,
      handleMouseMove,
      handleMouseUpRight,
      onWheel,
      selectRectAttr,
      originTransform,
      bgTransform,
      bgSize,
      showCoords,
      hideCoords,
      showInputDraw
      // test
    };
  },

  mounted() {
    this.coordinateStore.resetView();
    this.$nextTick(() => {
      window.addEventListener("resize", this.coordinateStore.resetView);
    });
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.coordinateStore.resetView);
  }
});
</script>

<style>
html {
  overflow: hidden;
}

body {
  background-color: #f3f3f3;
  margin: 0 auto;
  -webkit-user-select: none;
  -moz-user-select: none;
  -khtml-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #545f69;
  font-size: 0.9rem;
}

#main {
  min-width: 950px;
  width: 100%;
  height: 100%;
  position: absolute;
}

#workarea {
  width: 100%;
  height: 100%;
}

#background_grid {
  position: absolute;
  background: #eeeeee;
  background-image: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.05) 1px,
      transparent 0
    ),
    linear-gradient(270deg, rgba(0, 0, 0, 0.05) 1px, transparent 0),
    linear-gradient(0deg, rgb(201, 201, 201) 1px, transparent 0),
    linear-gradient(270deg, rgb(201, 201, 201) 1px, transparent 0);
  width: 500%;
  height: 500%;
  z-index: -1;
}

.default_cursor,
#workarea.default_cursor * {
  cursor: default;
}

.drawing_cursor {
  cursor: crosshair;
}

.rotateButton,
#workarea.rotating_cursor * {
  cursor: url("assets/rotate-icon.svg"), grab;
}

.moving_cursor,
#workarea.moveing_cursor * {
  cursor: move;
}
</style>
