<script>
export default {
    data() {
        return {
            email: '',
            isSubmitted: false
        };
    },

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
                .then((data) => {
                    if (data.status == 'success') {
                        this.isSubmitted = true;
                    }
                });
        }
    }
};
</script>

<template>
    <div class="container">
        <div v-if="!isSubmitted" class="form-group">
            <input
                type="email"
                class="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
                placeholder="Enter email"
                v-model="email"
            />
            <button class="btn btn-primary mt-2" @click="Submit">Submit</button>
        </div>
        <p v-else>
            Please check your email for instructions on resetting your password.
        </p>
    </div>
</template>

<style></style>
