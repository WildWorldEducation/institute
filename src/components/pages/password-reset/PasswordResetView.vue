<script>
export default {
    data() {
        return {
            email: '',
            isSubmitted: false,
            isSuccess: false,
            isError: false
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
                    this.isSubmitted = true;
                    if (data.status == 'success') {
                        this.isSuccess = true;
                    } else if (data.status == 'not found') {
                        this.isError = true;
                    }
                });
        }
    }
};
</script>

<template>
    <div class="container">
        <div class="center">
            <div v-if="!isSubmitted" class="form-group">
                <p>
                    Enter your email and we'll send you a link to reset your
                    password.
                </p>
                <input
                    type="email"
                    class="form-control password-email"
                    aria-describedby="emailHelp"
                    placeholder="Enter email"
                    v-model="email"
                />
                <button class="btn btn-primary mt-2 purple-btn" @click="Submit">
                    Submit
                </button>
            </div>
            <div v-else>
                <p v-if="isSuccess">
                    Please check your email for instructions on resetting your
                    password.
                </p>
                <p v-else-if="isError">
                    Email address not found. Please contact
                    support@collinsinstitute.org if you need assistance.
                </p>
            </div>
        </div>
    </div>
</template>

<style>
.center {
    max-width: fit-content;
    margin-left: auto;
    margin-right: auto;
    margin-top: 15%;
}

.password-email {
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
