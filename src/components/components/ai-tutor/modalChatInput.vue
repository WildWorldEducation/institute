<script>
export default {
    data() {
        return {
            message: ''
        };
    },
    methods: {}
};
</script>

<template>
    <div class="modal-chat-input">
        <textarea
            ref="messageInput"
            class="chat-text-area rounded border border-dark me-1"
            v-model="message"
            type="text"
            @keydown.enter="handleKeyDown"
        >
        </textarea>
    </div>
</template>

<style scoped></style>
