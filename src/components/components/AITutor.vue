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
            latestMessage: ''
        };
    },
    mounted() {
        console.log(this.userDetailsStore.userId);
        this.getMessagesList();
    },
    computed: {},
    methods: {
        SendMessage() {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: this.message,
                    userName: this.userDetailsStore.userName,
                    skillName: this.skillName
                })
            };
            var url = '/ai-tutor/new-message';
            fetch(url, requestOptions)
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    for (let i = 0; i < data.message.length; i++) {
                        console.log(data.message[i].content[0].text);
                        this.previousMessages.push(data.message[i]);
                    }
                });
        },
        async TestFunc() {
            try {
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
                console.log('I Can get data');
                this.latestMessage = resData.message;
                console.log(this.latestMessage);
            } catch (error) {
                console.error(error);
            }
        },
        async getMessagesList() {
            try {
                const url = `/ai-tutor/messages-list?userId=${this.userDetailsStore.userId}&skillUrl=${this.skillUrl}`;
                const response = await fetch(url);
                const resData = await response.json();
                console.log(resData);
            } catch (error) {
                console.error(error);
            }
        }
    }
};
</script>

<template>
    <div class="container mt-3">
        <h2 class="heading">Tutor</h2>
        <p>Type your question below.</p>
        <div class="row">
            <div class="mb-3">
                <div v-for="previousMessage in previousMessages">
                    <span v-if="(previousMessage.role = 'user')">You:</span>
                    <span v-else>Tutor:</span>
                    <div
                        class="tutor-conversation"
                        v-html="previousMessage.content[0].text.value"
                    ></div>
                    <hr />
                </div>
                <div class="tutor-conversation" v-html="latestMessage"></div>
                <hr />
                <div>{{ latestMessage }}</div>
            </div>
            <div class="mb-3">
                <textarea v-model="message" type="text" class="form-control" />
            </div>
            <button class="btn primary-btn" @click="SendMessage()">
                Submit
            </button>
            <button class="btn primary-btn" @click="TestFunc()">Test !!</button>
        </div>
    </div>
</template>

<style scoped>
.tutor-conversation {
    font-family: 'Poppins', sans-serif;
}
</style>
