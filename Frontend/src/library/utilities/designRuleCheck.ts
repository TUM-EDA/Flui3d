import { Channel } from "@/library/channel";
import ModuleTemplate from "@/library/modules/moduleTemplate";
import { useContentStore } from "@/stores/content";
import { useCoordinateStore } from "@/stores/coordinate";
import { ref, reactive } from "vue";
import { Bridge } from "../bridge";
import { InletOutlet } from "../inletOutlet";
import { LevelConnection } from "../levelConnection";

const channelWidthMin = ref(100);
const compDistMin = ref(100);
const minPortRadius = ref(100);
const minViaRadius = ref(100);

interface DesignRule {
  isChecked: boolean;
  result: number; // result -1: unknown, 0: passed, >=1: (number of) failed
  description: string;
  failedItems: (string | string[])[];
  runCheck: () => void;
}

const designRuleDescription = {
  channelWidthCheck: "Minimum channel width",
  compMinDistCheck: "Minimum distance between components",
  overlappingCheck: "Overlapping check on components",
  layerOverlappingCheck: "Overlapping check on layers",
  elmOutOfBoundaryCheck: "Out of boundary check",
  minPortRadiusCheck: "Minimum port radius",
  minViaRadiusCheck: "Minimum via radius"
};

// design rules start
const channelWidthCheck: DesignRule = reactive({
  description: designRuleDescription.channelWidthCheck,
  isChecked: true,
  result: -1,
  failedItems: Array<string>(),
  runCheck: function () {
    this.failedItems = Array<string>();
    const contentStore = useContentStore();
    contentStore.layers.forEach((layer) => {
      layer.contentIds.forEach((id) => {
        const elm = contentStore.getElement(id);
        if (elm instanceof Channel && elm.display) {
          if (elm.properties.channelWidth.value < channelWidthMin.value) {
            this.failedItems.push(elm.id);
          }
        }
      });
    });
    this.result = this.failedItems.length;
  }
});

// return true if the distance between the two elements < d(global)
const distCheckFailed = (id1: string, id2: string, d: number): boolean => {
  const rect1 = document.getElementById(id1)?.getBoundingClientRect();
  const rect2 = document.getElementById(id2)?.getBoundingClientRect();
  if (rect1 instanceof DOMRect && rect2 instanceof DOMRect) {
    const coordonateStore = useCoordinateStore();
    const dWindow = coordonateStore.globalToWindow(d);
    return distLessThan(rect1, rect2, dWindow);
  } else {
    return false;
  }
};

// window scale
const distLessThan = (r1: DOMRect, r2: DOMRect, d: number): boolean =>
  r1.x + r1.width + d > r2.x &&
  r1.x - d < r2.x + r2.width &&
  r1.y + r1.height + d > r2.y &&
  r1.y - d < r2.y + r2.height;

// return true if r1 fully covers r2
const fullCoverage = (r1: DOMRect, r2: DOMRect): boolean =>
  r1.x < r2.x &&
  r1.x + r1.width > r2.x + r2.width &&
  r1.y < r2.y &&
  r1.y + r1.height > r2.y + r2.height;

const compMinDistCheck: DesignRule = reactive({
  description: designRuleDescription.compMinDistCheck,
  isChecked: true,
  result: -1,
  failedItems: Array<string[]>(),
  runCheck: function () {
    this.failedItems = Array<string[]>();
    const contentStore = useContentStore();
    contentStore.layers.forEach((layer) => {
      // get all components in the layer
      const components = Array<string>();
      layer.contentIds.forEach((id) => {
        const elm = contentStore.getElement(id);
        if (elm instanceof ModuleTemplate && elm.display) {
          components.push(id);
        }
      });
      // run dist check
      if (components.length > 1) {
        for (let i = 0; i < components.length - 1; i++) {
          for (let j = i + 1; j < components.length; j++) {
            if (
              distCheckFailed(components[i], components[j], compDistMin.value)
            ) {
              this.failedItems.push([components[i], components[j]]);
            }
          }
        }
      }
    });
    this.result = this.failedItems.length;
  }
});

const outOfBondCheck: DesignRule = reactive({
  description: designRuleDescription.elmOutOfBoundaryCheck,
  isChecked: true,
  result: -1,
  failedItems: Array<string>(),
  runCheck: function () {
    this.failedItems = Array<string>();
    const contentStore = useContentStore();
    const chipBoundary = document
      .getElementById("chipBoundary")
      ?.getBoundingClientRect();
    contentStore.layers.forEach((layer) => {
      layer.contentIds.forEach((id) => {
        const elm = contentStore.getElement(id);
        if (
          elm.display &&
          !fullCoverage(
            <DOMRect>chipBoundary,
            <DOMRect>document.getElementById(elm.id)?.getBoundingClientRect()
          )
        ) {
          this.failedItems.push(elm.id);
        }
      });
    });
    this.result = this.failedItems.length;
  }
});

// const compOverlappingCheck: DesignRule = reactive({
//   description: designRuleDescription.overlappingCheck,
//   isChecked: true,
//   result: -1,
//   failedItems: Array<string[]>(),
//   runCheck: function () {
//     this.failedItems = Array<string[]>();
//     const contentStore = useContentStore();
//     contentStore.layers.forEach((layer) => {
//       // get all components in the layer
//       const components = Array<string>();
//       layer.contentIds.forEach((id) => {
//         const elm = contentStore.getElement(id);
//         if (elm instanceof ModuleTemplate && elm.display) {
//           components.push(id);
//         }
//       });
//       // run dist check
//       if (components.length > 1) {
//         for (let i = 0; i < components.length - 1; i++) {
//           for (let j = i + 1; j < components.length; j++) {
//             if (distCheckFailed(components[i], components[j], 0)) {
//               this.failedItems.push([components[i], components[j]]);
//             }
//           }
//         }
//       }
//     });
//     this.result = this.failedItems.length;
//   }
// });

const layerOverlappingCheck = reactive({
  description: designRuleDescription.layerOverlappingCheck,
  isChecked: true,
  result: -1,
  failedItems: Array<string>(),
  runCheck: function () {
    this.failedItems = Array<string>();
    const contentStore = useContentStore();
    // sort layers
    const layersArr = Array.from(contentStore.layers.values());
    // only check components, channels and bridges
    for (let i = 0; i < layersArr.length - 1; ++i) {
      const heightLimit = layersArr[i + 1].height - layersArr[i].height;
      layersArr[i].contentIds.forEach((id) => {
        const elm = contentStore.getElement(id);
        if (
          (elm instanceof ModuleTemplate ||
            elm instanceof Channel ||
            elm instanceof Bridge) &&
          elm.display &&
          elm.getHeight() >= heightLimit
        ) {
          this.failedItems.push(elm.id);
        }
      });
    }
    this.result = this.failedItems.length;
  }
});

const minPortRadiusCheck = reactive({
  description: designRuleDescription.minPortRadiusCheck,
  isChecked: true,
  result: -1,
  failedItems: Array<string>(),
  runCheck: function () {
    this.failedItems = Array<string>();
    const contentStore = useContentStore();
    contentStore.layers.forEach((layer) => {
      layer.contentIds.forEach((id) => {
        const elm = contentStore.getElement(id);
        if (elm instanceof InletOutlet && elm.display) {
          if (elm.properties.r1.value < minPortRadius.value) {
            this.failedItems.push(elm.id);
          }
        }
      });
    });
    this.result = this.failedItems.length;
  }
});

const minViaRadiusCheck = reactive({
  description: designRuleDescription.minViaRadiusCheck,
  isChecked: true,
  result: -1,
  failedItems: Array<string>(),
  runCheck: function () {
    this.failedItems = Array<string>();
    const contentStore = useContentStore();
    contentStore.layers.forEach((layer) => {
      layer.contentIds.forEach((id) => {
        const elm = contentStore.getElement(id);
        if (elm instanceof LevelConnection && elm.display) {
          if (elm.properties.r.value < minViaRadius.value) {
            this.failedItems.push(elm.id);
          }
        }
      });
    });
    this.result = this.failedItems.length;
  }
});
// end design rules

const designRules: DesignRule[] = [
  channelWidthCheck,
  compMinDistCheck,
  minPortRadiusCheck,
  minViaRadiusCheck,
  outOfBondCheck,
  // compOverlappingCheck,
  layerOverlappingCheck
];

const runDRC = (): void => {
  designRules.forEach((dr) => {
    if (dr.isChecked) {
      dr.runCheck();
    } else {
      dr.result = -1;
    }
  });
};

export {
  DesignRule,
  compDistMin,
  channelWidthMin,
  minPortRadius,
  minViaRadius,
  designRules,
  runDRC
};
