<script>
import router from '../../router';
// Import the stores.
import { useUsersStore } from '../../stores/UsersStore';

export default {
    setup() {
        const usersStore = useUsersStore();

        return {
            usersStore
        };
    },
    data() {
        return {
            newStudent: {
                username: null,
                firstName: null,
                lastName: null,
                email: null,
                password: null,
                chosenInstructorId: null
            }
        };
    },
    async created() {
        await this.usersStore.getInstructors();
        this.instructors = this.usersStore.instructors;
    },
    mounted() {},
    methods: {
        Submit() {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.newStudent.username,
                    first_name: this.newStudent.firstName,
                    last_name: this.newStudent.lastName,
                    email: this.newStudent.email,
                    password: this.newStudent.password,
                    instructor: this.newStudent.chosenInstructorId
                })
            };
            var url = '/users/new-student/add';
            fetch(url, requestOptions)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    if (data.account == 'username already taken') {
                        alert(data.account);
                    } else if (data.account == 'email already taken') {
                        alert(data.account);
                    } else {
                        alert(
                            'Account created/n. Use your username and password to login.'
                        );
                        router.push({ name: 'login' });
                    }
                });
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
                    <!-- <label class="form-label">Username</label> -->
                    <input
                        v-model="newStudent.username"
                        type="text"
                        placeholder="Username"
                        class="form-control"
                        required
                    />
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
                </div>
                <div class="mb-3 text-start">
                    <label class="form-label">Instructor</label>
                    <select v-model="newStudent.chosenInstructorId">
                        <option
                            v-for="instructor in this.usersStore.instructors"
                            :value="instructor.id"
                        >
                            {{ instructor.username }}
                        </option>
                    </select>
                    <p class="signup">
                        <a href="#" class="links"
                            >Add a new instructor instead</a
                        >
                    </p>
                </div>
                <div class="mb-3 text-start">
                    <!-- <label class="form-label">Email</label> -->
                    <input
                        v-model="newStudent.email"
                        type="email"
                        placeholder="Email"
                        class="form-control"
                        required
                    />
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
