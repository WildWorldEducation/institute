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
                        if (data.role == 'student')
                            router.push({ name: 'skills' });
                        else router.push({ name: 'hub' });
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
            <div class="text-center">
                <img
                    class="mb-4"
                    src="/images/logo-red.png"
                    alt=""
                    width="72"
                    height="72"
                />
            </div>
            <h1 class="h3 mb-3 font-weight-normal">Student log in</h1>

            <div class="mt-3">
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
                    <div class="form-check">
                        <input
                            class="form-check-input"
                            type="checkbox"
                            id="flexCheckDefault"
                        />
                        <label class="form-check-label" for="flexCheckDefault">
                            Remember for 30 days
                        </label>
                    </div>
                    <div style="color: rgba(164, 139, 229, 1)">
                        <a href="#" class="links">Forgot password</a>
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
                    <a href="/choose-account-type" class="links">Sign up</a>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.login-page {
    height: calc(100% + 66px);
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
    .login-page {
        background-image: url('/images/login-page.svg');
        background-size: contain;
        background-position: center bottom;
    }
}

/* Tablets */
@media (min-width: 481px) and (max-width: 1024px) {
    .login-page {
        background-image: url('/images/login-page.svg');
        background-size: contain;
        background-position: center bottom;
    }
}

/* Desktops/laptops */
@media (min-width: 1025px) {
    .login-page {
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
</style>
