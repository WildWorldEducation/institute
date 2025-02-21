<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';
import TutorLoadingSymbol from './tutorLoadingSymbol.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    props: [
        'skillName',
        'skillUrl',
        'learningObjective',
        'learningObjectiveId'
    ],
    components: { TutorLoadingSymbol },
    data() {
        return {
            message: '',
            messageList: [],
            waitForAIresponse: false,
            isGotMessages: false
        };
    },
    async mounted() {
        console.log(this.learningObjectiveId);
        await this.getMessages();
    },
    updated() {},
    computed: {},
    methods: {
        async getMessages() {
            try {
                console.log('get messages');

                const url = `/ai-tutor/learning-objectives/messages-list?userId=${encodeURIComponent(
                    this.userDetailsStore.userId
                )}&learningObjectiveId=${encodeURIComponent(
                    this.learningObjectiveId
                )}`;

                const response = await fetch(url);
                const resData = await response.json();
                this.messageList = resData.messages.data;
                // we reverse order of messages list because OpenAI return messages from newest to oldest
                this.messageList.reverse();
                // this.$nextTick(this.scrollToMessageInput());
                console.log('got messages');
                console.log(this.messageList);
                this.isGotMessages = true;
            } catch (error) {
                console.error(error);
            }
        },
        async SendMessage() {
            if (this.waitForAIresponse) {
                return;
            }
            this.waitForAIresponse = true;
            try {
                // Add user message to messages list
                // const userMessage = {
                //     role: 'user',
                //     content: [{ text: { value: this.message } }]
                // };
                // this.messageList.push(userMessage);

                const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        learningObjective: this.learningObjective,
                        learningObjectiveId: this.learningObjectiveId,
                        userName: this.userDetailsStore.userName,
                        userId: this.userDetailsStore.userId,
                        skillName: this.skillName
                    })
                };

                //  var url = '/ai-tutor/explain-learning-objective';
                var url = '/ai-tutor/learning-objectives/new-message';
                // this.message = '';
                const res = await fetch(url, requestOptions);
                if (res.status === 500) {
                    alert('The tutor can`t answer !!');
                    this.waitForAIresponse = false;
                    return;
                }
                const resData = await res.json();

                console.log(resData);

                //this.message = response[0].content[0].text.value;
                this.latestMessage = resData.message.content[0].text.value;

                this.messageList.push(this.latestMessage);
                this.getMessages();
                this.waitForAIresponse = false;
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

            console.log(this.message);
            console.log(this.message.scrollHeight);

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
        <button
            v-if="isGotMessages"
            class="btn border"
            @click="explainLearningObjective()"
        >
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
            explain this
        </button>
        <!-- learning objective quiz button -->
        <!-- <button class="btn border" @click="quizLearningObjective()"> -->
        <!-- Question mark icon -->
        <!-- <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                width="18"
                height="18"
                fill="black"
            > -->
        <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
        <!-- <path
                    d="M504 256c0 137-111 248-248 248S8 393 8 256C8 119.1 119 8 256 8s248 111.1 248 248zM262.7 90c-54.5 0-89.3 23-116.5 63.8-3.5 5.3-2.4 12.4 2.7 16.3l34.7 26.3c5.2 3.9 12.6 3 16.7-2.1 17.9-22.7 30.1-35.8 57.3-35.8 20.4 0 45.7 13.1 45.7 33 0 15-12.4 22.7-32.5 34C247.1 238.5 216 254.9 216 296v4c0 6.6 5.4 12 12 12h56c6.6 0 12-5.4 12-12v-1.3c0-28.5 83.2-29.6 83.2-106.7 0-58-60.2-102-116.5-102zM256 338c-25.4 0-46 20.6-46 46 0 25.4 20.6 46 46 46s46-20.6 46-46c0-25.4-20.6-46-46-46z"
                />
            </svg>
            quiz me
        </button> -->
    </span>
    <!-- <div
        ref="messageTextArea"
        class="rounded mb-3 chat-text-area"
        v-html="removeHTMLnotation(message)"
    ></div> -->
    <div
        class="d-flex my-3"
        :class="{ 'flex-row-reverse': message.role === 'user' }"
        v-for="message in messageList"
    >
        <div v-if="message.role === 'user'" class="user-conversation">
            {{ message.content[0].text.value }}
        </div>
        <div
            v-else-if="
                message.role === 'assistant' &&
                message.content[0].type == 'text'
            "
            class="tutor-conversation"
            v-html="removeHTMLnotation(message.content[0].text.value)"
        ></div>
    </div>
    <div class="ai-tutor-processing" v-if="waitForAIresponse">
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
        Thinking
        <TutorLoadingSymbol />
    </div>
</template>

<style scoped>
.chat-text-area {
    width: 100%;
}

.ai-tutor-processing {
    display: flex;
    width: fit-content;
    flex-direction: row;
    align-items: center;
    gap: 5px;
    border-radius: 25px;
    border: 1px solid #acacac;
    padding: 5px 10px;
    margin-bottom: 15px;
}
</style>
