<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';
import TutorLoadingSymbol from './tutorLoadingSymbol.vue';
import katex from 'katex';
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
        'skillLevel',
        'learningObjective',
        'learningObjectiveId'
    ],
    components: { TutorLoadingSymbol },
    data() {
        return {
            message: '',
            // All messages in thread
            messageList: [],
            waitForAIresponse: false,
            isGotMessages: false,
            englishSkillLevel: ''
        };
    },
    async mounted() {
        this.englishSkillLevel = this.skillLevel.replace('_', ' ');
        // load thread.
        await this.getMessages();
    },
    methods: {
        // load thread
        async getMessages() {
            this.message = '';
            try {
                const url = `/ai-tutor/learning-objectives/messages-list?userId=${encodeURIComponent(
                    this.userDetailsStore.userId
                )}&learningObjectiveId=${encodeURIComponent(
                    this.learningObjectiveId
                )}&learningObjective=${encodeURIComponent(
                    this.learningObjective
                )}&skillLevel=${encodeURIComponent(this.englishSkillLevel)}`;

                const response = await fetch(url);
                const resData = await response.json();
                this.messageList = resData.messages.data;

                console.log(this.messageList.length);
                // AI should check for mastery after every 5 interactions from the user.
                // This assumes the user will interact for every second message.
                if (this.messageList.length > 9) {
                    if (this.messageList.length % 10 === 0)
                        this.automaticMasteryCheck();
                }

                // Close loading animation
                this.isGotMessages = true;
            } catch (error) {
                console.error(error);
            }
        },
        // send Open AI message regarding the learning objective
        async sendMessage() {
            if (this.waitForAIresponse) {
                return;
            }
            // Turn on loading icon
            this.waitForAIresponse = true;
            try {
                const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        learningObjective: this.learningObjective,
                        learningObjectiveId: this.learningObjectiveId,
                        userName: this.userDetailsStore.userName,
                        userId: this.userDetailsStore.userId,
                        skillName: this.skillName,
                        skillLevel: this.englishSkillLevel,
                        // Whatever the user typed.
                        message: this.message
                    })
                };

                var url = '/ai-tutor/learning-objectives/new-message';
                const res = await fetch(url, requestOptions);
                if (res.status === 500) {
                    alert('The tutor can`t answer !!');
                    this.waitForAIresponse = false;
                    return;
                }
                const resData = await res.json();
                this.latestMessage = resData.message.content[0].text.value;

                this.getMessages();
                this.waitForAIresponse = false;
            } catch (error) {
                console.error(error);
                this.waitForAIresponse = false;
            }
        },
        // ask Open AI to ask a question about the learning objective
        async requestQuestion() {
            if (this.waitForAIresponse) {
                return;
            }
            this.waitForAIresponse = true;
            try {
                const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        learningObjective: this.learningObjective,
                        learningObjectiveId: this.learningObjectiveId,
                        userName: this.userDetailsStore.userName,
                        userId: this.userDetailsStore.userId,
                        skillName: this.skillName,
                        skillLevel: this.englishSkillLevel
                    })
                };

                var url = '/ai-tutor/learning-objectives/ask-question';

                const res = await fetch(url, requestOptions);
                if (res.status === 500) {
                    alert('The tutor can`t answer !!');
                    this.waitForAIresponse = false;
                    return;
                }
                const resData = await res.json();

                this.latestMessage = resData.message.content[0].text.value;
                this.messageList.push(this.latestMessage);

                this.getMessages();
                this.waitForAIresponse = false;
            } catch (error) {
                console.error(error);
                this.waitForAIresponse = false;
            }
        },
        async automaticMasteryCheck() {
            try {
                const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        learningObjective: this.learningObjective,
                        learningObjectiveId: this.learningObjectiveId,
                        userName: this.userDetailsStore.userName,
                        userId: this.userDetailsStore.userId,
                        skillName: this.skillName,
                        skillLevel: this.englishSkillLevel
                    })
                };

                var url = '/ai-tutor/learning-objectives/auto-check-mastery';
                const res = await fetch(url, requestOptions);
                if (res.status === 500) {
                    this.waitForAIresponse = false;
                    return;
                }
                const resData = await res.json();
                console.log(resData.message.content[0].text.value);
                if (
                    resData.message.content[0].text.value == 'Yes' ||
                    resData.message.content[0].text.value == 'yes' ||
                    resData.message.content[0].text.value == 'Yes.' ||
                    resData.message.content[0].text.value == 'yes.'
                ) {
                    alert('You seem to understand this learning objective!');
                }
            } catch (error) {
                console.error(error);
                this.waitForAIresponse = false;
            }
        },
        // Format the response.
        applyMarkDownFormatting(string) {
            const md = window.markdownit().use(window.texmath, {
                engine: katex,
                delimiters: ['brackets', 'dollars'],
                katexOptions: { macros: { '\\RR': '\\mathbb{R}' } }
            });

            // let newString = string.replace('\\[ ', '$');
            // newString = newString.replace(' \\]', '$');

            let formattedMessage = md.render(string);
            return formattedMessage;
        }
    }
};
</script>

<template>
    <!-- Thread loading animation -->
    <div
        v-if="isGotMessages == false"
        class="loading-animation d-flex justify-content-center align-items-center py-4"
    >
        <span class="spinning-loader"></span>
    </div>
    <div v-else>
        <!-- Suggested interaction buttons -->
        <span class="d-flex justify-content-end mt-2">
            <!-- learning objective explanation button -->
            <button
                v-if="isGotMessages"
                class="btn border border-dark"
                @click="
                    message = 'Please explain it.';
                    sendMessage();
                "
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
            <!-- learning objective ask question button -->
            <button
                class="btn border border-dark ms-1"
                @click="requestQuestion()"
            >
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
                ask me a question
            </button>
        </span>
        <!-- Custom interactions text input -->
        <span class="d-flex mt-1">
            <textarea
                class="chat-input border border-dark rounded"
                v-model="message"
                type="text"
            />
            <button
                class="btn border border-dark ms-1 message-btn"
                @click="sendMessage()"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    width="18"
                    height="18"
                    fill="black"
                >
                    <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                    <path
                        d="M256 448c141.4 0 256-93.1 256-208S397.4 32 256 32S0 125.1 0 240c0 45.1 17.7 86.8 47.7 120.9c-1.9 24.5-11.4 46.3-21.4 62.9c-5.5 9.2-11.1 16.6-15.2 21.6c-2.1 2.5-3.7 4.4-4.9 5.7c-.6 .6-1 1.1-1.3 1.4l-.3 .3c0 0 0 0 0 0c0 0 0 0 0 0s0 0 0 0s0 0 0 0c-4.6 4.6-5.9 11.4-3.4 17.4c2.5 6 8.3 9.9 14.8 9.9c28.7 0 57.6-8.9 81.6-19.3c22.9-10 42.4-21.9 54.3-30.6c31.8 11.5 67 17.9 104.1 17.9zM128 208a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm128 0a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm96 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"
                    />
                </svg>
            </button>
        </span>
        <!-- Tutor loading animation -->
        <div class="ai-tutor-processing mt-2" v-if="waitForAIresponse">
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
        <!-- Message thread -->
        <div
            class="d-flex my-3 messages w-100"
            :class="{
                'justify-content-end': message.role === 'user'
            }"
            v-for="message in messageList"
        >
            <!-- Student messages -->
            <div
                v-if="message.role === 'user'"
                class="border border-dark rounded p-2"
            >
                {{ message.content[0].text.value }}
            </div>
            <!-- AI tutor messages -->
            <div
                v-else-if="
                    message.role === 'assistant' &&
                    message.content[0].type == 'text'
                "
                class="tutor-conversation border border-dark rounded p-2"
                v-html="applyMarkDownFormatting(message.content[0].text.value)"
            ></div>
        </div>
    </div>
</template>

<style scoped>
.message-btn {
    height: 40px;
    width: 42px;
}

.messages {
    width: fit-content;
}

.chat-input {
    width: 100%;
    max-height: 600px;
}

/* Tutor loading animation */
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

/* Threads loading animation */
.spinning-loader {
    width: 36px;
    height: 36px;
    border: 5px solid var(--primary-color);
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    100% {
        transform: rotate(0deg);
    }
    0% {
        transform: rotate(360deg);
    }
}

.loading-animation {
    min-height: 100%;
}
/* End of loading animation */
</style>
