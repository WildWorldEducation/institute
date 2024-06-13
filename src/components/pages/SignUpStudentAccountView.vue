<script>
import router from '../../router';
// Import the stores.
import { useUsersStore } from '../../stores/UsersStore';
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useUserSkillsStore } from '../../stores/UserSkillsStore.js';

export default {
    setup() {
        const usersStore = useUsersStore();
        const userSkillsStore = useUserSkillsStore();
        const skillsStore = useSkillsStore();

        return {
            usersStore,
            userSkillsStore,
            skillsStore
        };
    },
    data() {
        return {
            newStudent: {
                id: null,
                username: null,
                firstName: null,
                lastName: null,
                email: null,
                password: null,
                chosenInstructorId: null
            },
            // To make the first level skills mastered for a new user.
            firstLevelSkills: [],
            childrenOfFirstLevelSkillsIds: []
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
                    if (data.account == 'authorized') {
                        alert('Account created.');
                        // Get the new user's id number from the DB.
                        this.newStudent.id = data.id;
                    } else if (data.account == 'username already taken') {
                        alert(data.account);
                    } else if (data.account == 'email already taken') {
                        alert(data.account);
                    }
                }) // Make all relevant skills and domains available or mastered.
                .then(() => {
                    this.getSkills();
                });
        },
        async getSkills() {
            // Load all skills.
            if (this.skillsStore.skillsList.length < 1)
                await this.skillsStore.getSkillsList();

            // Find the first level skills - we will make these mastered.
            for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
                if (this.skillsStore.skillsList[i].parent == 0) {
                    // Add them to the local array.
                    this.firstLevelSkills.push(this.skillsStore.skillsList[i]);
                }
            }
            // Find the child skills of the first level skills - we will make these available/unlocked.
            for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
                for (let j = 0; j < this.firstLevelSkills.length; j++) {
                    if (
                        this.skillsStore.skillsList[i].parent ==
                        this.firstLevelSkills[j].id
                    ) {
                        this.childrenOfFirstLevelSkillsIds.push(
                            this.skillsStore.skillsList[i].id
                        );
                    }
                }
            }
            this.unlockInitialSkills();
        },
        async unlockInitialSkills() {
            for (let i = 0; i < this.firstLevelSkills.length; i++) {
                await this.userSkillsStore.MakeMastered(
                    this.newStudent.id,
                    this.firstLevelSkills[i]
                );
            }
            router.push({ name: 'skills' });
        }
    }
};
</script>

<template>
    <div class="signup-page">
        <div class="form-signin">
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
