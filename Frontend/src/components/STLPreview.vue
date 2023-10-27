<template>
  <div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title">STL Preview</h5>
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="modal"
        aria-label="Close"
      ></button>
    </div>
    <div class="modal-body">
      <div
        v-if="contentStore.stlLoadingState === STLLoadingState.Loading"
        style="height: 300px"
      >
        <div id="loader">
          <div class="dot dot-1"></div>
          <div class="dot dot-2"></div>
          <div class="dot dot-3"></div>
          <p style="margin-top: 200px; margin-left: 25px">generating output file</p>
        </div>
      </div>
      <div v-else-if="contentStore.stlLoadingState === STLLoadingState.Succeed">
        <STLPreviewWindow />
        <div class="modal-footer mt-3">
          <button class="btn btn-primary m-auto" @click="downloadSTL()">
            Download STL
          </button>
        </div>
      </div>
      <div v-else-if="contentStore.stlLoadingState === STLLoadingState.Fail">
        <div class="alert alert-danger" role="alert">
          Warning: STL file generation has failed. This may be due to invalid design parameters or the design file exceeding the server processing time limit. Please check your design parameters or consider reducing the generation precision.
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import STLPreviewWindow from "./STLPreviewWindow.vue";
import { useContentStore } from "@/stores/content";
import { defineComponent } from "vue";
import { STLLoadingState } from "@/library/other";

export default defineComponent({
  setup() {
    const contentStore = useContentStore();
    const downloadSTL = () => {
      try {
        const textBlob = new Blob([contentStore.stlData], {
          type: "text/plain"
        });
        const a = document.createElement("a");
        a.download = `${contentStore.title}.stl`;
        a.href = window.URL.createObjectURL(textBlob);
        a.click();
      } catch (err) {
        console.log(err);
      }
    };

    return { contentStore, downloadSTL, STLLoadingState };
  },

  components: {
    STLPreviewWindow
  }
});
</script>

<style scoped>
#stl-preview {
  width: 100%;
  height: 100%;
  overflow: auto;
}

#loader {
  width: 200px;
  height: 200px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: auto;
  filter: url('#goo');
  animation: rotate-move 2s ease-in-out infinite;
}

.dot {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: #000;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
}

.dot-3 {
  background-color: #f74d75;
  animation: dot-3-move 2s ease infinite, index 6s ease infinite;
}

.dot-2 {
  background-color: #10beae;
  animation: dot-2-move 2s ease infinite, index 6s -4s ease infinite;
}

.dot-1 {
  background-color: #ffe386;
  animation: dot-1-move 2s ease infinite, index 6s -2s ease infinite;
}

@keyframes dot-3-move {
  20% {transform: scale(1)}
  45% {transform: translateY(-18px) scale(.45)}
  60% {transform: translateY(-90px) scale(.45)}
  80% {transform: translateY(-90px) scale(.45)}
  100% {transform: translateY(0px) scale(1)}
}

@keyframes dot-2-move {
  20% {transform: scale(1)}
  45% {transform: translate(-16px, 12px) scale(.45)}
  60% {transform: translate(-80px, 60px) scale(.45)}
  80% {transform: translate(-80px, 60px) scale(.45)}
  100% {transform: translateY(0px) scale(1)}
}

@keyframes dot-1-move {
  20% {transform: scale(1)}
  45% {transform: translate(16px, 12px) scale(.45)}
  60% {transform: translate(80px, 60px) scale(.45)}
  80% {transform: translate(80px, 60px) scale(.45)}
  100% {transform: translateY(0px) scale(1)}
}

@keyframes rotate-move {
  55% {transform: translate(-50%, -50%) rotate(0deg)}
  80% {transform: translate(-50%, -50%) rotate(360deg)}
  100% {transform: translate(-50%, -50%) rotate(360deg)}
}

@keyframes index {
  0%, 100% {z-index: 3}
  33.3% {z-index: 2}
  66.6% {z-index: 1}
}


#loader1 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 10px;
  background: #3498db;
  border-radius: 5px;
  animation: load 1.8s ease-in-out infinite;
}
#loader1:before,
#loader1:after {
  position: absolute;
  display: block;
  content: "";
  animation: load 1.8s ease-in-out infinite;
  height: 10px;
  border-radius: 5px;
}
#loader1:before {
  top: -20px;
  left: 10px;
  width: 40px;
  background: #ef4836;
}
#loader1:after {
  bottom: -20px;
  width: 35px;
  background: #f5ab35;
}

@keyframes load {
  0% {
    transform: translateX(40px);
  }
  50% {
    transform: translateX(-30px);
  }
  100% {
    transform: translateX(40px);
  }
}
</style>
