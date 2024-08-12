<script>
import router from '../../router';
import CheckPasswordComplexity from '../components/CheckPasswordComplexity.vue';
export default {
    setup() {},
    components: {
        CheckPasswordComplexity
    },
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
                password: false,
                // flag to make sure password is complex enough it will be check in child component
                passwordComplex: false
            },
            passwordVisible: false,
            // For Google sign up absolute API url.
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
            }
            // After all check pass we see if the password is complex enough
            else if (this.validate.passwordComplex) {
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
                        router.push({ name: 'vertical-tree' });
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
                    <div class="password-div">
                        <input
                            v-model="newStudent.password"
                            :type="passwordVisible ? 'text' : 'password'"
                            placeholder="Password"
                            class="form-control"
                            required
                        />
                        <!-- Show and Hide Password Section -->
                        <div
                            class="eye-icon"
                            b-tooltip.hover
                            :title="
                                passwordVisible
                                    ? 'hide password'
                                    : 'show password'
                            "
                        >
                            <!-- Eye Icon -->
                            <svg
                                v-if="passwordVisible"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 576 512"
                                width="20"
                                height="20"
                                fill="gray"
                                @click="passwordVisible = false"
                            >
                                <path
                                    d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"
                                />
                            </svg>
                            <!-- Eye Slash Icon -->
                            <svg
                                v-else
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 640 512"
                                width="20"
                                height="20"
                                fill="gray"
                                @click="passwordVisible = true"
                            >
                                <path
                                    d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 97.7 269.5 80 320 80c65.2 0 118.8 29.6 159.9 67.7C518.4 183.5 545 226 558.6 256c-12.6 28-36.6 66.8-70.9 100.9l-53.8-42.2c9.1-17.6 14.2-37.5 14.2-58.7c0-70.7-57.3-128-128-128c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1zM394.9 284.2l-81.5-63.9c4.2-8.5 6.6-18.2 6.6-28.3c0-5.5-.7-10.9-2-16c.7 0 1.3 0 2 0c44.2 0 80 35.8 80 80c0 9.9-1.8 19.4-5.1 28.2zm51.3 163.3l-41.9-33C378.8 425.4 350.7 432 320 432c-65.2 0-118.8-29.6-159.9-67.7C121.6 328.5 95 286 81.4 256c8.3-18.4 21.5-41.5 39.4-64.8L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5zm-88-69.3L302 334c-23.5-5.4-43.1-21.2-53.7-42.3l-56.1-44.2c-.2 2.8-.3 5.6-.3 8.5c0 70.7 57.3 128 128 128c13.3 0 26.1-2 38.2-5.8z"
                                />
                            </svg>
                        </div>
                    </div>
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
                    <CheckPasswordComplexity :formData="newStudent" />
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

.password-div {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
}

.eye-icon {
    position: absolute;
    right: 20px;
}

.eye-icon:hover {
    cursor: pointer;
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
