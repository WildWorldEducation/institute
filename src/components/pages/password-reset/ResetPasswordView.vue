<script>
export default {
    data() {
        return {
            token: this.$route.params.token,
            password: '',
            isValid: false
        };
    },
    async created() {
        await this.CheckToken();
    },
    methods: {
        async CheckToken() {
            var url = '/password-reset/reset-password/' + this.token;

            fetch(url)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    if (data.status == 'Valid token') {
                        this.isValid = true;
                    } else {
                    }
                });
        },
        Submit() {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: this.token,
                    password: this.password
                })
            };
            var url = '/reset-password';

            fetch(url, requestOptions)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {});
        }
    }
};
</script>

<template>
    <div class="container">
        <form>
            <div v-if="isValid" class="form-group">
                <label for="exampleInputPassword1">Password</label>
                <input
                    type="password"
                    class="form-control"
                    id="exampleInputPassword1"
                    placeholder="Password"
                />
            </div>
            <p v-else>Token expired or not valid</p>

            <button type="submit" class="btn btn-primary" @click="Submit">
                Submit
            </button>
        </form>
    </div>
</template>

<style></style>
