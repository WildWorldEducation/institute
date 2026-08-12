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
            newUser: {
                id: null,
                username: null,
                email: null,
                password: null,
                accountType: 'student',
                skillTreeGradeLevel: 'phd'
            },
            // Validate Object flag
            validate: {
                username: false,
                email: false,
                emailFormat: false,
                password: false,
                // flag to make sure password is complex enough it will be check in child component
                passwordComplex: false
            },
            passwordVisible: false,
            // For Google sign up absolute API url.
            isProduction: import.meta.env.PROD,
            // The intro video is opt-in (a button opens it), never a popup.
            showVideoModal: false,
            isMobileCheck: window.innerWidth,
            referrer: '',
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)')
                .matches
        };
    },
    async created() {
        const urlParams = new URLSearchParams(window.location.search);
        this.referrer = urlParams.get('ref');
    },
    mounted() {
        // Load Google login button.
        let script = document.createElement('script');
        script.setAttribute('src', 'https://accounts.google.com/gsi/client');
        script.setAttribute('defer', '');
        script.onload = this.initializeGoogleSignIn;
        document.head.appendChild(script);

        document.addEventListener('keydown', this.handleKeyPress);
    },
    unmounted() {
        document.removeEventListener('keydown', this.handleKeyPress);
    },
    methods: {
        ValidateForm() {
            if (this.newUser.username == '' || this.newUser.username == null) {
                this.validate.username = true;
            } else if (this.newUser.email == '' || this.newUser.email == null) {
                this.validate.email = true;
            } else if (
                this.newUser.password == '' ||
                this.newUser.password == null
            ) {
                this.validate.password = true;
            }
            // After all checks passed we see if the password is complex enough
            else if (this.validate.passwordComplex) {
                this.Submit();
            }
        },
        ValidateEmail() {
            if (
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
                    this.newUser.email
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
                    username: this.newUser.username,
                    first_name: '',
                    last_name: '',
                    email: this.newUser.email,
                    password: this.newUser.password,
                    account_type: this.newUser.accountType,
                    grade_filter: this.newUser.skillTreeGradeLevel,
                    referrer_username: this.referrer
                })
            };
            var url = '/users/new-user/add';
            fetch(url, requestOptions)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    if (data.account == 'authorized') {
                        alert('Account created.');
                        if (this.isMobileCheck < 576) {
                            router.push({ name: 'search' });
                        } else router.push({ name: 'skill-tree' });
                    } else if (data.account == 'username already taken') {
                        alert(data.account);
                    } else if (data.account == 'email already taken') {
                        alert(data.account);
                    }
                });
        },
        initializeGoogleSignIn() {
            const clientId =
                '13191319610-qectaoi146ce1pm4v95jtgctsbtmqb3t.apps.googleusercontent.com'; // Replace with your actual client ID

            // Initialize Google Sign-In
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: this.handleCredentialResponse
            });

            // Render the Google Sign-In button
            window.google.accounts.id.renderButton(
                this.$refs.googleSignInButton,
                {
                    theme: 'outline',
                    size: 'large',
                    width: '330',
                    type: 'standard',
                    shape: 'rectangular',
                    logo_alignment: 'left'
                }
            );
        },
        handleCredentialResponse(response) {
            // Check if mobile device
            // (Different landing page for mobile)
            let deviceType = '';
            if (this.isMobileCheck < 576) {
                deviceType = 'mobile';
            } else deviceType = 'not-mobile';
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `${
                this.isProduction
                    ? 'https://parrhesia.io'
                    : 'http://localhost:3000'
            }/google-student-signup-attempt?accountType=${
                this.newUser.accountType
            }&deviceType=${deviceType}&referrerUsername=${this.referrer}`;

            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'credential';
            input.value = response.credential;
            form.appendChild(input);

            document.body.appendChild(form);

            form.submit();
        },
        // New method to handle Enter key press
        handleKeyPress(event) {
            if (event.key === 'Enter' && !this.showVideoModal) {
                this.ValidateForm();
            } else if (event.key === 'Escape') {
                this.showVideoModal = false;
            }
        },
        clearError(field) {
            if (this.validate[field]) {
                this.validate[field] = false;
            }
        }
    }
};
</script>

<template>
    <div class="signup-page">
        <!-- Observatory backdrop — the signup page's own "first step" scene -->
        <video
            v-if="!reducedMotion && isMobileCheck >= 800"
            class="bg-media"
            autoplay
            muted
            loop
            playsinline
            poster="/images/landing/signup-hero.webp"
            aria-hidden="true"
        >
            <source
                src="/images/landing/signup-hero-loop.mp4"
                type="video/mp4"
            />
        </video>
        <img
            v-else
            class="bg-media"
            src="/images/landing/signup-hero.webp"
            alt=""
            aria-hidden="true"
        />
        <div class="bg-scrim" aria-hidden="true"></div>

        <div class="signup-header">
            <p class="signup-kicker">Parrhesia &middot; The Collins Institute</p>
            <h1 class="signup-title">
                Begin your <span class="signup-title-glow">climb</span>
            </h1>
        </div>

        <!-- Opt-in intro video (never a popup) -->
        <button class="watch-intro-btn" @click="showVideoModal = true">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 384 512"
                width="12"
                height="12"
                fill="currentColor"
                aria-hidden="true"
            >
                <path
                    d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"
                />
            </svg>
            Watch the 2-minute intro
        </button>

        <!-- The form -->
        <div class="form-signin mt-3">
            <div>
                <div class="mb-3 text-start">
                    <!-- <label class="form-label">Username</label> -->
                    <input
                        v-model="newUser.username"
                        type="text"
                        placeholder="Username"
                        class="form-control"
                        required
                        @input="clearError('username')"
                    />
                    <div
                        v-if="
                            validate.username &&
                            (newUser.username == '' || newUser.username == null)
                        "
                        class="form-validate"
                    >
                        please enter a username!
                    </div>
                </div>
                <div class="mb-3 text-start">
                    <input
                        v-model="newUser.email"
                        type="email"
                        placeholder="Email"
                        class="form-control"
                        @blur="ValidateEmail"
                        required
                        @input="clearError('email')"
                    />
                    <div
                        v-if="
                            validate.email &&
                            (newUser.email == '' || newUser.email == null)
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
                    <div class="password-div">
                        <input
                            id="password-input"
                            v-model="newUser.password"
                            :type="passwordVisible ? 'text' : 'password'"
                            placeholder="Password"
                            class="form-control"
                            autocomplete="new-password"
                            required
                            @input="clearError('password')"
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
                            (newUser.password == '' || newUser.password == null)
                        "
                        class="form-validate"
                    >
                        please enter a password!
                    </div>
                    <CheckPasswordComplexity :formData="newUser" />
                </div>

                <!-- Grade level -->
                <div
                    v-if="newUser.accountType == 'student'"
                    class="mb-3 text-start"
                >
                    <select
                        class="form-select"
                        v-model="newUser.skillTreeGradeLevel"
                        @keypress="handleKeyPress"
                    >
                        <option selected value="phd">Choose your level</option>
                        <option value="grade_school">Grade School</option>
                        <option value="middle_school">Middle School</option>
                        <option value="high_school">High School</option>
                        <option value="college">College</option>
                        <option value="phd">PHD</option>
                    </select>
                </div>

                <button class="btn btn-dark mb-2" @click="ValidateForm()">
                    Register
                </button>
                <div ref="googleSignInButton"></div>
                <div class="mt-3 signup text-center">
                    Have an account?
                    <a href="/login" class="links">Sign in</a>
                </div>
                <div class="mt-1 signup text-center">
                    Teaching a class?
                    <RouterLink to="/instructor-signup" class="links">
                        Instructor sign-up
                    </RouterLink>
                </div>
            </div>
        </div>
    </div>

    <!-- Opt-in intro video modal -->
    <div v-if="showVideoModal">
        <div id="myModal" class="modal" @click.self="showVideoModal = false">
            <!-- Modal content -->
            <div class="modal-content">
                <button
                    class="modal-close"
                    aria-label="Close video"
                    @click="showVideoModal = false"
                >
                    &times;
                </button>
                <div
                    id="modal-iframe"
                    class="embed-responsive embed-responsive-16by9"
                >
                    <iframe
                        class="intro-video"
                        src="https://www.youtube.com/embed/VRQ47XRBApg?si=CfPv1r0gKRuFpGMM&autoplay=1"
                        title="YouTube video player"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin"
                        allowfullscreen
                    ></iframe>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* ============ Observatory theme (matches LandingView) ============ */
.signup-page {
    --ci-space: #0d1030;
    --ci-space-2: #191650;
    --ci-purple: #5f31dd;
    --ci-purple-soft: #7c5cf0;
    --ci-cyan: #45d8e2;
    --ci-gold: #ffc857;

    position: relative;
    isolation: isolate;
    min-height: 100%;
    width: 100%;
    padding: 10px;
    font-family: 'Inter', sans-serif;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

/* Backdrop — same assets as the landing hero */
.bg-media {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    z-index: -2;
}

.bg-scrim {
    position: fixed;
    inset: 0;
    z-index: -1;
    background: linear-gradient(
        180deg,
        rgba(13, 16, 48, 0.6) 0%,
        rgba(13, 16, 48, 0.35) 45%,
        rgba(13, 16, 48, 0.75) 100%
    );
}

/* Header */
.signup-header {
    text-align: center;
    padding-top: 84px; /* clears the fixed navbar */
    margin-bottom: 4px;
}

.signup-kicker {
    color: var(--ci-cyan);
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-size: 0.72rem;
    margin-bottom: 8px;
}

.signup-title {
    color: white;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    margin-bottom: 0;
    text-shadow: 0 4px 30px rgba(13, 16, 48, 0.8);
}

.signup-title-glow {
    background: linear-gradient(90deg, var(--ci-cyan), var(--ci-gold));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* Opt-in intro video button */
.watch-intro-btn {
    align-self: center;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding: 7px 18px;
    border-radius: 999px;
    border: 1.5px solid rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(4px);
    color: white;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    font-size: 0.85rem;
    cursor: pointer;
    transition:
        border-color 0.15s ease,
        background 0.15s ease;
}

.watch-intro-btn:hover,
.watch-intro-btn:focus {
    border-color: var(--ci-cyan);
    background: rgba(69, 216, 226, 0.15);
}

/* The form card */
.form-signin {
    background-color: white;
    width: 360px;
    max-width: 100%;
    padding: 22px 18px;
    margin: 0 auto;
    border-radius: 22px;
    box-shadow: 0 18px 60px rgba(13, 16, 48, 0.45);
}

.form-signin button {
    width: 100%;
    background: linear-gradient(
        135deg,
        var(--ci-purple),
        var(--ci-purple-soft)
    );
    color: white;
    border: none;
    border-radius: 999px;
    padding: 9px 0;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    box-shadow: 0 6px 20px rgba(95, 49, 221, 0.35);
    transition:
        transform 0.15s ease,
        box-shadow 0.15s ease;
}

.form-signin button:hover,
.form-signin button:focus {
    transform: translateY(-1px);
    box-shadow: 0 9px 26px rgba(95, 49, 221, 0.5);
    color: white;
}

.form-signin .form-control,
.form-signin .form-select {
    border-radius: 12px;
    padding: 10px 14px;
    border: 1px solid rgba(95, 49, 221, 0.25);
}

.form-signin .form-control:focus,
.form-signin .form-select:focus {
    border-color: var(--ci-purple);
    box-shadow: 0 0 0 3px rgba(95, 49, 221, 0.15);
}

.form-validate {
    font-size: 0.75rem;
    color: red;
    font-weight: 300;
}

.signup {
    font-size: 14px;
    color: var(--ci-purple);
}

.links {
    color: var(--ci-purple);
    font-weight: 600;
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

/* ============ Entrances (one-shot; end state = rest state) ============ */
@media (prefers-reduced-motion: no-preference) {
    .signup-header {
        animation: rise-in 0.5s ease-out backwards;
    }

    .watch-intro-btn {
        animation: rise-in 0.5s ease-out 0.12s backwards;
    }

    .form-signin {
        animation: card-rise 0.55s ease-out 0.2s backwards;
    }

    /* Fields stagger in after the card lands */
    .form-signin > div > * {
        animation: rise-in 0.4s ease-out backwards;
    }

    .form-signin > div > *:nth-child(1) {
        animation-delay: 0.4s;
    }
    .form-signin > div > *:nth-child(2) {
        animation-delay: 0.47s;
    }
    .form-signin > div > *:nth-child(3) {
        animation-delay: 0.54s;
    }
    .form-signin > div > *:nth-child(4) {
        animation-delay: 0.61s;
    }
    .form-signin > div > *:nth-child(5) {
        animation-delay: 0.68s;
    }
    .form-signin > div > *:nth-child(6) {
        animation-delay: 0.75s;
    }
    .form-signin > div > *:nth-child(7) {
        animation-delay: 0.82s;
    }
    .form-signin > div > *:nth-child(8) {
        animation-delay: 0.89s;
    }
}

@keyframes rise-in {
    from {
        opacity: 0;
        transform: translateY(14px);
    }
    to {
        opacity: 1;
        transform: none;
    }
}

@keyframes card-rise {
    from {
        opacity: 0;
        transform: translateY(26px) scale(0.98);
    }
    to {
        opacity: 1;
        transform: none;
    }
}

/* ============ Opt-in video modal ============ */
.modal {
    display: block;
    position: fixed;
    z-index: 1050;
    inset: 0;
    overflow: hidden;
    background-color: rgba(13, 16, 48, 0.78);
    backdrop-filter: blur(6px);
}

.modal-content {
    background: rgba(25, 22, 80, 0.92);
    border: 1px solid rgba(69, 216, 226, 0.3);
    border-radius: 20px;
    padding: 34px 20px 20px;
    width: 640px;
    max-width: 92vw;
    height: fit-content;
    position: absolute;
    inset: 0 0 20% 0;
    margin: auto;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
}

.modal-close {
    position: absolute;
    top: 6px;
    right: 14px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.7rem;
    line-height: 1;
    cursor: pointer;
}

.modal-close:hover {
    color: white;
}

.intro-video {
    display: block;
    border-radius: 12px;
    aspect-ratio: 16 / 9;
    margin: auto;
    width: 100%;
}

@media (prefers-reduced-motion: no-preference) {
    .modal {
        animation: modal-fade 0.25s ease-out;
    }

    .modal-content {
        animation: card-rise 0.3s ease-out;
    }
}

@keyframes modal-fade {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

/* Small devices */
@media (max-width: 800px) {
    .signup-header {
        padding-top: 76px;
    }

    /* Keep the learner + gold first stone in frame on narrow crops */
    .bg-media {
        object-position: 12% center;
    }
}
</style>
