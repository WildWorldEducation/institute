<script>
// Import

export default {
    data() {
        return {
            message: ''
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
                    message: this.message
                })
            };
            var url = '/ai-tutor';
            fetch(url, requestOptions)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    console.log(data);
                    for (let i = 0; i < data.message.length; i++) {
                        console.log(data.message[i].content[0].text.value);
                    }
                });
        }
    }
};
</script>

<template>
    <div class="container mt-3">
        <h2 class="heading">Tutor</h2>
        <div class="row">
            <div class="mb-3">
                <textarea v-model="message" type="text" class="form-control" />
            </div>
            <button class="btn primary-btn" @click="SendMessage()">
                Submit
            </button>
        </div>
    </div>
</template>

<style scoped></style>
