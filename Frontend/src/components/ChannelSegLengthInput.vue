<template>
    <form class='position-fixed' :style="formStyle" autocomplete="off" @submit.prevent="" @keyup.enter="onSubmit()">
        <div class="input-group flex-nowrap">
            <input class="form-control" type="text" id="segLengthInput" style="width: 80px" maxlength="10"
                v-model.lazy.trim="newValue" @blur="channelSegInput.hideChannelSegLengthInput()" />
            <span class="input-group-text">µm</span>
        </div>
    </form>
</template>
<script>
import { useChannelSegInputStore } from "@/stores/channelSegmentInput";
import { useControlStore } from "@/stores/control";
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from "vue";
export default defineComponent({
    setup() {
        const channelSegInput = useChannelSegInputStore()
        const newValue = ref(channelSegInput.lengthValue)
        const controlStore = useControlStore()
        const onSubmit = () => {
            if (controlStore.isAddingChannel) {
                channelSegInput.setLengthDraw(newValue.value)
            } else {
                channelSegInput.setLengthValue(newValue.value)
            }

        }
        const formStyle = computed(() =>
            `left:${channelSegInput.positionX}px;top:${channelSegInput.positionY}px`
        )
        onMounted(() => {
            const inputRef = document.getElementById("segLengthInput");
            inputRef.focus();
            inputRef.select()
        })
        onBeforeUnmount(() => {
            const workArea = document.getElementById("workarea");
            workArea.focus();
        })
        return { channelSegInput, newValue, onSubmit, formStyle }
    }
});
</script>
  
  
  