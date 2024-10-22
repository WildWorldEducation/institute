<script>
export default {
    data() {
        return {
            email: '',
            isSubmitted: false,
            isSuccess: false,
            isError: false,
            isEmailValidated: false,
            isValidated: { email: false, emailFormat: false }
        };
    },

    methods: {
        ValidateEmail() {
            this.isValidated.email = true;
            this.isValidated.emailFormat = true;

            if (this.email == '' || this.email == null) {
                this.isValidated.email = false;
            } else if (
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.email)
            ) {
                this.isValidated.emailFormat = true;
            } else {
                this.isValidated.emailFormat = false;
            }
        },
        Submit() {
            if (!this.isValidated.email || !this.isValidated.emailFormat) {
                return;
            }

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
                    @blur="ValidateEmail"
                />
                <div v-if="!isValidated.email" class="form-validate">
                    please enter an email !
                </div>
                <div v-else-if="!isValidated.emailFormat" class="form-validate">
                    please enter a valid email !
                </div>
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

.form-validate {
    font-size: 0.75rem;
    color: red;
    font-weight: 300;
}
</style>
