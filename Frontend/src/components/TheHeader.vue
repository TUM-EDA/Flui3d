<template>
  <div
    class="container-fluid bg-light position-absolute start-0 top-0 border-bottom"
    id="header-wrapper"
  >
    <div class="d-flex justify-content-between align-items-center mx-3">
      <div class="d-flex align-items-center">
        <img
          src="../assets/logo/Logo.svg"
          alt=""
          style="height: 25px"
          class="me-2"
        />
        <img src="../assets/logo/Logo_Flui3d.svg" alt="" style="height: 23px" />
      </div>

      <div class="w-50 text-center">
        <form
          @submit.prevent="onSubmit"
          autocomplete="off"
          v-if="isEditingName"
        >
          <input
            id="module-name-input"
            ref="moduleNameInput"
            type="text"
            v-model.lazy.trim="newTitle"
            @blur="onSubmit(moduleNameInput)"
            required
          />
        </form>

        <div
          id="module-name-wrapper"
          v-else
          style="cursor: pointer"
          @click="startEditingTitle"
        >
          <span class="align-middle"> {{ content.title }}</span>
        </div>
      </div>

      <div class="d-flex justify-content-end align-items-center">
        <button
          id="newChipBtn"
          class="btn btn-sm"
          data-bs-toggle="modal"
          data-bs-target="#helpModal"
          title="Help"
        >
          <i class="fa-solid fa-question"></i>
        </button>

        <button
          id="newChipBtn"
          class="btn btn-sm"
          data-bs-toggle="modal"
          data-bs-target="#startModal"
          title="New Design"
        >
          <i class="fa-solid fa-plus"></i>
        </button>
        <button
          class="btn btn-sm"
          type="button"
          title="Export Design"
          @click="generateDesign()"
        >
          <i class="fa-solid fa-download"></i>
        </button>
        <button
          class="btn btn-sm"
          type="button"
          data-bs-toggle="modal"
          data-bs-target="#outputOptionModal"
          title="Generate STL"
        >
          <i class="fa-solid fa-display"></i>
        </button>
        <button
          class="btn btn-sm ms-5"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasScrolling"
          aria-controls="offcanvasScrolling"
        >
          <i class="fa-solid fa-bars"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useContentStore } from "@/stores/content";
import designLoader from "@/library/utilities/designLoader";
import { nextTick, ref } from "vue";

const isEditingName = ref(false);
const content = useContentStore();

const newTitle = ref(content.title);
const moduleNameInput = ref(null);
const onSubmit = () => {
  if (newTitle.value.length > 0) {
    content.$patch({ title: newTitle.value });
    isEditingName.value = false;
  } else {
    document.getElementById("module-name-input").focus();
  }
};

const startEditingTitle = () => {
  isEditingName.value = true;
  nextTick(() => document.getElementById("module-name-input").focus());
};

const generateDesign = () => {
  designLoader.generateDesign();
};
</script>

<style scoped>
#module-name-input {
  border: 1px solid #0d6efd;
  border-radius: 15px;
  text-align: center;
  width: 100%;
}
#module-name-wrapper {
  border: 1px solid #0d6efd;
  border-radius: 15px;
  overflow: hidden;
  white-space: nowrap;
}

#module-name-wrapper::before {
  float: left;
  content: "Title:";
  color: #0d6efd;
  margin: 4px 0 0 10px;
  font-size: small;
}

#header-wrapper {
  z-index: 1046;
}
</style>
