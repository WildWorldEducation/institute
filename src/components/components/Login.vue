<script>
// Import
import router from '../../router';

export default {
    data() {
        return {
            // loginError: "",
            username: null,
            password: null
        };
    },
    mounted() {
        // Load Google login button.
        let script = document.createElement('script');
        script.setAttribute('src', 'https://accounts.google.com/gsi/client');
        script.setAttribute('defer', '');
        document.head.appendChild(script);

        this.GetGoogleLoginResult();
    },
    computed: {},
    methods: {
        Submit() {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.username,
                    password: this.password
                })
            };
            var url = '/login-attempt';

            fetch(url, requestOptions)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    if (data.account == 'authorized') {
                        if (data.role == 'student') {
                            router.push({ name: 'skill-tree' });
                        } else router.push({ name: 'hub' });
                    } else if (data.account == 'wrong-password') {
                        alert('wrong password');
                    } else {
                        alert('no account');
                    }
                });
        },
        GetGoogleLoginResult() {
            fetch('/google-login-result')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    if (data.account == 'no account')
                        alert('No account found.');
                });
        }
    }
};
</script>

<template>
    <div class="login-page">
        <div class="form-signin">
            <!-- Image -->
            <div class="text-center app-logo-wrapper">
                <img
                    class=""
                    src="/images/app-logo.jpg"
                    alt="icon of a skill tree"
                />
            </div>
            <!-- Heading -->
            <h1 class="h3 mt-2 font-weight-normal">Student sign in</h1>
            <!-- Form -->
            <div class="form">
                <label class="mb-4 welcome-message"
                    >Welcome back! Please enter your details.</label
                >
                <div class="mb-3 text-start">
                    <!-- <img class="me-1" src="images/icons/user-solid.svg" alt="" width="16" height="16"> -->
                    <label class="form-label">Username</label>
                    <input
                        v-model="username"
                        type="text"
                        placeholder="Username"
                        class="form-control"
                        required
                    />
                </div>
                <div class="mb-3 text-start">
                    <!-- <img class="me-1" src="images/icons/lock-solid.svg" alt="" width="16" height="16"> -->
                    <label class="form-label">Password</label>
                    <input
                        v-model="password"
                        type="password"
                        placeholder="Password"
                        class="form-control"
                        required
                    />
                </div>
                <div class="d-flex password-extras">
                    <div style="color: rgba(164, 139, 229, 1)">
                        <a href="/password-reset" class="links"
                            >Forgot password</a
                        >
                    </div>
                </div>
                <button class="btn btn-dark mb-2" @click="Submit()">
                    Sign in
                </button>
                <div
                    id="g_id_onload"
                    data-client_id="13191319610-qectaoi146ce1pm4v95jtgctsbtmqb3t.apps.googleusercontent.com"
                    data-context="signin"
                    data-ux_mode="popup"
                    data-login_uri="/google-login-attempt"
                    data-auto_prompt="false"
                ></div>
                <div
                    class="g_id_signin"
                    data-type="standard"
                    data-shape="rectangular"
                    data-theme="outline"
                    data-text="signin_with"
                    data-size="large"
                    data-logo_alignment="left"
                    data-width="330"
                ></div>
                <div class="mt-4 signup text-center">
                    Don’t have an account?
                    <a href="/student-signup" class="links">Register</a>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.login-page {
    height: 100%;
    padding: 10px;
    background-repeat: no-repeat;
    width: 100%;
    font-family: 'Inter', sans-serif;
}

.welcome-message {
    color: var(--primary-color);
    font-size: 16px;
}

.form-signin {
    display: flex;
    flex-direction: column;
    background-color: white;
    width: 100%;
    height: 90%;
    width: 360px;
    padding: 15px;
    margin: 0 auto;
    /* border: 1px solid black; */
    border-radius: 25px;
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
}

.form-signin button {
    width: 100%;
    background-color: var(--primary-color);
    color: white;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
}

.form {
    flex: 1;
}

h1 {
    color: var(--primary-color);
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
}

.password-extras {
    font-size: 14px;
    justify-content: end;
}

.signup {
    font-size: 14px;
    color: var(--primary-color);
}

.links {
    color: var(--primary-color);
}

/* Mobile */
@media (max-width: 480px) {
    .login-page {
        background-image: none;
    }
}

/* Tablets */
@media (min-width: 481px) and (max-width: 1024px) {
    .login-page {
        background-image: none;
    }
}

/* Desktops/laptops */
@media (min-width: 1025px) {
    .login-page {
        background-image: url('/images/background-landscape.jpg');
        background-size: cover;
        background-position: center bottom;
    }
}

.app-logo-wrapper {
    overflow: auto;
}

.app-logo-wrapper img {
    margin: auto;
    max-height: 100%;
    max-width: 100%;
}

.app-icon {
    /* max-height: 100% !important;
    height: 100%; */
    /* width: 100%;
    height: 100%;
    object-fit: cover;
    overflow: hidden; */
}
</style>
