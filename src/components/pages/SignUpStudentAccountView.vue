<script>
import router from '../../router';

export default {
    setup() {},
    data() {
        return {
            newStudent: {
                id: null,
                username: null,
                firstName: null,
                lastName: null,
                email: null,
                password: null
            },
            // Validate Object flag
            validate: {
                firstName: false,
                lastName: false,
                username: false,
                email: false,
                emailFormat: false,
                password: false
            },
            isProduction: import.meta.env.PROD
        };
    },
    async created() {},
    mounted() {
        // Load Google login button.
        let script = document.createElement('script');
        script.setAttribute('src', 'https://accounts.google.com/gsi/client');
        script.setAttribute('defer', '');
        document.head.appendChild(script);
    },
    methods: {
        ValidateForm() {
            if (
                this.newStudent.username == '' ||
                this.newStudent.username == null
            ) {
                this.validate.username = true;
            } else if (
                this.newStudent.firstName == '' ||
                this.newStudent.firstName == null
            ) {
                this.validate.firstName = true;
            } else if (
                this.newStudent.lastName == '' ||
                this.newStudent.lastName == null
            ) {
                this.validate.lastName = true;
            } else if (
                this.newStudent.email == '' ||
                this.newStudent.email == null
            ) {
                this.validate.email = true;
            } else if (
                this.newStudent.password == '' ||
                this.newStudent.password == null
            ) {
                this.validate.password = true;
            } else {
                this.Submit();
            }
        },
        ValidateEmail() {
            if (
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
                    this.newStudent.email
                )
            ) {
                this.validate.emailFormat = false;
            } else {
                this.validate.emailFormat = true;
            }
        },
        Submit() {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.newStudent.username,
                    first_name: this.newStudent.firstName,
                    last_name: this.newStudent.lastName,
                    email: this.newStudent.email,
                    password: this.newStudent.password
                })
            };
            var url = '/users/new-student/add';
            fetch(url, requestOptions)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    if (data.account == 'authorized') {
                        alert('Account created.');
                        router.push({ name: 'skills' });
                    } else if (data.account == 'username already taken') {
                        alert(data.account);
                    } else if (data.account == 'email already taken') {
                        alert(data.account);
                    }
                });
        }
    }
};
</script>

<template>
    <div class="signup-page">
        <div class="form-signin">
            <div class="text-center">
                <img
                    class="mb-4"
                    src="/images/logo-red.png"
                    alt=""
                    width="72"
                    height="72"
                />
            </div>
            <h1 class="h3 mb-3 font-weight-normal">Student Sign up</h1>

            <div class="mt-3">
                <div class="mb-3 text-start">
                    <!-- <label class="form-label">Username</label> -->
                    <input
                        v-model="newStudent.username"
                        type="text"
                        placeholder="Username"
                        class="form-control"
                        required
                    />
                    <div
                        v-if="
                            validate.username &&
                            (newStudent.username == '' ||
                                newStudent.username == null)
                        "
                        class="form-validate"
                    >
                        please enter a username!
                    </div>
                </div>
                <div class="mb-3 text-start">
                    <!-- <label class="form-label">First name</label> -->
                    <input
                        v-model="newStudent.firstName"
                        type="text"
                        placeholder="First name"
                        class="form-control"
                        required
                    />
                    <div
                        v-if="
                            validate.firstName &&
                            (newStudent.firstName == '' ||
                                newStudent.firstName == null)
                        "
                        class="form-validate"
                    >
                        please your first name!
                    </div>
                </div>
                <div class="mb-3 text-start">
                    <!-- <label class="form-label">Last name</label> -->
                    <input
                        v-model="newStudent.lastName"
                        type="text"
                        placeholder="Last name"
                        class="form-control"
                        required
                    />
                    <div
                        v-if="
                            validate.lastName &&
                            (newStudent.lastName == '' ||
                                newStudent.lastName == null)
                        "
                        class="form-validate"
                    >
                        please enter your last name!
                    </div>
                </div>
                <div class="mb-3 text-start">
                    <!-- <label class="form-label">Email</label> -->
                    <input
                        v-model="newStudent.email"
                        type="email"
                        placeholder="Email"
                        class="form-control"
                        @blur="ValidateEmail"
                        required
                    />
                    <div
                        v-if="
                            validate.email &&
                            (newStudent.email == '' || newStudent.email == null)
                        "
                        class="form-validate"
                    >
                        please enter an email address!
                    </div>
                    <div v-if="validate.emailFormat" class="form-validate">
                        please enter a valid email address!
                    </div>
                </div>
                <div class="mb-3 text-start">
                    <!-- <label class="form-label">Password</label> -->
                    <input
                        v-model="newStudent.password"
                        type="password"
                        placeholder="Password"
                        class="form-control"
                        required
                    />
                    <div
                        v-if="
                            validate.password &&
                            (newStudent.password == '' ||
                                newStudent.password == null)
                        "
                        class="form-validate"
                    >
                        please enter a password!
                    </div>
                </div>
                <button class="btn btn-dark mb-2" @click="ValidateForm()">
                    Sign up
                </button>
                <div
                    v-if="isProduction == true"
                    id="g_id_onload"
                    data-client_id="13191319610-qectaoi146ce1pm4v95jtgctsbtmqb3t.apps.googleusercontent.com"
                    data-context="signup"
                    data-ux_mode="popup"
                    data-login_uri="https://parrhesia.io/google-student-signup-attempt"
                    data-auto_prompt="false"
                ></div>
                <div
                    v-else
                    id="g_id_onload"
                    data-client_id="13191319610-qectaoi146ce1pm4v95jtgctsbtmqb3t.apps.googleusercontent.com"
                    data-context="signup"
                    data-ux_mode="popup"
                    data-login_uri="http://localhost:3000/google-student-signup-attempt"
                    data-auto_prompt="false"
                ></div>

                <div
                    class="g_id_signin"
                    data-type="standard"
                    data-shape="rectangular"
                    data-theme="outline"
                    data-text="signup_with"
                    data-size="large"
                    data-logo_alignment="left"
                    data-width="330"
                ></div>
                <div class="mt-3 signup text-center">
                    Have an account?
                    <a href="/login" class="links">Login</a>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.signup-page {
    height: 100%;
    padding: 10px;
    background-repeat: no-repeat;
    width: 100%;
    font-family: 'Inter', sans-serif;
}

.welcome-message {
    color: rgba(102, 112, 133, 1);
    font-size: 16px;
}

.password-extras {
    font-size: 14px;
    justify-content: space-between;
}

.signup {
    font-size: 14px;
    color: rgba(102, 112, 133, 1);
}

.links {
    color: rgba(164, 139, 229, 1);
    text-decoration: none;
}

/* Mobile */
@media (max-width: 480px) {
    .signup-page {
        background-image: url('/images/login-page.svg');
        background-size: contain;
        background-position: center bottom;
    }
}

/* Tablets */
@media (min-width: 481px) and (max-width: 1024px) {
    .signup-page {
        background-image: url('/images/login-page.svg');
        background-size: contain;
        background-position: center bottom;
    }
}

/* Desktops/laptops */
@media (min-width: 1025px) {
    .signup-page {
        background-image: url('/images/login-page.svg');
        background-size: cover;
        background-position: center bottom;
    }
}

.form-signin {
    background-color: white;
    width: 100%;
    width: 360px;
    padding: 15px;
    margin: 0 auto;
    /* border: 1px solid black; */
    border-radius: 25px;
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
}

.form-signin button {
    width: 100%;
    background-color: #a48be6;
    color: white;
    border: 1px solid #7f56d9;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
}

.form-validate {
    font-size: 0.75rem;
    color: red;
    font-weight: 300;
}
</style>
