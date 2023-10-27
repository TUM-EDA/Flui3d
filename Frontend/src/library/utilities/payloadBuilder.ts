import { useContentStore } from "../../stores/content";
import {
  ComponentObject,
  CrossLayerConnection,
  PayloadLayer
} from "../typeDefinations";
import ModuleTemplate from "../modules/moduleTemplate";
import {
  PayloadChannel,
  PayloadPolygon,
  Point
} from "@/library/payloadPrimitives";
import { Channel } from "@/library/channel";
import { LevelConnection } from "@/library/levelConnection";
import { InletOutlet } from "@/library/inletOutlet";
import { Bridge } from "@/library/bridge";
import ComponentPolygon from "@/library/componentPolygon";
import ComponentCircle from "@/library/componentCircle";

const globalCompensationPolygon = (
  h: number,
  elevation: number
): PayloadPolygon => {
  const z = elevation - h;
  const contentStore = useContentStore();
  const x = contentStore.chipLengthX;
  const y = contentStore.chipLengthY;
  const p1 = new Point(0, 0, z);
  const p2 = new Point(x, 0, z);
  const p3 = new Point(x, y, z);
  const p4 = new Point(0, y, z);
  return new PayloadPolygon([p1, p2, p3, p4], false, 0, 0, h);
};
const calculateLocalCompensation = (
  z: number,
  localCompMin: number,
  minAt: number,
  localCompMax: number,
  maxAt: number
): number => {
  if (localCompMin === 0) {
    localCompMin = 10 ** -9;
  }
  try {
    const maxmin = localCompMax / localCompMin;
    return (
      localCompMax +
      localCompMin -
      localCompMin * maxmin ** ((maxAt - z) / (maxAt - minAt))
    );
  } catch (err) {
    console.log(err);
    return 0;
  }
};

export const buildRequestBody = (
  precision: string,
  globalCompCheck: boolean,
  globalComp: number,
  localCompCheck: boolean,
  localCompMin: number,
  minAt: number,
  localCompMax: number,
  maxAt: number
): string => {
  const contentStore = useContentStore();
  const requestBody = {
    layers: Array<PayloadLayer>(),
    crosslayerConnections: Array<CrossLayerConnection>(),
    // {id:string, shapes: [connection (+ chamfer)]}
    relation: [],
    general: {
      length: contentStore.chipProperties[0].value,
      width: contentStore.chipProperties[1].value,
      thickness: contentStore.chipProperties[2].value,
      precision: precision
    }
  };
  if (globalCompCheck) {
    requestBody.general.thickness += globalComp * contentStore.layers.size;
  } else {
    globalComp = 0;
  }
  // sort layers
  const layersArr = Array.from(contentStore.layers.values());
  layersArr.sort((l1, l2) => {
    return l1.height - l2.height;
  });

  layersArr.forEach((layer, idx) => {
    const components = Array<ComponentObject>();
    const channels = Array<PayloadChannel>();

    const elevation = layer.height + globalComp * (idx + 1);
    const localComp = localCompCheck
      ? calculateLocalCompensation(
          elevation,
          localCompMin,
          minAt,
          localCompMax,
          maxAt
        )
      : 0;

    // reset channel points
    layer.contentIds.forEach((id) => {
      const elm = contentStore.getElement(id);
      if (elm instanceof Channel) {
        elm.resetBridges();
      }
    });
    // bind bridges to channel points
    layer.contentIds.forEach((id) => {
      const elm = contentStore.getElement(id);
      if (elm.display && elm instanceof Bridge) {
        elm.channelSegment.start.bridges.push(elm);
      }
    });
    // build
    layer.contentIds.forEach((id) => {
      const elm = contentStore.getElement(id);
      if (elm.display) {
        if (
          elm instanceof ModuleTemplate ||
          elm instanceof ComponentPolygon ||
          elm instanceof ComponentCircle
        ) {
          const p = elm.buildPayload(elevation - localComp, localComp);
          if (p) components.push(p);
        } else if (elm instanceof Channel) {
          channels.push(elm.buildPayload(elevation - localComp, localComp));
        } else if (elm instanceof InletOutlet) {
          const connection = elm.buildPayload(
            elevation - localComp,
            requestBody.general.thickness
          );
          if (connection) requestBody.crosslayerConnections.push(connection);
        }
      }
    });
    const newLayer: PayloadLayer = {
      elevation: elevation,
      components: components,
      channels: channels
    };
    if (globalCompCheck) {
      newLayer.compensation = globalCompensationPolygon(
        globalComp,
        elevation - localComp
      );
    }
    requestBody.layers.push(newLayer);
  });
  // build level connection
  contentStore.levelConnectionIds.forEach((id) => {
    const elm = contentStore.getElement(id);
    if (elm instanceof LevelConnection && elm.display) {
      const p = elm.buildPayload((x: number) => {
        if (localCompCheck)
          return calculateLocalCompensation(
            x,
            localCompMin,
            minAt,
            localCompMax,
            maxAt
          );
        else return 0;
      });

      if (p) {
        requestBody.crosslayerConnections.push(p);
      }
    }
  });
  // download for testing
  // const textBlob = new Blob([JSON.stringify(requestBody)], {
  //   type: "text/plain"
  // });
  // const a = document.createElement("a");
  // a.download = `requestBody.json`;
  // a.href = window.URL.createObjectURL(textBlob);
  // a.click();

  return JSON.stringify(requestBody);
};
