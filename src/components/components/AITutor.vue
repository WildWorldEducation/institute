<script>
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';
import SendIconLoadingSymbol from './ai-tutor/sendIconLoadingSymbol.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();

        return {
            userDetailsStore
        };
    },
    props: ['skillName', 'skillUrl'],
    components: { SendIconLoadingSymbol },
    data() {
        return {
            message: '',
            previousMessages: [],
            latestMessage: '',
            messageList: [],
            waitForAIresponse: false
        };
    },
    mounted() {
        console.log(this.userDetailsStore.userId);
        this.getMessagesList();
    },
    computed: {},
    methods: {
        // SendMessage() {
        //     const requestOptions = {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({
        //             message: this.message,
        //             userName: this.userDetailsStore.userName,
        //             skillName: this.skillName
        //         })
        //     };
        //     var url = '/ai-tutor/new-message';
        //     fetch(url, requestOptions)
        //         .then((response) => {
        //             return response.json();
        //         })
        //         .then((data) => {
        //             for (let i = 0; i < data.message.length; i++) {
        //                 console.log(data.message[i].content[0].text);
        //                 this.previousMessages.push(data.message[i]);
        //             }
        //         });
        // },
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
                console.log('url to send: ');
                console.log(url);
                const response = await fetch(url);
                const resData = await response.json();
                this.messageList = resData.messages.data;
                // we reverse oder of messages list because OpenAI return messages from newest to oldest
                this.messageList.reverse();
                console.log(this.messageList);
            } catch (error) {
                console.error(error);
            }
        },
        // Because OpenAI return the content with it
        removeHTMLnotation(string) {
            let result = string.replace(/```html/g, '');
            result = result.replace(/```/g, '');
            return result;
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
            });
        }
    }
};
</script>

<template>
    <div class="container mt-3">
        <h2 class="heading">Tutor</h2>
        <hr />
        <div class="d-flex flex-column w-50 mx-auto chat-component">
            <div
                class="d-flex my-3"
                :class="{ 'flex-row-reverse': message.role === 'user' }"
                v-for="message in messageList"
            >
                <div v-if="message.role === 'user'" class="user-conversation">
                    {{ message.content[0].text.value }}
                </div>
                <div
                    v-else
                    class="tutor-conversation"
                    v-html="removeHTMLnotation(message.content[0].text.value)"
                ></div>
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
                        @click="SendMessage()"
                    >
                        <svg
                            v-if="!waitForAIresponse"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            height="15"
                            width="15"
                            fill="white"
                        >
                            <path
                                d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480l0-83.6c0-4 1.5-7.8 4.2-10.8L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z"
                            />
                        </svg>
                        <SendIconLoadingSymbol v-else />
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

:deep(h1) {
    font-size: 20px !important;
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
}

.user-chat-div {
    display: flex;
    flex-direction: column;
    gap: 3px;
    border-radius: 35px;
    border: 1px solid #e8e8e8;
    padding: 20px;
}

.send-btn {
    border-radius: 50px;
}
</style>
