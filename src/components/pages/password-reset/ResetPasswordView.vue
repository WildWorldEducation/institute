<script>
export default {
    data() {
        return {
            token: this.$route.params.token,
            password: ''
        };
    },

    async mounted() {},
    methods: {
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
    <form>
        <div class="form-group">
            <label for="exampleInputPassword1">Password</label>
            <input
                type="password"
                class="form-control"
                id="exampleInputPassword1"
                placeholder="Password"
            />
        </div>

        <button type="submit" class="btn btn-primary" @click="Submit">
            Submit
        </button>
    </form>
</template>

<style></style>
