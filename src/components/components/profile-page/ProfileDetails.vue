<script>
import router from '../../../router';
// Import the stores.
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useSessionDetailsStore } from '../../../stores/SessionDetailsStore.js';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        // Run the GET request.
        userDetailsStore.getUserDetails();
        const sessionDetailsStore = useSessionDetailsStore();
        return {
            userDetailsStore,
            sessionDetailsStore
        };
    },
    data() {
        return {};
    },
    computed: {
        name() {
            return this.userDetailsStore.firstName
                ? this.userDetailsStore.firstName
                : '' + ' ' + this.userDetailsStore.lastName
                ? this.userDetailsStore.lastName
                : '';
        }
    },
    methods: {
        LogOut() {
            this.sessionDetailsStore.isLoggedIn = false;

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            };
            var url = '/logout';

            fetch(url, requestOptions).then(function (response) {
                router.push({ name: 'login' });
            });
        }
    }
};
</script>

<template>
    <div class="container pb-4">
        <h1 id="page-tile" class="my-3 ms-0 ms-md-3 ms-lg-0 mt-2 mt-md-4">
            My Profile
        </h1>
        <div class="row mt-0 mt-md-4">
            <div class="col-12 col-lg-5">
                <div class="row mx-0 px-md-0">
                    <div
                        class="d-flex align-items-center align-items-md-start ps-lg-0"
                    >
                        <img
                            id="img-background"
                            :src="userDetailsStore.avatar"
                            height="270"
                            style="background-color: lightgrey"
                            class="d-none d-lg-block"
                        />
                        <img
                            id="img-background"
                            :src="userDetailsStore.avatar"
                            height="120"
                            style="background-color: lightgrey"
                            class="d-lg-none"
                        />
                    </div>
                </div>
                <div class="row my-3 mx-0">
                    <div
                        class="col-12 col-5 d-flex gap-3 flex-row justify-content-center justify-content-md-start ps-lg-0"
                    >
                        <router-link
                            class="primary-btn btn"
                            to="/profile/edit"
                            role="button"
                            >Edit Profile&nbsp;&nbsp;
                            <!-- Pencil icon -->
                            <svg
                                width="19"
                                height="20"
                                viewBox="0 0 19 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M0.75558 19.3181C0.77635 19.5132 0.87137 19.6928 1.02096 19.8198C1.17055 19.9468 1.36325 20.0114 1.55915 20.0002L5.27701 19.8288L0.398438 15.6145L0.75558 19.3181Z"
                                    fill="white"
                                />
                                <path
                                    d="M11.8467 2.24484L0.801758 15.0315L5.6802 19.2454L16.7251 6.45877L11.8467 2.24484Z"
                                    fill="white"
                                />
                                <path
                                    d="M18.2555 3.11796L14.934 0.260817C14.832 0.172259 14.7134 0.104756 14.5852 0.0621907C14.4569 0.0196256 14.3215 0.00283902 14.1868 0.0127967C14.052 0.0227543 13.9205 0.0592596 13.7999 0.120212C13.6793 0.181165 13.572 0.265362 13.484 0.36796L12.4805 1.50725L17.359 5.71439L18.3519 4.56082C18.5289 4.35602 18.6181 4.08969 18.6 3.81958C18.582 3.54948 18.4582 3.29738 18.2555 3.11796Z"
                                    fill="white"
                                />
                            </svg>
                        </router-link>
                        <div class="">
                            <!-- Log in or out -->
                            <a
                                v-if="sessionDetailsStore.isLoggedIn == true"
                                @click="LogOut()"
                                class="btn red-btn"
                                role="button"
                            >
                                Log out&nbsp;&nbsp;
                                <!-- X icon -->
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    width="22"
                                    height="22"
                                    fill="white"
                                >
                                    <path
                                        d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"
                                    />
                                </svg>
                            </a>
                            <a
                                v-else
                                href="/login"
                                class="btn purple-btn"
                                role="button"
                                >Log in</a
                            >
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 px-4 px-md-0 col-lg-4 px-0 px-md-4 px-lg-0">
                <div class="mb-3">
                    <label for="name" class="form-label">Name</label>
                    <input
                        id="name"
                        v-model="name"
                        type="text"
                        class="form-control"
                        readonly
                    />
                </div>
                <div class="mb-3">
                    <label class="form-label">Username</label>
                    <input
                        v-model="userDetailsStore.userName"
                        type="text"
                        class="form-control"
                        readonly
                    />
                </div>
                <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input
                        v-model="userDetailsStore.email"
                        type="email"
                        class="form-control"
                        readonly
                    />
                </div>
                <div v-if="userDetailsStore.role != 'student'" class="mb-3">
                    <label class="form-label">Role</label>
                    <input
                        v-model="userDetailsStore.role"
                        type="text"
                        class="form-control"
                        readonly
                    />
                </div>
                <!-- Student Instructor container -->
                <div v-else class="mb-3">
                    <label class="form-label">Instructor</label>
                    <input
                        type="text"
                        class="form-control"
                        readonly
                        :value="userDetailsStore.instructorUsername"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.red-btn {
    background-color: #e24d4d;
    color: white;
    border: 1px solid #d33622;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
}

.red-btn:hover {
    background-color: #cc3535;
}

#page-tile {
    font-family: 'Poppins' sans-serif;
    font-size: 2.375rem;
    font-weight: 900;
    line-height: 28px;
    letter-spacing: 0em;
    text-align: left;
}

#img-background {
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

.form-control {
    border: 1px solid #f2f4f7;
    box-shadow: 0px 1px 2px 0px #1018280d;
    font-family: 'Poppins' sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0.03em;
    text-align: left;
    color: #667085;
}

/* Mobile */
@media (max-width: 480px) {
    #page-tile {
        text-align: center;
    }
    #img-background {
        margin: auto;
    }
}
</style>
