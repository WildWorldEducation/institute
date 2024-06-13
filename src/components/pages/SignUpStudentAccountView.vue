<script>
// Import
import router from '../../router';

export default {
    data() {
        return {
            username: null,
            firstName: null,
            lastName: null,
            email: null,
            password: null
        };
    },
    mounted() {},
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
            var url = '';

            fetch(url, requestOptions)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {});
        }
    }
};
</script>

<template>
    <div class="signup-page">
        <div class="form-signin">
            <h1 class="h3 mb-3 font-weight-normal">Sign up</h1>

            <div class="mt-3">
                <div class="mb-3 text-start">
                    <!-- <img class="me-1" src="images/icons/user-solid.svg" alt="" width="16" height="16"> -->
                    <!-- <label class="form-label">Username</label> -->
                    <input
                        v-model="username"
                        type="text"
                        placeholder="Username"
                        class="form-control"
                        required
                    />
                </div>
                <div class="mb-3 text-start">
                    <!-- <img class="me-1" src="images/icons/user-solid.svg" alt="" width="16" height="16"> -->
                    <!-- <label class="form-label">First name</label> -->
                    <input
                        v-model="firstName"
                        type="text"
                        placeholder="First name"
                        class="form-control"
                        required
                    />
                </div>
                <div class="mb-3 text-start">
                    <!-- <img class="me-1" src="images/icons/user-solid.svg" alt="" width="16" height="16"> -->
                    <!-- <label class="form-label">Last name</label> -->
                    <input
                        v-model="lastName"
                        type="text"
                        placeholder="Last name"
                        class="form-control"
                        required
                    />
                </div>
                <div class="mb-3 text-start">
                    <label class="form-label">Instructor</label>
                    <select name="cars" id="cars">
                        <option value="volvo">Volvo</option>
                        <option value="saab">Saab</option>
                        <option value="mercedes">Mercedes</option>
                        <option value="audi">Audi</option>
                    </select>
                    Create new instructor account
                </div>
                <div class="mb-3 text-start">
                    <!-- <label class="form-label">Email</label> -->
                    <input
                        v-model="email"
                        type="email"
                        placeholder="Email"
                        class="form-control"
                        required
                    />
                </div>
                <div class="mb-3 text-start">
                    <!-- <img class="me-1" src="images/icons/lock-solid.svg" alt="" width="16" height="16"> -->
                    <!-- <label class="form-label">Password</label> -->
                    <input
                        v-model="password"
                        type="password"
                        placeholder="Password"
                        class="form-control"
                        required
                    />
                </div>
                <button class="btn btn-dark mb-2" @click="Submit()">
                    Sign up
                </button>
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
</style>
