<script>
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
    methods: {}
};
</script>

<template>
    <div class="container profile-background">
        <!-- Buttons -->
        <div class="row justify-content-end d-flex">
            <router-link
                class="primary-btn btn"
                to="/profile/edit"
                role="button"
                >Edit&nbsp;&nbsp;
                <!-- Pencil icon -->
                <svg
                    width="19"
                    height="20"
                    viewBox="0 0 19 20"
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
        </div>
        <div class="row mt-2">
            <div class="col-12 col-md-6 mb-2">
                <!-- Avatar -->
                <img
                    id="img-background"
                    :src="userDetailsStore.avatar"
                    style="background-color: lightgrey"
                    class="d-none d-lg-block img-fluid"
                />
                <div class="d-flex justify-content-between">
                    <img
                        id="img-background"
                        :src="userDetailsStore.avatar"
                        style="background-color: lightgrey"
                        class="d-lg-none img-fluid"
                    />
                </div>
            </div>
            <div class="col-12 col-md-6 form">
                <div class="mb-3">
                    <h2 class="secondary-heading h4">Full Name</h2>
                    <input
                        v-model="name"
                        type="text"
                        class="form-control"
                        readonly
                    />
                </div>
                <div class="mb-3">
                    <h2 class="secondary-heading h4">Username</h2>
                    <input
                        v-model="userDetailsStore.userName"
                        type="text"
                        class="form-control"
                        readonly
                    />
                </div>
                <div class="mb-3">
                    <h2 class="secondary-heading h4">Email</h2>
                    <input
                        v-model="userDetailsStore.email"
                        type="email"
                        class="form-control"
                        readonly
                    />
                </div>
                <div v-if="userDetailsStore.role != 'student'" class="mb-3">
                    <h2 class="secondary-heading h4">Role</h2>
                    <input
                        v-model="userDetailsStore.role"
                        type="text"
                        class="form-control"
                        readonly
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.profile-background {
    background-color: white;
    border-radius: 10px;
}

#img-background {
    border-radius: 12px;
    max-width: 350px;
    max-height: 350px;
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
    color: black;
}

/* Mobile */
@media (max-width: 480px) {
    #page-tile {
        text-align: center;
    }
}
</style>
