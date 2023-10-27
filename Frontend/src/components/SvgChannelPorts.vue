<template>
  <g stroke="none" @mouseleave="hover = false">
    <circle
      v-if="hover"
      :cx="hoverPort[0]"
      :cy="hoverPort[1]"
      r="200"
      fill="cyan"
      opacity="0.7"
    />
    <circle
      v-for="(port, index) in portsOnCrtLevel"
      :key="index"
      :cx="port.position[0]"
      :cy="port.position[1]"
      r="400"
      fill="transparent"
      @mouseenter="setHoverPort(port.position)"
      @mousemove.stop=""
      @mouseup.left.stop="bindChannelPort(port)"
    />
  </g>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useControlStore } from "@/stores/control";
import { useContentStore } from "../stores/content";
import { useCoordinateStore } from "@/stores/coordinate";
import { ChannelPort } from "@/library/other";
import ModuleTemplate from "@/library/modules/moduleTemplate";
import { InletOutlet } from "@/library/inletOutlet";
export default defineComponent({
  setup() {
    const controlStore = useControlStore();
    const contentStore = useContentStore();
    const coordinateStore = useCoordinateStore();
    const hoverPort = ref([0, 0]);
    const hover = ref(false);
    const setHoverPort = (port: number[]) => {
      hoverPort.value = port;
      coordinateStore.roundedGlobalCoords[0] = hoverPort.value[0];
      coordinateStore.roundedGlobalCoords[1] = hoverPort.value[1];
      hover.value = true;
    };
    const portsOnCrtLevel = computed(() => {
      const ports = Array<ChannelPort>();
      contentStore.crtLayerIds?.forEach((id) => {
        const elm = contentStore.getElement(id);
        if (elm.display) {
          if (elm instanceof ModuleTemplate) {
            if (elm.channelPorts) {
              elm.channelPorts.forEach((p) => {
                ports.push(p);
              });
            }
          }
          if (elm instanceof InletOutlet) {
            ports.push(elm.channelPort);
          }
        }
      });
      contentStore.levelConnectionIds.forEach((id) => {
        const elm = contentStore.getElement(id);
        if (elm.display) {
          ports.push(elm.channelPort);
        }
      });
      return ports;
    });
    const bindChannelPort = (port: ChannelPort) => {
      controlStore.bindChannelPort(port);
    };
    return {
      hover,
      hoverPort,
      controlStore,
      contentStore,
      portsOnCrtLevel,
      setHoverPort,
      bindChannelPort
    };
  }
});
</script>
