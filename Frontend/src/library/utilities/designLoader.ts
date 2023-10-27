import { Bridge } from "@/library/bridge";
import { Channel } from "@/library/channel";
import ComponentPolygon from "@/library/componentPolygon";
import { InletOutlet } from "@/library/inletOutlet";
import { LevelConnection } from "@/library/levelConnection";
import ModuleTemplate from "@/library/modules/moduleTemplate";
import {
  BasicPartOutput,
  Bridgeoutput,
  ChannelOutput,
  ComponentCircleOutput,
  ModuleOutput,
  PolygonOutput
} from "@/library/typeDefinations";
import { useContentStore } from "../../stores/content";
import { useControlStore } from "../../stores/control";
import { useMoudleStore } from "../../stores/module";
import ComponentCircle from "../componentCircle";

const loadDesign = (file: Blob): void => {
  try {
    const controlStore = useControlStore();
    controlStore.resetAppSettings();
    const contentStore = useContentStore();
    const reader = new FileReader();
    reader.onload = () => {
      console.log("loaded");
      if (typeof reader.result === "string") {
        const design = JSON.parse(reader.result);
        // parse chipProperties
        contentStore.initializeContent(design.chipProperties);
        contentStore.title = design.title;
        // parse content
        design.content.levelConnections.forEach(
          (levelConnection: BasicPartOutput) => {
            const res = LevelConnection.parse(levelConnection);
            contentStore.contentMap.set(res.id, res);
            contentStore.levelConnectionIds.push(res.id);
          }
        );
        const moduleStore = useMoudleStore();
        design.content.modules?.forEach((module: ModuleOutput) => {
          // const res = this.parseModule(module);
          const res =
            moduleStore.moduleFactory[module.moduleIdx].parseModule(module);
          contentStore.contentMap.set(res.id, res);
        });
        design.content.polygons?.forEach((polygon: PolygonOutput) => {
          const res = ComponentPolygon.parse(polygon);
          contentStore.contentMap.set(res.id, res);
        });
        design.content.circles?.forEach((circle: ComponentCircleOutput) => {
          const res = ComponentCircle.parse(circle);
          contentStore.contentMap.set(res.id, res);
        });
        // console.log("loading inlet outlet");
        design.content.inOutlets?.forEach((inOutlet: BasicPartOutput) => {
          const res = InletOutlet.parse(inOutlet);
          contentStore.contentMap.set(res.id, res);
        });
        design.content.channels?.forEach((channel: ChannelOutput) => {
          const res = Channel.parse(channel);
          contentStore.contentMap.set(res.id, res);
        });
        design.content.bridges?.forEach((bridge: Bridgeoutput) => {
          const res = Bridge.parse(bridge);
          contentStore.contentMap.set(res.id, res);
        });
        // parse layers
        contentStore.levelCount = design.layers.length;
        contentStore.layers = new Map<
          string,
          {
            height: number;
            color: string;
            label: string;
            id: string;
            contentIds: string[];
          }
        >();
        design.layers.forEach(
          (
            layer: {
              height: number;
              label: string;
              id: string;
              contentIds: string[];
            },
            idx: number
          ) => {
            const newLayer = {
              height: layer.height,
              color: contentStore.getColorByIdx(idx),
              label: layer.label,
              id: layer.id,
              contentIds: layer.contentIds.filter((id) => {
                const elm = contentStore.getElement(id);
                return elm && elm.display;
              })
            };
            contentStore.layers.set(layer.id, newLayer);
          }
        );
      } else throw "invalid file!";
    };
    reader.readAsText(file);
  } catch (err) {
    console.log(err);
  }
};

const generateDesign = (): void => {
  const contentStore = useContentStore();
  const chip = {
    title: contentStore.title,
    layers: Array.from(contentStore.layers.values()).map((layer) => ({
      height: layer.height,
      label: layer.label,
      id: layer.id,
      contentIds: layer.contentIds
    })),
    chipProperties: contentStore.chipProperties.map((p) => p.value),
    content: {
      modules: Array<ModuleOutput>(),
      polygons: Array<PolygonOutput>(),
      circles: Array<ComponentCircleOutput>(),
      inOutlets: Array<BasicPartOutput>(),
      channels: Array<ChannelOutput>(),
      bridges: Array<Bridgeoutput>(),
      levelConnections: Array<BasicPartOutput>()
    }
  };
  // don't add hidden elements
  contentStore.layers.forEach((layer, layerId) => {
    layer.contentIds.forEach((id) => {
      const elm = contentStore.getElement(id);
      if (elm.display) {
        if (elm instanceof ModuleTemplate) {
          chip.content.modules.push(elm.buildOutput(layerId));
        } else if (elm instanceof Channel) {
          chip.content.channels.push(elm.buildOutput(layerId));
        } else if (elm instanceof InletOutlet) {
          chip.content.inOutlets.push(elm.buildOutput(layerId));
        } else if (elm instanceof ComponentPolygon) {
          chip.content.polygons.push(elm.buildOutput(layerId));
        } else if (elm instanceof Bridge) {
          chip.content.bridges.push(elm.buildOutput(layerId));
        } else if (elm instanceof ComponentCircle) {
          chip.content.circles.push(elm.buildOutput(layerId));
        }
      }
    });
  });
  contentStore.levelConnectionIds.forEach((id) => {
    const elm = contentStore.getElement(id);
    if (elm.display && elm instanceof LevelConnection) {
      chip.content.levelConnections.push(elm.buildOutput());
    }
  });

  // download design
  const textBlob = new Blob([JSON.stringify(chip)], {
    type: "text/plain"
  });
  const a = document.createElement("a");
  a.download = `${contentStore.title}.json`;
  a.href = window.URL.createObjectURL(textBlob);
  a.click();
};
export default { loadDesign, generateDesign };
