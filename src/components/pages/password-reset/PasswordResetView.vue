<script>
export default {
    data() {
        return {
            email: '',
            isSubmitted: false,
            isSuccess: false,
            isError: false,
            isEmailValidated: false,
            isValidated: { email: true, emailFormat: true },
            // check that user has tried to input something
            hasInput: false
        };
    },

    methods: {
        ValidateEmail() {
            this.hasInput = true;
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
            if (!this.hasInput) {
                this.ValidateEmail();
            }

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
                <button class="btn mt-2 purple-btn" @click="Submit">
                    Submit
                </button>
            </div>
            <div v-else>
                <div v-if="isSuccess">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="40"
                        height="40"
                        fill="#a48be6"
                    >
                        <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                        <path
                            d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"
                        />
                    </svg>
                    <h1 class="h4 mt-2" style="color: #a48be6">Email sent</h1>
                    <p>
                        Please check your email for instructions on resetting
                        your password.
                    </p>
                </div>
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

.purple-btn:active {
    background-color: #a48be6;
    color: white;
}

.form-validate {
    font-size: 0.75rem;
    color: red;
    font-weight: 300;
}
</style>
