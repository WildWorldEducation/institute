<script>
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';
import SendIconLoadingSymbol from './ai-tutor/sendIconLoadingSymbol.vue';
import TutorLoadingSymbol from './ai-tutor/tutorLoadingSymbol.vue';
import TooltipBtn from './share-components/TooltipBtn.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();

        return {
            userDetailsStore
        };
    },
    props: ['skillName', 'skillUrl'],
    components: { SendIconLoadingSymbol, TutorLoadingSymbol, TooltipBtn },
    data() {
        return {
            message: '',
            previousMessages: [],
            latestMessage: null,
            messageList: [],
            waitForAIresponse: false
        };
    },
    async mounted() {
        await this.getMessagesList();
    },
    updated() {
        this.scrollToMessageInput();
    },
    computed: {},
    methods: {
        async SendMessage() {
            this.waitForAIresponse = true;
            try {
                // Add user message to messages list
                const userMessage = {
                    role: 'user',
                    content: [{ text: { value: this.message } }]
                };
                this.messageList.push(userMessage);
                const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: this.message,
                        userName: this.userDetailsStore.userName,
                        userId: this.userDetailsStore.userId,
                        skillName: this.skillName,
                        skillUrl: this.skillUrl
                    })
                };
                var url = '/ai-tutor/new-message';
                const res = await fetch(url, requestOptions);
                const resData = await res.json();
                this.latestMessage = resData.message;
                this.messageList.push(this.latestMessage);
                this.waitForAIresponse = false;
            } catch (error) {
                console.error(error);
                this.waitForAIresponse = false;
            }
        },
        async getMessagesList() {
            try {
                const url = `/ai-tutor/messages-list?userId=${encodeURIComponent(
                    this.userDetailsStore.userId
                )}&skillUrl=${encodeURIComponent(this.skillUrl)}`;

                const response = await fetch(url);
                const resData = await response.json();
                this.messageList = resData.messages.data;
                // we reverse oder of messages list because OpenAI return messages from newest to oldest
                this.messageList.reverse();
                this.$nextTick(this.scrollToMessageInput());
            } catch (error) {
                console.error(error);
            }
        },
        // Because OpenAI return the content with it
        removeHTMLnotation(string) {
            let result = string.replace(/```html/g, '');
            result = result.replace(/```/g, '');
            return result;
        },
        scrollToMessageInput() {
            let inputMessage = this.$refs.messageInputDiv;
            inputMessage.scrollTop = inputMessage.scrollHeight;
        },
        smoothScrollToMessageInput() {
            let inputMessage = this.$refs.messageInputDiv;
            inputMessage.scrollIntoView({ behavior: 'smooth' });
        }
    },
    watch: {
        // Update text area height base on message input
        message: function (newItem, oldItem) {
            let { messageInput } = this.$refs;
            const lineHeightInPixels = 22;

            // Reset messageInput Height
            messageInput.setAttribute(
                `style`,
                `height:${lineHeightInPixels}px;overflow-y:hidden;`
            );

            // Calculate number of lines (soft and hard)
            const height = messageInput.style.height;
            const scrollHeight = messageInput.scrollHeight;
            messageInput.style.height = height;
            const count = Math.floor(scrollHeight / lineHeightInPixels);

            this.$nextTick(() => {
                messageInput.setAttribute(
                    `style`,
                    `height:${count * lineHeightInPixels}px;overflow-y:hidden;`
                );
                // Also scroll to bottom of the chat div
                this.scrollToMessageInput();
            });
        }
    }
};
</script>

<template>
    <div class="container mt-3">
        <div class="d-flex flex-column flex-md-row gap-2 align-items-baseline">
            <h2 class="heading">Learn With AI Tutor</h2>
            <TooltipBtn
                class="d-none d-md-block"
                toolTipText="Chat with ours AI Tutor about the subjects"
                bubbleWidth="350px"
                trianglePosition="left"
                absoluteTop="37px"
            />
            <!-- Mobile tooltip have smaller width -->
            <TooltipBtn
                class="d-md-none"
                toolTipText=" Chat with ours AI Tutor about the subjects"
                bubbleWidth="100px"
                trianglePosition="left"
                absoluteTop="37px"
            />
        </div>

        <hr />
        <div
            class="d-flex flex-column mx-auto chat-component"
            ref="messageInputDiv"
        >
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
            <div class="user-chat-div">
                <textarea
                    ref="messageInput"
                    class="chat-text-area"
                    v-model="message"
                    type="text"
                >
                </textarea>
                <div class="d-flex flex-row-reverse">
                    <button
                        class="btn primary-btn send-btn"
                        :class="{ 'loading-send-btn': waitForAIresponse }"
                        @click="SendMessage()"
                    >
                        <svg
                            v-if="!waitForAIresponse"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            height="18"
                            width="18"
                            fill="white"
                        >
                            <path
                                d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480l0-83.6c0-4 1.5-7.8 4.2-10.8L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z"
                            />
                        </svg>
                        <SendIconLoadingSymbol v-else width="20px" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.tutor-conversation {
    font-family: 'Poppins', sans-serif;
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

:deep(h1) {
    font-size: 20px !important;
}

:deep(h2) {
    font-size: 16px !important;
}

.chat-text-area {
    outline: none;
    border: 0px;
    width: 100%;
    max-height: 600px;
    resize: none;
}

.user-conversation {
    padding: 10px 15px;
    background-color: #f3f3f3;
    border-radius: 50px;
}

.chat-component {
    max-height: 100vh;
    overflow-y: auto;
    background-color: white;
    padding: 5px 10px;
    border-radius: 15px;
    width: 75%;
}

.user-chat-div {
    display: flex;
    flex-direction: column;
    gap: 3px;
    border-radius: 35px;
    border: 1px solid #e8e8e8;
    padding: 20px;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px,
        rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
}

.send-btn {
    height: fit-content;
    width: fit-content;
    border-radius: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.loading-send-btn {
    border-radius: 5px !important;
}

/* ************************* */
/* Tablet Styling */
@media (min-width: 577px) and (max-width: 1023px) {
    .chat-component {
        width: 95%;
    }
}

/* Small devices (portrait phones) */
@media (max-width: 480px) {
    .chat-component {
        width: 100%;
    }
}
</style>
