<script>
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();

        return {
            userDetailsStore
        };
    },
    props: ['skillName'],
    data() {
        return {
            message: '',
            previousMessages: []
        };
    },
    mounted() {},
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
            var url = '/ai-tutor';
            fetch(url, requestOptions)
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    console.log(data);
                    for (let i = 0; i < data.message.length; i++) {
                        console.log(data.message[i].content[0].text);
                        this.previousMessages.push(data.message[i]);
                    }
                });
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
            </div>
            <div class="mb-3">
                <textarea v-model="message" type="text" class="form-control" />
            </div>
            <button class="btn primary-btn" @click="SendMessage()">
                Submit
            </button>
        </div>
    </div>
</template>

<style scoped>
.tutor-conversation {
    font-family: 'Poppins', sans-serif;
}
</style>
