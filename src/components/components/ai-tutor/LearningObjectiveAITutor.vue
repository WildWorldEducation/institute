<script>
import { socket, socketState } from '../../../socket.js';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';
import TutorLoadingSymbol from './tutorLoadingSymbol.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const stateOfSocket = socketState;
        return {
            userDetailsStore,
            stateOfSocket
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
            englishSkillLevel: '',
            threadID: '',
            isAudioPlaying: false,
            assistantData: null
        };
    },
    async mounted() {
        this.englishSkillLevel = this.skillLevel.replace('_', ' ');
        // load thread.
        await this.getMessages();
    },
    async created() {
        this.connectToSocketSever();
    },
    methods: {
        // Setting this method to allow the user to be able to create a new line with shift+enter
        handleKeyDown(e) {
            if (e.shiftKey) {
                return;
            }
            e.preventDefault();
            this.sendMessage();
        },
        // load thread
        async getMessages() {
            this.message = '';
            try {
                const url = `/ai-tutor/learning-objective/messages-list?userId=${encodeURIComponent(
                    this.userDetailsStore.userId
                )}&learningObjectiveId=${encodeURIComponent(
                    this.learningObjectiveId
                )}&learningObjective=${encodeURIComponent(
                    this.learningObjective
                )}&skillLevel=${encodeURIComponent(this.englishSkillLevel)}`;

                const response = await fetch(url);
                const resData = await response.json();

                this.messageList = resData.messages;
                this.assistantData = resData.assistantData;

                // Close loading animation
                this.isGotMessages = true;

                if (this.messageList.length > 0) {
                    this.threadID = this.messageList[0].thread_id;
                }

                this.$parent.checkTokenUsage();
            } catch (error) {
                console.error(error);
            }
        },

        async generateAudio(index, message) {
            // Loading animation on
            for (let i = 0; i < this.messageList.length; i++) {
                if (this.messageList[i].index == index) {
                    this.messageList[i].isAudioGenerating = true;
                }
            }

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    messageNumber: index,
                    threadID: this.threadID
                })
            };

            let url = `/ai-tutor/learning-objective/generate-tts`;

            const response = await fetch(url, requestOptions);
            const resData = await response.json();
            console.log(resData.status);

            // Loading animation off
            for (let i = 0; i < this.messageList.length; i++) {
                if (this.messageList[i].index == index) {
                    this.messageList[i].isAudioGenerating = false;
                    this.messageList[i].hasAudio = true;
                }
            }

            this.getMessages();
        },
        playAudio(index) {
            if (this.isAudioPlaying == true) {
                this.isAudioPlaying = false;
                this.audio.pause();
            } else {
                let url = `https://institute-learning-objective-tutor-tts-urls.s3.us-east-1.amazonaws.com/${this.threadID}-${index}.mp3`;
                this.audio = new Audio(url);
                this.isAudioPlaying = true;
                this.audio.play();
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
                // const requestOptions = {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify({
                //         learningObjective: this.learningObjective,
                //         learningObjectiveId: this.learningObjectiveId,
                //         userName: this.userDetailsStore.userName,
                //         userId: this.userDetailsStore.userId,
                //         skillName: this.skillName,
                //         skillLevel: this.englishSkillLevel,
                //         // Whatever the user typed.
                //         message: this.message
                //     })
                // };

                // var url = '/ai-tutor/learning-objective/new-message';
                // const res = await fetch(url, requestOptions);
                // if (res.status === 500) {
                //     alert('The tutor can`t answer !!');
                //     this.waitForAIresponse = false;
                //     return;
                // }

                const userMessage = {
                    role: 'user',
                    content: [{ text: { value: this.message } }]
                };

                this.messageList.unshift(userMessage);

                const messageData = {
                    threadId: this.assistantData.threadId,
                    assistantId: this.assistantData.assistantId,
                    message: this.message,
                    learningObjective: this.learningObjective,
                    userId: this.userDetailsStore.userId,
                    skillName: this.skillName,
                    skillLevel: this.englishSkillLevel
                };

                socket.emit('new-learning-objective-message', messageData);
                this.message = '';
            } catch (error) {
                console.error(error);
                this.waitForAIresponse = false;
            }
        },
        // ask Open AI to ask a question about the learning objective
        async requestTutoring() {
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

                var url = '/ai-tutor/learning-objective/request-tutoring';

                const res = await fetch(url, requestOptions);
                if (res.status === 500) {
                    alert('The tutor can`t answer !!');
                    this.waitForAIresponse = false;
                    return;
                }

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

                var url = '/ai-tutor/learning-objective/ask-question';

                const res = await fetch(url, requestOptions);
                if (res.status === 500) {
                    alert('The tutor can`t answer !!');
                    this.waitForAIresponse = false;
                    return;
                }

                this.getMessages();
                this.waitForAIresponse = false;
            } catch (error) {
                console.error(error);
                this.waitForAIresponse = false;
            }
        },
        // Format the response.
        applyMarkDownFormatting(string) {
            const md = window
                .markdownit({
                    breaks: true
                })
                .use(window.texmath, {
                    engine: katex,
                    delimiters: ['brackets', 'dollars'],
                    katexOptions: { macros: { '\\RR': '\\mathbb{R}' } }
                });

            // let newString = string.replace('\\[ ', '$');
            // newString = newString.replace(' \\]', '$');

            let formattedMessage = md.render(string);
            return formattedMessage;
        },
        connectToSocketSever() {
            socket.connect();
        },
        disconnectToSocketSever() {
            socket.disconnect();
        },
        removeStreamMessage() {
            // We dont want this to be watched and added to the chat history.
            socketState.streamType = 'pause';
            socketState.streamingMessage = '';
        }
    },
    watch: {
        stateOfSocket: {
            async handler(newItem, oldItem) {
                if (newItem.streamType !== 'learningObjective') {
                    return;
                }
                if (newItem.isStreaming) {
                    this.waitForAIresponse = false;
                }
                // Handle run just end case
                if (
                    !newItem.isStreaming &&
                    newItem.isRunJustEnded &&
                    this.assistantData.threadId == newItem.currentStreamThread
                ) {
                    const assistantMessage = {
                        role: 'assistant',
                        content: [
                            {
                                text: {
                                    value: this.stateOfSocket.streamingMessage
                                },
                                type: 'text'
                            }
                        ]
                    };

                    // Clear last message
                    this.removeStreamMessage();

                    this.messageList.unshift(assistantMessage);

                    // Reverse the messages to get the index, for the TTS feature
                    // (as Open AI returns the most recent message at index 0)
                    let reversedMessages = this.messageList.reverse();
                    for (let i = 0; i < reversedMessages.length; i++) {
                        reversedMessages[i].index = i;
                    }
                    this.messageList = reversedMessages.reverse();
                }
            },
            deep: true
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
        <!-- learning objective explanation button -->
        <!-- <div
            class="alert alert-warning mt-1"
            role="alert"
            v-if="$parent.isAITokenLimitReached"
        >
            You have reached your monthly AI token limit. Please recharge your
            subscription to use more.
        </div> -->
        <!-- Suggested interaction buttons -->
        <span class="d-flex justify-content-end mt-2">
            <button
                v-if="isGotMessages"
                class="btn border border-dark"
                @click="requestTutoring()"
                :disabled="$parent.isAITokenLimitReached"
            >
                tutor me on this
            </button>
            <!-- learning objective ask question button -->
            <button
                class="btn border border-dark ms-1"
                @click="requestQuestion()"
                :disabled="$parent.isAITokenLimitReached"
            >
                ask me a question
            </button>
        </span>
        <!-- text input -->
        <span class="d-flex mt-1">
            <textarea
                class="chat-input border border-dark rounded"
                v-model="message"
                type="text"
                @keydown.enter="handleKeyDown"
            />
            <button
                class="btn border border-dark ms-1 message-btn"
                @click="sendMessage()"
                :disabled="this.message == '' || this.message == ' '"
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
        <div class="d-flex flex-column mx-auto chat-component socratic-chat">
            <!-- Currently streaming message -->
            <div
                v-if="
                    stateOfSocket.isStreaming &&
                    stateOfSocket.streamType === 'learningObjective' &&
                    stateOfSocket.currentStreamThread == assistantData.threadId
                "
                class="d-flex my-3 tutor-conversation streamed-message p-2"
                v-html="applyMarkDownFormatting(stateOfSocket.streamingMessage)"
            ></div>
            <!-- Message thread -->
            <div
                class="d-flex my-3"
                :class="{
                    'justify-content-end': message.role === 'user'
                }"
                v-for="message in messageList"
            >
                <!-- Student messages -->
                <div v-if="message.role === 'user'" class="user-conversation">
                    <em>{{ message.content[0].text.value }}</em>
                </div>
                <!-- AI tutor messages -->
                <div
                    v-else-if="
                        message.role === 'assistant' &&
                        message.content[0].type == 'text'
                    "
                    class="tutor-conversation p-2"
                    v-html="
                        applyMarkDownFormatting(message.content[0].text.value)
                    "
                ></div>
                <!-- Generate / Play audio -->
                <!-- Loading animation -->
                <div
                    v-if="
                        message.isAudioGenerating &&
                        message.role === 'assistant'
                    "
                    class="d-flex"
                >
                    <span class="speech-loader"></span>
                </div>
                <button
                    v-else-if="
                        !message.hasAudio &&
                        !message.isAudioGenerating &&
                        message.role === 'assistant'
                    "
                    @click="
                        generateAudio(
                            message.index,
                            message.content[0].text.value
                        )
                    "
                    class="btn speechButton"
                >
                    generate speech
                </button>
                <button
                    v-else-if="
                        !message.isAudioGenerating &&
                        message.role === 'assistant'
                    "
                    @click="playAudio(message.index)"
                    class="btn speechButton"
                >
                    <svg
                        v-if="isAudioPlaying == false"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        fill="yellow"
                        height="18"
                        width="18"
                    >
                        <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                        <path
                            d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c7.6-4.2 16.8-4.1 24.3 .5l144 88c7.1 4.4 11.5 12.1 11.5 20.5s-4.4 16.1-11.5 20.5l-144 88c-7.4 4.5-16.7 4.7-24.3 .5s-12.3-12.2-12.3-20.9l0-176c0-8.7 4.7-16.7 12.3-20.9z"
                        />
                    </svg>
                    <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        fill="yellow"
                        height="18"
                        width="18"
                    >
                        <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                        <path
                            d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm192-96l128 0c17.7 0 32 14.3 32 32l0 128c0 17.7-14.3 32-32 32l-128 0c-17.7 0-32-14.3-32-32l0-128c0-17.7 14.3-32 32-32z"
                        />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Chat area */
.socratic-chat {
    background-color: #031e27;
    color: white;
}

.user-conversation {
    text-align: end;
}

/* Generate / Play speech */
/* Loading animation for generating speech audio*/
.speech-loader {
    width: 24px;
    height: 24px;
    border: 5px solid yellow;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
/* End of loading animation */

.speechButton {
    max-height: fit-content;
    color: yellow;
}

/* End of Generate / Play speech */

.message-btn {
    height: 40px;
    width: 42px;
}

.chat-component {
    overflow-x: hidden;
    padding: 5px 10px;
    border-radius: 15px;
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

.streamed-message {
    display: flex;
    flex-direction: column;
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
