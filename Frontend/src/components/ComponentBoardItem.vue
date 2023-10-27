<template>
  <div class="card text-center pt-2 my-2" style="width: 18rem">
    <div class="w-auto mx-auto">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="150"
        height="100"
        :fill="fillColor"
        :stroke="fillColor"
        :stroke-width="strokeWidth"
      >
        <component :is="moduleCreator.sample" />
      </svg>
    </div>

    <div class="card-body">
      <h5 class="card-title">{{ moduleCreator.moduleName }}</h5>
      <p class="card-text">{{ moduleCreator.description }}</p>
      <a href="#" class="btn btn-outline-success">Create</a>
    </div>
  </div>
</template>

<script>
import SampleChamber from "@/assets/moduleSamples/SampleChamber.vue";
import SampleDelayChannel from "@/assets/moduleSamples/SampleDelayChannel.vue";
import SampleFilter from "@/assets/moduleSamples/SampleFilter.vue";
import SampleTeslaValve from "@/assets/moduleSamples/SampleTeslaValve.vue";
import SampleDroplet from "@/assets/moduleSamples/SampleDroplet.vue";
import SampleTransition from "@/assets/moduleSamples/SampleTransition.vue";
import { defineComponent } from "vue";

export default defineComponent({
  components: {
    SampleChamber,
    SampleDelayChannel,
    SampleFilter,
    SampleTeslaValve,
    SampleDroplet,
    SampleTransition
  },
  props: {
    moduleCreator: Object
  },
  data() {
    return {
      fillColor: "dodgerblue",
      strokeWidth: 7
    };
  }
});
</script>

>
