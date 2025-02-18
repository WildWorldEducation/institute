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
            waitForAIresponse: false,
            mode: 'big'
        };
    },
    async mounted() {
        await this.getMessagesList();
    },
    updated() {
        if (this.mode !== 'hide') {
            this.scrollToMessageInput();
        }
    },
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
                this.message = '';
                const res = await fetch(url, requestOptions);
                if (res.status === 500) {
                    alert('Tutor can`t answer !!');
                    this.waitForAIresponse = false;
                    return;
                }
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
    <div
        v-if="mode !== 'hide'"
        :class="{
            'container mt-3': mode === 'big',
            'minimize-chat-container': mode === 'mini'
        }"
    >
        <div class="d-flex flex-column flex-md-row gap-2 align-items-baseline">
            <div class="d-flex flex-row w-100 justify-content-between">
                <div class="d-flex gap-2">
                    <h2 class="heading">Learn With AI Tutor</h2>
                    <TooltipBtn
                        v-if="mode === 'big'"
                        class="d-none d-md-block"
                        toolTipText="Chat with ours AI Tutor about the subjects"
                        bubbleWidth="350px"
                        trianglePosition="left"
                        absoluteTop="37px"
                    />
                    <!-- Mobile tooltip have smaller width -->
                    <TooltipBtn
                        v-if="mode === 'big'"
                        class="d-md-none"
                        toolTipText="Chat with ours AI Tutor about the subjects"
                        bubbleWidth="100px"
                        trianglePosition="left"
                        absoluteTop="37px"
                    />
                </div>
                <btn
                    v-if="mode === 'big'"
                    class="btn primary-btn pin-btn"
                    title="Minimize and Pin the chat"
                    b-tooltip.hover
                    @click="mode = 'mini'"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 384 512"
                        fill="white"
                        width="17"
                        height="17"
                    >
                        <path
                            d="M32 32C32 14.3 46.3 0 64 0L320 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-29.5 0 11.4 148.2c36.7 19.9 65.7 53.2 79.5 94.7l1 3c3.3 9.8 1.6 20.5-4.4 28.8s-15.7 13.3-26 13.3L32 352c-10.3 0-19.9-4.9-26-13.3s-7.7-19.1-4.4-28.8l1-3c13.8-41.5 42.8-74.8 79.5-94.7L93.5 64 64 64C46.3 64 32 49.7 32 32zM160 384l64 0 0 96c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-96z"
                        />
                    </svg>
                </btn>
                <div class="d-flex gap-2">
                    <div tile="Expand chat component" b-tooltip.hover>
                        <btn
                            v-if="mode === 'mini'"
                            class="symbol-btn"
                            @click="mode = 'big'"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                height="25"
                                width="25"
                                fill="#5f31dd"
                            >
                                <path
                                    d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm11.3-395.3l112 112c4.6 4.6 5.9 11.5 3.5 17.4s-8.3 9.9-14.8 9.9l-64 0 0 96c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-96-64 0c-6.5 0-12.3-3.9-14.8-9.9s-1.1-12.9 3.5-17.4l112-112c6.2-6.2 16.4-6.2 22.6 0z"
                                />
                            </svg>
                        </btn>
                    </div>
                    <div tile="Hide chat component" b-tooltip.hover>
                        <btn
                            v-if="mode === 'mini'"
                            class="symbol-btn"
                            @click="mode = 'hide'"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                fill="#5f31dd"
                                height="25"
                                width="25"
                            >
                                <path
                                    d="M256 0a256 256 0 1 0 0 512A256 256 0 1 0 256 0zM244.7 395.3l-112-112c-4.6-4.6-5.9-11.5-3.5-17.4s8.3-9.9 14.8-9.9l64 0 0-96c0-17.7 14.3-32 32-32l32 0c17.7 0 32 14.3 32 32l0 96 64 0c6.5 0 12.3 3.9 14.8 9.9s1.1 12.9-3.5 17.4l-112 112c-6.2 6.2-16.4 6.2-22.6 0z"
                                />
                            </svg>
                        </btn>
                    </div>
                </div>
            </div>
        </div>
        <hr />
        <div
            class="d-flex flex-column mx-auto chat-component"
            :class="{
                'chat-component': mode === 'big',
                'mini-chat-component': mode === 'mini'
            }"
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

            <div :class="'user-chat-div'" v-if="mode === 'big'">
                <textarea
                    ref="messageInput"
                    class="chat-text-area"
                    v-model="message"
                    type="text"
                >
                </textarea>
                <div
                    b-tooltip.hover
                    tile="send message"
                    class="d-flex flex-row-reverse"
                >
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
        <div :class="'mini-user-chat-div'" v-if="mode === 'mini'">
            <textarea
                ref="messageInput"
                class="chat-text-area"
                v-model="message"
                type="text"
            >
            </textarea>
            <div
                b-tooltip.hover
                tile="send message"
                class="d-flex flex-row-reverse"
            >
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
    <!-- Tutor Symbol -->
    <div class="hidden-chat-symbol" v-else @click="mode = 'mini'">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            fill="white"
            width="26"
            height="26"
        >
            <path
                d="M256 448c141.4 0 256-93.1 256-208S397.4 32 256 32S0 125.1 0 240c0 45.1 17.7 86.8 47.7 120.9c-1.9 24.5-11.4 46.3-21.4 62.9c-5.5 9.2-11.1 16.6-15.2 21.6c-2.1 2.5-3.7 4.4-4.9 5.7c-.6 .6-1 1.1-1.3 1.4l-.3 .3c0 0 0 0 0 0c0 0 0 0 0 0s0 0 0 0s0 0 0 0c-4.6 4.6-5.9 11.4-3.4 17.4c2.5 6 8.3 9.9 14.8 9.9c28.7 0 57.6-8.9 81.6-19.3c22.9-10 42.4-21.9 54.3-30.6c31.8 11.5 67 17.9 104.1 17.9zM128 208a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm128 0a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm96 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"
            />
        </svg>
    </div>
    <h1>{{ mode }}</h1>
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

.mini-chat-component {
    width: 103%;
    height: 80%;
    overflow-y: auto;
}

.mini-user-chat-div {
    position: fixed;
    width: 360px;
    bottom: 15px;
    display: flex;
    flex-direction: row;
    background-color: white;
    margin-top: 20px;
    padding: 10px 15px;
    border-top: #c8cccc 1px solid;
}

.user-chat-div {
    position: sticky;
    bottom: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
    border-radius: 35px;
    border: 1px solid #e8e8e8;
    padding: 20px;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px,
        rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
    background-color: white;
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

.minimize-chat-container {
    position: fixed;
    z-index: 10000;
    bottom: 10px;
    right: 40px;
    width: 380px;
    height: 600px;
    background-color: white !important;
    border-radius: 15px;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px,
        rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
    padding-top: 15px;
}

.symbol-btn {
    cursor: pointer;
}

.pin-btn {
    margin-right: 4px;
    margin-left: auto;
}

.hidden-chat-symbol {
    position: fixed;
    z-index: 10000;
    bottom: 12px;
    right: 30px;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    gap: 5px;
    background-color: var(--primary-color);
    width: fit-content;
    padding: 16px;
    border-radius: 50px;
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
