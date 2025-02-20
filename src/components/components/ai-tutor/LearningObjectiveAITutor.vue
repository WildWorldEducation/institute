<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    props: ['skillName', 'skillUrl', 'learningObjective'],
    components: {},
    data() {
        return {
            message: ''
        };
    },
    async mounted() {},
    updated() {},
    computed: {},
    methods: {
        async SendMessage() {
            if (this.waitForAIresponse) {
                return;
            }
            this.waitForAIresponse = true;
            try {
                // Add user message to messages list
                const userMessage = {
                    role: 'user',
                    content: [{ text: { value: this.message } }]
                };
                // this.messageList.push(userMessage);

                const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        learningObjective: this.learningObjective,
                        userName: this.userDetailsStore.userName,
                        userId: this.userDetailsStore.userId,
                        skillName: this.skillName,
                        skillUrl: this.skillUrl
                    })
                };

                var url = '/ai-tutor/explain-learning-objective';
                // this.message = '';
                const res = await fetch(url, requestOptions);
                if (res.status === 500) {
                    alert('The tutor can`t answer !!');
                    this.waitForAIresponse = false;
                    return;
                }
                const resData = await res.json();
                let response = resData.message;
                this.message = response[0].content[0].text.value;

                // this.messageList.push(this.latestMessage);
                // this.waitForAIresponse = false;
            } catch (error) {
                console.error(error);
                this.waitForAIresponse = false;
            }
        },
        // Because OpenAI returns the content with html
        removeHTMLnotation(string) {
            let result = string.replace(/```html/g, '');
            result = result.replace(/```/g, '');
            return result;
        },
        explainLearningObjective() {
            this.SendMessage();
        },
        quizLearningObjective() {}
    },
    watch: {
        // Update text area height base on message input
        message: function (newItem, oldItem) {
            let { messageTextArea } = this.$refs;
            const lineHeightInPixels = 1000;

            return;
            // Reset messageInput Height
            messageTextArea.setAttribute(
                `style`,
                `height:${lineHeightInPixels}px;overflow-y:hidden;`
            );

            console.log(this.message.scrollHeight);
            console.log(this.message);

            // Calculate number of lines (soft and hard)
            const height = messageTextArea.style.height;
            const scrollHeight = this.message.scrollHeight;
            messageTextArea.style.height = height;
            const count = Math.floor(scrollHeight / lineHeightInPixels);

            console.log(count);
            console.log(lineHeightInPixels);

            this.$nextTick(() => {
                messageTextArea.setAttribute(
                    `style`,
                    `height:${count * lineHeightInPixels}px;overflow-y:hidden;`
                );
            });
        }
    }
};
</script>

<template>
    <span class="d-flex justify-content-end">
        <!-- learning objective explanation button -->
        <button class="btn" @click="explainLearningObjective()">
            <!-- Robot icon -->
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
                width="18"
                height="18"
                fill="black"
            >
                <path
                    d="M320 0c17.7 0 32 14.3 32 32l0 64 120 0c39.8 0 72 32.2 72 72l0 272c0 39.8-32.2 72-72 72l-304 0c-39.8 0-72-32.2-72-72l0-272c0-39.8 32.2-72 72-72l120 0 0-64c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224l16 0 0 192-16 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-16 0 0-192 16 0z"
                />
            </svg>
        </button>
        <!-- learning objective quiz button -->
        <button class="btn" @click="quizLearningObjective()">
            <!-- Question mark icon -->
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                width="18"
                height="18"
                fill="black"
            >
                <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                <path
                    d="M504 256c0 137-111 248-248 248S8 393 8 256C8 119.1 119 8 256 8s248 111.1 248 248zM262.7 90c-54.5 0-89.3 23-116.5 63.8-3.5 5.3-2.4 12.4 2.7 16.3l34.7 26.3c5.2 3.9 12.6 3 16.7-2.1 17.9-22.7 30.1-35.8 57.3-35.8 20.4 0 45.7 13.1 45.7 33 0 15-12.4 22.7-32.5 34C247.1 238.5 216 254.9 216 296v4c0 6.6 5.4 12 12 12h56c6.6 0 12-5.4 12-12v-1.3c0-28.5 83.2-29.6 83.2-106.7 0-58-60.2-102-116.5-102zM256 338c-25.4 0-46 20.6-46 46 0 25.4 20.6 46 46 46s46-20.6 46-46c0-25.4-20.6-46-46-46z"
                />
            </svg>
        </button>
    </span>
    <div
        ref="messageTextArea"
        class="rounded mb-3 chat-text-area"
        v-html="removeHTMLnotation(message)"
    ></div>
</template>

<style scoped>
.chat-text-area {
    outline: none;
    border: 0px;
    width: 100%;
    resize: none;
}
</style>
