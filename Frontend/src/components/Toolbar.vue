<template>
  <div
    id="toolbar-wrapper"
    class="btn-toolbar-vertical d-flex flex-column"
    role="toolbar"
  >
    <div
      class="rounded btn-group-vertical btn-group-sm bg-light border border-dark"
      style="--bs-border-opacity: 0.2"
      role="group"
    >
      <ToolbarButton
        v-for="(tool, idx) in tools"
        :key="idx"
        :title="tool.title"
        :mode="tool.mode"
      >
        <component :is="tool.icon" />
      </ToolbarButton>
    </div>

    <div
      class="rounded btn-group-vertical btn-group-sm bg-light mt-2 border border-dark"
      style="--bs-border-opacity: 0.2"
      role="group"
      data-bs-toggle="modal"
      data-bs-target="#moduleBoardModal"
    >
      <ToolbarButton title="Add Component" :mode="Mode.Component" toggled="">
        <ComponentIcon />
      </ToolbarButton>
    </div>
    <ToolbarCustomizedVue
      v-if="
        controlStore.mode === Mode.Channel ||
        controlStore.mode === Mode.Polygon ||
        controlStore.mode === Mode.InletOutlet ||
        controlStore.mode === Mode.InterLayer ||
        controlStore.mode === Mode.RoundedCorner ||
        controlStore.mode === Mode.Circle
      "
    />
  </div>
</template>
<script>
import ToolbarButton from "./ToolbarButton.vue";
import SelectIcon from "../assets/icons/select-icon.vue";
import ComponentIcon from "../assets/icons/component-icon.vue";
import BridgeIcon from "../assets/icons/bridge-icon.vue";
import InletOutletIcon from "../assets/icons/inlet-outlet-icon.vue";
import ChannelIcon from "../assets/icons/channel-icon.vue";
import CircleIcon from "../assets/icons/circle-icon.vue";
import RoundedCornerIcon from "../assets/icons/rounded-corner-icon.vue";
import LevelConnectionIcon from "../assets/icons/level-connection-icon.vue";
import PolygonIcon from "@/assets/icons/polygon-icon.vue";
import ToolbarIconVue from "./ToolbarIcon.vue";
import { useControlStore } from "@/stores/control";
import { defineComponent } from "vue";
import ToolbarChannelTypeVue from "./ToolbarChannelType.vue";
import ToolbarRadiusVue from "./ToolbarRadius.vue";
import ToolbarChannelWidthVue from "./ToolbarChannelWidth.vue";
import ToolbarCustomizedVue from "./ToolbarCustomized.vue";
import { Mode } from "@/library/other";
export default defineComponent({
  components: {
    ToolbarButton,
    ComponentIcon,
    SelectIcon,
    BridgeIcon,
    InletOutletIcon,
    ChannelIcon,
    RoundedCornerIcon,
    LevelConnectionIcon,
    PolygonIcon,
    ToolbarIconVue,
    ToolbarChannelTypeVue,
    ToolbarRadiusVue,
    CircleIcon,
    ToolbarChannelWidthVue,
    ToolbarCustomizedVue
  },
  setup() {
    const controlStore = useControlStore();
    const tools = [
      {
        mode: Mode.Select,
        title: "Select and Move",
        icon: "SelectIcon"
      },
      {
        mode: Mode.Channel,
        title: "Channel",
        icon: "ChannelIcon"
      },
      {
        mode: Mode.Polygon,
        title: "Polygon",
        icon: "PolygonIcon"
      },
      {
        mode: Mode.Circle,
        title: "Circle",
        icon: "CircleIcon"
      },
      {
        mode: Mode.InletOutlet,
        title: "Port",
        icon: "InletOutletIcon"
      },
      {
        mode: Mode.Bridge,
        title: "Bridge",
        icon: "BridgeIcon"
      },
      {
        mode: Mode.RoundedCorner,
        title: "Round Corner",
        icon: "RoundedCornerIcon"
      },
      {
        mode: Mode.InterLayer,
        title: "Via",
        icon: "LevelConnectionIcon"
      }
    ];

    return {
      controlStore,
      tools,
      Mode
    };
  }
});
</script>

<style scoped>
#toolbar-wrapper {
  z-index: 3;
  position: fixed;
  top: 95px;
  left: 5px;
}
</style>
