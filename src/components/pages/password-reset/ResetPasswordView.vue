<script>
export default {
    data() {
        return {};
    },

    async mounted() {},
    methods: {
        Submit() {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: this.email
                })
            };
            var url = '/password-reset/forgot-password';

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
            <label for="exampleInputEmail1">Email address</label>
            <input
                type="email"
                class="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
                placeholder="Enter email"
                v-model="email"
            />
            <small id="emailHelp" class="form-text text-muted"
                >We'll never share your email with anyone else.</small
            >
        </div>
        <button type="submit" class="btn btn-primary" @click="Submit">
            Submit
        </button>
    </form>
</template>

<style></style>
