<script>
// Import
import CheckPasswordComplexity from '../../components/CheckPasswordComplexity.vue';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    data() {
        return {
            user: {
                role: 'instructor'
            },
            instructors: [],
            // show/hide password flag
            passwordVisible: false,
            // Validate Object flag
            validate: {
                username: false,
                email: false,
                emailFormat: false,
                password: false,
                passwordComplex: false
            },

            // For the loading animation.
            isLoading: false
        };
    },
    components: {
        CheckPasswordComplexity
    },
    async created() {},
    methods: {
        async ValidateForm() {
            if (
                this.user.username == '' ||
                this.user.username == null ||
                this.user.username == this.userDetailsStore.userName
            ) {
                this.validate.username = true;
                return;
            } else if (this.user.email == '' || this.user.email == null) {
                this.validate.email = true;
            } else if (this.validate.passwordComplex) {
                this.Submit();
            }
        },
        ValidateEmail() {
            if (
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
                    this.user.email
                )
            ) {
                this.validate.emailFormat = false;
            } else {
                this.validate.emailFormat = true;
            }
        },
        async Submit() {
            try {
                this.isLoading = true;
                const response = await fetch('/users/add-teacher', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: this.user.username,
                        password: this.user.password,
                        tenant_id: this.userDetailsStore.tenantId,
                        role: 'instructor',
                        email: this.user.email
                    })
                });

                const data = await response.json();
                this.isLoading = false;
                if (data.account === 'username already taken') {
                    alert(data.account);
                    return;
                } else if (data.account == 'email already taken') {
                    alert(data.account);
                    return;
                }

                this.isLoading = false;
                alert('account created');
                this.$router.push({ name: 'teachers' });
            } catch (err) {
                console.error('Error creating user ', err);
            }
        }
    }
};
</script>

<template>
    <!-- Loading animation -->
    <div
        v-if="isLoading == true"
        class="loading-animation d-flex justify-content-center align-items-center py-4"
    >
        <span class="loader"></span>
    </div>
    <!-- Form -->
    <div v-else class="container rounded bg-light p-3">
        <h1 class="heading">Add Teacher</h1>
        <div class="main-content-container container-fluid p-4">
            <div class="row">
                <div class="col-lg-4">
                    <div class="mb-3">
                        <h2 class="secondary-heading h4">Username</h2>
                        <input
                            v-model="user.username"
                            type="text"
                            class="form-control"
                            @blur="validate.username = !user.username"
                        />
                        <div
                            v-if="
                                validate.username &&
                                (user.username == '' || user.username == null)
                            "
                            class="form-validate"
                        >
                            Please enter a username!
                        </div>
                        <div
                            v-if="user.username == userDetailsStore.userName"
                            class="form-validate"
                        >
                            Please use a different username!
                        </div>
                    </div>
                    <div class="mb-3">
                        <h2 class="secondary-heading h4">Email address</h2>
                        <input
                            v-model="user.email"
                            type="email"
                            class="form-control"
                            @blur="ValidateEmail"
                        />
                        <div
                            v-if="
                                validate.email &&
                                (user.email == '' || user.email == null)
                            "
                            class="form-validate"
                        >
                            please enter an email address!
                        </div>
                        <div v-if="validate.emailFormat" class="form-validate">
                            please enter a valid email address!
                        </div>
                    </div>
                    <!-- Password Section -->
                    <div class="mb-3">
                        <h2 class="secondary-heading h4">Password</h2>
                        <div class="password-div">
                            <input
                                v-model="user.password"
                                :type="passwordVisible ? 'text' : 'password'"
                                placeholder="Password"
                                class="form-control"
                                id="password-input"
                                autocomplete="new-password"
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
                                (user.password == '' || user.password == null)
                            "
                            class="form-validate"
                        >
                            please enter a password!
                        </div>
                        <CheckPasswordComplexity :formData="user" />
                    </div>
                    <div class="d-flex justify-content-end gap-4">
                        <router-link class="btn red-btn" to="/teachers">
                            Cancel
                        </router-link>
                        <button class="btn primary-btn" @click="ValidateForm()">
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Loading animation */
.loader {
    width: 48px;
    height: 48px;
    border: 5px solid var(--primary-color);
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    100% {
        transform: rotate(0deg);
    }
    0% {
        transform: rotate(360deg);
    }
}

.loading-animation {
    min-height: 100%;
    position: fixed;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
}
/* End of loading animation */

.form-control:focus {
    border-color: white;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
        0 0 12px var(--primary-color);
}

.form-select {
    cursor: pointer;
}

.form-select:focus {
    border-color: white;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
        0 0 12px var(--primary-color);
}

.form-custom-option:active {
    background-color: var(--primary-color);
}

.main-content-container {
    background-color: #e4ecf4;
    border-radius: 12px;
}

.form-label {
    color: #344054;
    font-family: 'Poppins' sans-serif;
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: 0em;
    text-align: left;
}

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    line-height: 24px;
    display: flex;
    align-items: center;
    height: auto;
    width: fit-content;
}

.green-btn:hover {
    background-color: #3eb3a3;
}

/* Style For The Custom Select */
.custom-select-button {
    width: 100%;
    height: auto;
    padding: 6px 14px 6px 14px;
    border-radius: 8px;
    gap: 8px;
    background: linear-gradient(0deg, #ffffff, #ffffff),
        linear-gradient(0deg, #f2f4f7, #f2f4f7);
    border: 1px solid #f2f4f7;
    box-shadow: 0px 1px 2px 0px #1018280d;
    font-family: 'Poppins' sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0.03em;
    text-align: left;
    display: flex;
}

.custom-select-button-focus {
    width: 100%;
    height: auto;
    padding: 6px 14px 6px 14px;
    border-radius: 8px;
    gap: 8px;
    background: linear-gradient(0deg, #ffffff, #ffffff),
        linear-gradient(0deg, #f2f4f7, #f2f4f7);
    border: 1px solid var(--primary-color);
    box-shadow: 0px 0px 0px 4px #bca3ff4d;
    font-family: 'Poppins' sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0.03em;
    text-align: left;
    display: flex;
}

.custom-select-button:hover {
    cursor: pointer;
    border: 1px solid var(--primary-color);
}

.custom-select-button > span {
    margin-right: 2px;
    margin-left: auto;
    animation: rotationBack 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

.custom-select-button-focus > span {
    margin-right: 2px;
    margin-left: auto;
    animation: rotation 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

.form-validate {
    font-size: 0.75rem;
    color: red;
    font-weight: 300;
}

.custom-select-button-focus:hover {
    cursor: pointer;
}

.custom-dropdown-base {
    border-radius: 8px;
    border: 1px;
    background: linear-gradient(0deg, #ffffff, #ffffff);
    border: 1px solid var(--primary-color);
    box-shadow: 0px 4px 6px -2px #10182808;
    box-shadow: 0px 12px 16px -4px #10182814;
}

.custom-dropdown-option {
    padding: 10px 14px 10px 14px;
    gap: 8px;
    color: #344054;
}

.custom-dropdown-option:hover {
    cursor: pointer;
    background: #bca3ff1a;
}

/* End of CSS style for Custom Select */
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
/* Styling for crop modal */
/* The Warning Modal */
.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 1;
    /* Sit on top */
    left: 0;
    top: 0;
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    overflow: auto;
    /* Enable scroll if needed */
    background-color: rgba(255, 255, 255, 0.459);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
}

.modal-content {
    background-color: #fefefe;
    margin: 5% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    /* Could be more or less, depending on screen size */
    width: 80%;
    height: 75%;
}

.modal-message {
    font-size: 20px;
    font-weight: 500;
    color: var(--primary-color);
}
/* ======== End Of Desktop Styling =========*/

/* Mobile */
@media (max-width: 480px) {
    .modal-content {
        width: 100%;
        height: 100%;
        padding: 3px;
        margin: 0% auto;
        background-color: white;
    }
}

/** Tablet */
@media (min-width: 481px) and (max-width: 991px) {
    .modal-content {
        margin: 15% 0%;
        width: 100%;
    }
}
</style>
