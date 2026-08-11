<script>
import CheckPasswordComplexity from './CheckPasswordComplexity.vue';

const GOOGLE_CLIENT_ID =
    '13191319610-qectaoi146ce1pm4v95jtgctsbtmqb3t.apps.googleusercontent.com';

export default {
    components: { CheckPasswordComplexity },
    data() {
        return {
            // 'signin' | 'register'
            mode: 'signin',
            // 'student' | 'instructor' (Teacher)
            role: 'student',
            form: {
                username: null,
                email: null,
                password: null,
                // Consumed by CheckPasswordComplexity for the predictability check.
                firstName: '',
                lastName: ''
            },
            gradeLevel: 'phd',
            passwordVisible: false,
            errors: {
                username: null,
                email: null,
                emailFormat: false,
                password: null
            },
            // Set by the CheckPasswordComplexity child via $parent.validate.
            validate: {
                passwordComplex: false
            },
            isSubmitting: false,
            isMobile: window.innerWidth < 576,
            videoFailed: false,
            referrer: ''
        };
    },
    computed: {
        deviceType() {
            return this.isMobile ? 'mobile' : 'not-mobile';
        }
    },
    mounted() {
        // Preselect mode/role from the route the user landed on so the old
        // /student-signup and /instructor-signup links open the right panel.
        const name = this.$route && this.$route.name;
        if (name === 'student-signup') {
            this.mode = 'register';
            this.role = 'student';
        } else if (name === 'instructor-signup') {
            this.mode = 'register';
            this.role = 'instructor';
        }

        const params = new URLSearchParams(window.location.search);
        this.referrer = params.get('ref') || '';

        // Google Identity Services.
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.defer = true;
        script.onload = this.initGoogle;
        document.head.appendChild(script);

        this.getGoogleLoginResult();
        window.addEventListener('resize', this.onResize);
        document.addEventListener('keydown', this.handleKeyPress);
    },
    unmounted() {
        window.removeEventListener('resize', this.onResize);
        document.removeEventListener('keydown', this.handleKeyPress);
    },
    methods: {
        onResize() {
            this.isMobile = window.innerWidth < 576;
        },
        setMode(mode) {
            this.mode = mode;
            this.clearErrors();
        },
        selectRole(role) {
            this.role = role;
        },
        clearError(field) {
            if (this.errors[field]) this.errors[field] = null;
            if (field === 'email') this.errors.emailFormat = false;
        },
        clearErrors() {
            this.errors = {
                username: null,
                email: null,
                emailFormat: false,
                password: null
            };
        },
        validateEmail() {
            const ok = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(
                this.form.email || ''
            );
            this.errors.emailFormat = !ok;
            return ok;
        },
        routeByRole(role) {
            switch (role) {
                case 'student':
                    return this.isMobile
                        ? this.$router.push({ name: 'search' })
                        : this.$router.push({ name: 'skill-tree' });
                case 'instructor':
                case 'partner':
                    return this.$router.push({ name: 'students' });
                case 'editor':
                    return this.$router.push({ name: 'todo' });
                case 'platform_admin':
                    return this.$router.push({ name: 'tenants' });
                case 'school_admin':
                    return this.$router.push({ name: 'dashboard' });
                default:
                    return this.$router.push({ name: 'skills' });
            }
        },
        handleKeyPress(event) {
            if (event.key !== 'Enter') return;
            if (this.mode === 'signin') this.submitSignin();
            else this.submitRegister();
        },

        // ---- Sign in (username + password) ----
        submitSignin() {
            this.clearErrors();
            let valid = true;
            if (!this.form.username || !this.form.username.trim()) {
                this.errors.username = 'Username is required';
                valid = false;
            }
            if (!this.form.password || !this.form.password.trim()) {
                this.errors.password = 'Password is required';
                valid = false;
            }
            if (!valid) return;

            this.isSubmitting = true;
            fetch('/login-attempt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.form.username,
                    password: this.form.password
                })
            })
                .then((r) => r.json())
                .then((data) => {
                    this.isSubmitting = false;
                    if (data.account === 'authorized') {
                        this.routeByRole(data.role);
                    } else if (data.account === 'wrong-password') {
                        this.errors.password = 'Incorrect password';
                    } else {
                        this.errors.username = 'No account found';
                    }
                })
                .catch(() => {
                    this.isSubmitting = false;
                    this.errors.password =
                        'Something went wrong. Please try again.';
                });
        },

        // ---- Register (username + email + password + role) ----
        submitRegister() {
            this.clearErrors();
            let valid = true;
            if (!this.form.username || !this.form.username.trim()) {
                this.errors.username = 'Username is required';
                valid = false;
            }
            if (!this.form.email || !this.form.email.trim()) {
                this.errors.email = 'Email is required';
                valid = false;
            } else if (!this.validateEmail()) {
                valid = false;
            }
            if (!this.form.password || !this.form.password.trim()) {
                this.errors.password = 'Password is required';
                valid = false;
            } else if (!this.validate.passwordComplex) {
                this.errors.password = 'Please choose a stronger password';
                valid = false;
            }
            if (!valid) return;

            this.isSubmitting = true;
            fetch('/users/new-user/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.form.username,
                    first_name: '',
                    last_name: '',
                    email: this.form.email,
                    password: this.form.password,
                    account_type: this.role,
                    grade_filter:
                        this.role === 'student' ? this.gradeLevel : undefined,
                    referrer_username: this.referrer
                })
            })
                .then((r) => r.json())
                .then((data) => {
                    this.isSubmitting = false;
                    if (data.account === 'authorized') {
                        this.routeByRole(data.role || this.role);
                    } else if (data.account === 'username already taken') {
                        this.errors.username = 'That username is already taken';
                    } else if (data.account === 'email already taken') {
                        this.errors.email = 'That email is already registered';
                    } else {
                        this.errors.password =
                            'Something went wrong. Please try again.';
                    }
                })
                .catch(() => {
                    this.isSubmitting = false;
                    this.errors.password =
                        'Something went wrong. Please try again.';
                });
        },

        // ---- Google (server-redirect flow, mode-aware) ----
        initGoogle() {
            if (!window.google || !window.google.accounts) return;
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: this.handleCredentialResponse
            });
            if (this.$refs.googleButton) {
                window.google.accounts.id.renderButton(this.$refs.googleButton, {
                    theme: 'filled_black',
                    size: 'large',
                    type: 'standard',
                    shape: 'pill',
                    text: 'continue_with',
                    logo_alignment: 'left',
                    width: 300
                });
            }
        },
        handleCredentialResponse(response) {
            // Google credential is verified server-side; we POST it to the
            // right endpoint for the current mode/role and let the server
            // redirect. (accountType is allowlisted to student|instructor.)
            const action =
                this.mode === 'signin'
                    ? `/google-login-attempt?device=${this.deviceType}`
                    : `/google-student-signup-attempt?accountType=${this.role}` +
                      `&deviceType=${this.deviceType}` +
                      `&referrerUsername=${encodeURIComponent(this.referrer)}`;

            const f = document.createElement('form');
            f.method = 'POST';
            f.action = action;
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'credential';
            input.value = response.credential;
            f.appendChild(input);
            document.body.appendChild(f);
            f.submit();
        },
        getGoogleLoginResult() {
            fetch('/google-login-result')
                .then((r) => r.json())
                .then((data) => {
                    if (data && data.account === 'no account') {
                        this.setMode('register');
                        this.errors.username =
                            'No account found — create one below.';
                    }
                })
                .catch(() => {});
        }
    }
};
</script>

<template>
    <div class="auth-screen">
        <!-- Cinematic background: video with image poster + graceful fallback -->
        <div class="auth-bg">
            <video
                v-if="!videoFailed"
                class="auth-video"
                autoplay
                muted
                loop
                playsinline
                preload="auto"
                poster="/images/login/login-hero.jpg"
                @error="videoFailed = true"
            >
                <source src="/images/login/login-hero.mp4" type="video/mp4" />
            </video>
            <div class="auth-vignette"></div>
        </div>

        <!-- Auth card -->
        <div class="auth-card">
            <div class="brand">
                <span class="brand-mark">✦</span>
                <div>
                    <div class="brand-name">Collins Institute</div>
                    <div class="brand-tagline">Grow your tree of knowledge</div>
                </div>
            </div>

            <!-- Mode switch -->
            <div class="mode-tabs" :class="mode">
                <div class="mode-indicator"></div>
                <button
                    type="button"
                    class="mode-tab"
                    :class="{ active: mode === 'signin' }"
                    @click="setMode('signin')"
                >
                    Sign in
                </button>
                <button
                    type="button"
                    class="mode-tab"
                    :class="{ active: mode === 'register' }"
                    @click="setMode('register')"
                >
                    Create account
                </button>
            </div>

            <!-- Role toggle (register only) -->
            <div v-if="mode === 'register'" class="role-toggle">
                <button
                    type="button"
                    class="role-card"
                    :class="{ selected: role === 'student' }"
                    @click="selectRole('student')"
                >
                    <img src="/images/login/role-student.jpg" alt="" />
                    <span>Student</span>
                </button>
                <button
                    type="button"
                    class="role-card"
                    :class="{ selected: role === 'instructor' }"
                    @click="selectRole('instructor')"
                >
                    <img src="/images/login/role-teacher.jpg" alt="" />
                    <span>Teacher</span>
                </button>
            </div>

            <!-- Fields -->
            <div class="field">
                <input
                    v-model="form.username"
                    type="text"
                    placeholder="Username"
                    class="input"
                    :class="{ invalid: errors.username }"
                    @input="clearError('username')"
                />
                <div v-if="errors.username" class="field-error">
                    {{ errors.username }}
                </div>
            </div>

            <div v-if="mode === 'register'" class="field">
                <input
                    v-model="form.email"
                    type="email"
                    placeholder="Email"
                    class="input"
                    :class="{ invalid: errors.email || errors.emailFormat }"
                    @blur="validateEmail"
                    @input="clearError('email')"
                />
                <div v-if="errors.email" class="field-error">
                    {{ errors.email }}
                </div>
                <div v-else-if="errors.emailFormat" class="field-error">
                    Please enter a valid email address
                </div>
            </div>

            <div class="field">
                <div class="password-wrap">
                    <input
                        id="password-input"
                        v-model="form.password"
                        :type="passwordVisible ? 'text' : 'password'"
                        placeholder="Password"
                        class="input"
                        :class="{ invalid: errors.password }"
                        autocomplete="off"
                        @input="clearError('password')"
                    />
                    <button
                        type="button"
                        class="eye"
                        :title="passwordVisible ? 'Hide password' : 'Show password'"
                        @click="passwordVisible = !passwordVisible"
                    >
                        {{ passwordVisible ? '🙈' : '👁' }}
                    </button>
                </div>
                <div v-if="errors.password" class="field-error">
                    {{ errors.password }}
                </div>
                <CheckPasswordComplexity
                    v-if="mode === 'register'"
                    :formData="form"
                />
            </div>

            <!-- Grade level (students only) -->
            <div
                v-if="mode === 'register' && role === 'student'"
                class="field"
            >
                <select v-model="gradeLevel" class="input">
                    <option value="grade_school">Grade School</option>
                    <option value="middle_school">Middle School</option>
                    <option value="high_school">High School</option>
                    <option value="college">College</option>
                    <option value="phd">PhD</option>
                </select>
            </div>

            <div v-if="mode === 'signin'" class="row-end">
                <a href="/password-reset" class="link">Forgot password?</a>
            </div>

            <!-- Primary action -->
            <button
                type="button"
                class="cta"
                :disabled="isSubmitting"
                @click="mode === 'signin' ? submitSignin() : submitRegister()"
            >
                <span v-if="isSubmitting">Please wait…</span>
                <span v-else-if="mode === 'signin'">Sign in</span>
                <span v-else>Create my account</span>
            </button>

            <div class="divider"><span>or</span></div>

            <!-- Google (shared, mode-aware) -->
            <div ref="googleButton" class="google-btn"></div>

            <!-- Footer switch -->
            <div class="foot">
                <template v-if="mode === 'signin'">
                    New here?
                    <a href="#" class="link" @click.prevent="setMode('register')"
                        >Create an account</a
                    >
                </template>
                <template v-else>
                    Already have an account?
                    <a href="#" class="link" @click.prevent="setMode('signin')"
                        >Sign in</a
                    >
                </template>
            </div>
        </div>
    </div>
</template>

<style scoped>
.auth-screen {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 4vw;
    overflow-y: auto;
    font-family: 'Inter', sans-serif;
    background: #1a0f3d;
}

/* Background */
.auth-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
}
.auth-video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.auth-vignette {
    position: absolute;
    inset: 0;
    background:
        radial-gradient(
            120% 90% at 15% 50%,
            rgba(26, 15, 61, 0.92) 0%,
            rgba(26, 15, 61, 0.55) 38%,
            rgba(26, 15, 61, 0.15) 70%
        ),
        linear-gradient(
            180deg,
            rgba(26, 15, 61, 0.35),
            rgba(26, 15, 61, 0.15)
        );
}

/* Card */
.auth-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 400px;
    padding: 30px 28px 26px;
    border-radius: 22px;
    background: rgba(30, 18, 66, 0.55);
    backdrop-filter: blur(18px) saturate(140%);
    -webkit-backdrop-filter: blur(18px) saturate(140%);
    border: 1px solid rgba(198, 231, 108, 0.28);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
    color: #fff;
}

.brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 22px;
}
.brand-mark {
    font-size: 26px;
    color: #c6e76c;
    text-shadow: 0 0 18px rgba(198, 231, 108, 0.7);
}
.brand-name {
    font-family: 'Poppins', sans-serif;
    font-weight: 800;
    font-size: 20px;
    letter-spacing: 0.2px;
}
.brand-tagline {
    font-size: 12.5px;
    color: rgba(255, 255, 255, 0.7);
}

/* Mode tabs */
.mode-tabs {
    position: relative;
    display: flex;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 4px;
    margin-bottom: 20px;
}
.mode-indicator {
    position: absolute;
    top: 4px;
    bottom: 4px;
    width: calc(50% - 4px);
    left: 4px;
    background: linear-gradient(135deg, #5f31dd, #7a4ef0);
    border-radius: 9px;
    transition: transform 280ms cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 14px rgba(95, 49, 221, 0.5);
}
.mode-tabs.register .mode-indicator {
    transform: translateX(100%);
}
.mode-tab {
    position: relative;
    z-index: 1;
    flex: 1;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 600;
    font-size: 14px;
    padding: 9px 0;
    cursor: pointer;
    transition: color 200ms;
}
.mode-tab.active {
    color: #fff;
}

/* Role toggle */
.role-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 18px;
}
.role-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px 8px 10px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.06);
    border: 1.5px solid rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.85);
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 200ms;
}
.role-card img {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    border-radius: 10px;
    opacity: 0.75;
    transition: opacity 200ms;
}
.role-card:hover {
    border-color: rgba(198, 231, 108, 0.4);
}
.role-card.selected {
    border-color: #c6e76c;
    background: rgba(198, 231, 108, 0.12);
    box-shadow: 0 0 0 1px #c6e76c, 0 8px 22px rgba(198, 231, 108, 0.18);
}
.role-card.selected img {
    opacity: 1;
}

/* Fields */
.field {
    margin-bottom: 14px;
}
.input {
    width: 100%;
    padding: 12px 14px;
    border-radius: 11px;
    border: 1.5px solid rgba(255, 255, 255, 0.16);
    background: rgba(255, 255, 255, 0.07);
    color: #fff;
    font-size: 14.5px;
    outline: none;
    transition: border-color 180ms, box-shadow 180ms;
}
.input::placeholder {
    color: rgba(255, 255, 255, 0.55);
}
.input:focus {
    border-color: #c6e76c;
    box-shadow: 0 0 0 3px rgba(198, 231, 108, 0.18);
}
.input.invalid {
    border-color: #ff8080;
}
select.input option {
    color: #1a0f3d;
}
.password-wrap {
    position: relative;
    display: flex;
    align-items: center;
}
.eye {
    position: absolute;
    right: 8px;
    border: none;
    background: transparent;
    font-size: 16px;
    cursor: pointer;
    line-height: 1;
    padding: 4px;
}
.field-error {
    margin-top: 6px;
    font-size: 12.5px;
    color: #ffb0b0;
}

.row-end {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
}
.link {
    color: #c6e76c;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
}
.link:hover {
    text-decoration: underline;
}

/* CTA */
.cta {
    width: 100%;
    padding: 13px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #c6e76c, #a8d94a);
    color: #23134f;
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    transition: transform 120ms, box-shadow 200ms, filter 200ms;
    box-shadow: 0 10px 26px rgba(198, 231, 108, 0.32);
}
.cta:hover:not(:disabled) {
    transform: translateY(-1px);
    filter: brightness(1.05);
}
.cta:disabled {
    opacity: 0.7;
    cursor: default;
}

.divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 18px 0 14px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
}
.divider::before,
.divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.18);
}
.divider span {
    padding: 0 12px;
}

.google-btn {
    display: flex;
    justify-content: center;
    min-height: 40px;
}

.foot {
    margin-top: 18px;
    text-align: center;
    font-size: 13.5px;
    color: rgba(255, 255, 255, 0.75);
}

/* Small screens */
@media (max-width: 600px) {
    .auth-screen {
        justify-content: center;
        padding: 16px;
    }
    .auth-card {
        max-width: 100%;
    }
    .auth-vignette {
        background: linear-gradient(
            180deg,
            rgba(26, 15, 61, 0.55),
            rgba(26, 15, 61, 0.8)
        );
    }
}
</style>
