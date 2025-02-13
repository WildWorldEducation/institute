<script>
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();

        return {
            userDetailsStore
        };
    },
    props: ['skillName', 'skillUrl'],
    data() {
        return {
            message: '',
            previousMessages: [],
            latestMessage: '',
            messageList: []
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
            } catch (error) {
                console.error(error);
            }
        },
        async getMessagesList() {
            try {
                const url = `/ai-tutor/messages-list?userId=${this.userDetailsStore.userId}&skillUrl=${this.skillUrl}`;
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
                <button class="btn primary-btn" @click="SendMessage()">
                    Submit
                </button>
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
</style>
