<script>
export default {
    data() {
        return {
            token: this.$route.params.token,
            password: '',
            isValid: false,
            isComplete: false,
            message: ''
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
                    if (data.status == 'valid') {
                        this.isValid = true;
                    } else {
                        console.log('Expired or invalid token.');
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
            var url = '/password-reset/reset-password';

            fetch(url, requestOptions)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    if (data.status == 'Password updated successfully') {
                        this.message = 'Password updated successfully';
                    } else if (data.status == 'Invalid or expired token') {
                        this.message = 'Invalid or expired token';
                    } else {
                        this.message =
                            'Problem updating password. Please try again later.';
                    }
                    this.isComplete = true;
                });
        }
    }
};
</script>

<template>
    <div class="container">
        <div v-if="!isComplete">
            <h1 class="header-title mb-2">Choose new password</h1>
            <div v-if="isValid" class="form-group">
                <input
                    type="password"
                    class="form-control password-input"
                    placeholder="Password"
                    v-model="password"
                />
                <button class="btn btn-primary mt-2 purple-btn" @click="Submit">
                    Submit
                </button>
            </div>
            <p v-else>Token expired or not valid. Please try again.</p>
        </div>
        <div v-else>{{ this.message }}</div>
    </div>
</template>

<style>
.header-title {
    color: #a48be6;
    font-family: 'Poppins' sans-serif;
    font-size: 2.375rem;
    font-weight: 900;
    line-height: 41px;
    letter-spacing: 0em;
    text-align: left;
    margin-top: auto;
    margin-bottom: 0px;
}

.password-input {
    max-width: 500px;
}

.purple-btn {
    background-color: #a48be6;
    color: white;
    border: 1px solid #7f56d9;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
}

.purple-btn:hover {
    background-color: #a48be6;
    color: white;
}
</style>
