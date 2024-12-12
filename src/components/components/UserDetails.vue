<script>
// Import the stores.
import { useUsersStore } from '../../stores/UsersStore';
import { useUserDetailsStore } from '../../stores/UserDetailsStore';

export default {
    props: ['userId', 'userRole'],
    setup() {
        const usersStore = useUsersStore();
        const userDetailsStore = useUserDetailsStore();

        // Run the GET request.
        if (usersStore.users.length < 1) usersStore.getUsers();
        return {
            usersStore,
            userDetailsStore
        };
    },
    data() {
        return {
            showModal: false
        };
    },
    methods: {}
};
</script>

<template>
    <div id="user-information" class="container mt-4 bg-light">
        <!-- The X for turn off the user details popup windows when on phone view -->
        <div
            class="flex-row-reverse d-flex d-md-none align-items-end mb-2"
            @click="this.$parent.showDetails = false"
        >
            <div id="close-popup-btn">
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0.312625 14.5205L4.83312 9.99999L0.312625 5.49218C0.111396 5.29025 -0.00159545 5.0168 -0.00159545 4.73172C-0.00159545 4.44665 0.111396 4.17319 0.312625 3.97126L3.96282 0.312625C4.16474 0.111396 4.4382 -0.00159545 4.72327 -0.00159545C5.00835 -0.00159545 5.2818 0.111396 5.48373 0.312625L9.99999 4.83312L14.5205 0.312625C14.6204 0.21056 14.7397 0.12947 14.8714 0.0741101C15.003 0.0187502 15.1444 -0.00976563 15.2873 -0.00976562C15.4301 -0.00976563 15.5715 0.0187502 15.7032 0.0741101C15.8349 0.12947 15.9541 0.21056 16.0541 0.312625L19.6874 3.96282C19.8886 4.16474 20.0016 4.4382 20.0016 4.72327C20.0016 5.00835 19.8886 5.2818 19.6874 5.48373L15.1669 9.99999L19.6874 14.5205C19.8883 14.7217 20.0012 14.9944 20.0012 15.2788C20.0012 15.5632 19.8883 15.836 19.6874 16.0372L16.0541 19.6874C15.8529 19.8883 15.5801 20.0012 15.2957 20.0012C15.0113 20.0012 14.7386 19.8883 14.5374 19.6874L9.99999 15.1669L5.49218 19.6874C5.29025 19.8886 5.0168 20.0016 4.73172 20.0016C4.44665 20.0016 4.17319 19.8886 3.97126 19.6874L0.312625 16.0541C0.21056 15.9541 0.12947 15.8349 0.0741101 15.7032C0.0187502 15.5715 -0.00976563 15.4301 -0.00976562 15.2873C-0.00976563 15.1444 0.0187502 15.003 0.0741101 14.8714C0.12947 14.7397 0.21056 14.6204 0.312625 14.5205Z"
                        fill="white"
                    />
                </svg>
            </div>
        </div>
        <div class="row">
            <div class="col-12 col-md-5">
                <img class="img-fluid" :src="this.$parent.user.avatar" />
                <!-- Edit button -->
                <div
                    id="user-function-btns-row"
                    class="d-flex justify-content-center mt-3"
                >
                    <router-link
                        v-if="userDetailsStore.role == 'admin'"
                        :to="'/users/edit/' + this.$parent.user.id"
                        class="btn primary-btn"
                    >
                        Edit&nbsp;
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
                        </svg> </router-link
                    ><span v-if="userDetailsStore.role == 'admin'"
                        >&nbsp;&nbsp;</span
                    >
                    <!-- Delete button -->
                    <button
                        v-if="userDetailsStore.role == 'admin'"
                        class="btn red-btn"
                        @click="showModal = true"
                    >
                        Delete&nbsp;
                        <!-- X icon -->
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M0.312625 14.5205L4.83312 9.99999L0.312625 5.49218C0.111396 5.29025 -0.00159545 5.0168 -0.00159545 4.73172C-0.00159545 4.44665 0.111396 4.17319 0.312625 3.97126L3.96282 0.312625C4.16474 0.111396 4.4382 -0.00159545 4.72327 -0.00159545C5.00835 -0.00159545 5.2818 0.111396 5.48373 0.312625L9.99999 4.83312L14.5205 0.312625C14.6204 0.21056 14.7397 0.12947 14.8714 0.0741101C15.003 0.0187502 15.1444 -0.00976563 15.2873 -0.00976562C15.4301 -0.00976563 15.5715 0.0187502 15.7032 0.0741101C15.8349 0.12947 15.9541 0.21056 16.0541 0.312625L19.6874 3.96282C19.8886 4.16474 20.0016 4.4382 20.0016 4.72327C20.0016 5.00835 19.8886 5.2818 19.6874 5.48373L15.1669 9.99999L19.6874 14.5205C19.8883 14.7217 20.0012 14.9944 20.0012 15.2788C20.0012 15.5632 19.8883 15.836 19.6874 16.0372L16.0541 19.6874C15.8529 19.8883 15.5801 20.0012 15.2957 20.0012C15.0113 20.0012 14.7386 19.8883 14.5374 19.6874L9.99999 15.1669L5.49218 19.6874C5.29025 19.8886 5.0168 20.0016 4.73172 20.0016C4.44665 20.0016 4.17319 19.8886 3.97126 19.6874L0.312625 16.0541C0.21056 15.9541 0.12947 15.8349 0.0741101 15.7032C0.0187502 15.5715 -0.00976563 15.4301 -0.00976562 15.2873C-0.00976563 15.1444 0.0187502 15.003 0.0741101 14.8714C0.12947 14.7397 0.21056 14.6204 0.312625 14.5205Z"
                                fill="white"
                            />
                        </svg>
                    </button>
                </div>
                <!-- Vertical Tree -->
                <router-link
                    v-if="userRole == 'student'"
                    :to="`/student/${this.$parent.user.id}/skill-tree`"
                    class="btn secondary-btn mt-2"
                    target="_blank"
                >
                    Vertical tree
                </router-link>
                <!-- Collapsible skill tree -->
                <router-link
                    v-if="userRole == 'student'"
                    :to="'/student/' + this.$parent.user.id + '/skills'"
                    class="btn secondary-btn mt-2"
                    target="_blank"
                >
                    Collapsible tree
                </router-link>
                <!-- Goals -->
                <router-link
                    v-if="userRole == 'student'"
                    :to="'/student/' + this.$parent.user.id + '/goals'"
                    class="btn secondary-btn mt-2"
                    target="_blank"
                >
                    Goals
                </router-link>
                <div class="d-flex justify-content-center mt-2">
                    <router-link
                        v-if="
                            userDetailsStore.role == 'admin' ||
                            userDetailsStore.role == 'editor'
                        "
                        target="_blank"
                        :to="'/users/activity-report/' + this.$parent.user.id"
                        class="btn primary-btn"
                    >
                        Activity Report
                    </router-link>
                </div>
            </div>
            <div class="col-12 col-md-7">
                <div class="mb-3">
                    <h2 class="secondary-heading h4">First name</h2>
                    <input
                        class="form-control user-input-information"
                        type="text"
                        v-model="this.$parent.user.firstName"
                        disabled
                    />
                </div>
                <div class="mb-3">
                    <h2 class="secondary-heading h4">Last name</h2>
                    <input
                        class="form-control user-input-information"
                        type="text"
                        v-model="this.$parent.user.lastName"
                        disabled
                    />
                </div>
                <div class="mb-3">
                    <h2 class="secondary-heading h4">Username</h2>
                    <input
                        class="form-control user-input-information"
                        type="text"
                        v-model="this.$parent.user.username"
                        disabled
                    />
                </div>
                <div class="mb-3">
                    <h2 class="secondary-heading h4">Email</h2>
                    <input
                        class="form-control user-input-information"
                        type="text"
                        v-model="this.$parent.user.email"
                        disabled
                    />
                </div>
                <div v-if="userDetailsStore.role == 'admin'" class="mb-3">
                    <label class="form-label">Role</label>
                    <input
                        class="form-control user-input-information"
                        type="text"
                        v-model="this.$parent.user.role"
                        disabled
                    />
                </div>

                <div
                    v-if="
                        this.$parent.user.role == 'student' &&
                        userDetailsStore.role == 'admin'
                    "
                    class="mb-3"
                >
                    <h2 class="secondary-heading h4">Instructor</h2>
                    <input
                        class="form-control user-input-information"
                        type="text"
                        v-model="this.$parent.instructor"
                        disabled
                    />
                </div>
            </div>
        </div>
    </div>
    <div v-if="showModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
                <p>Are you sure you want to delete this user?</p>
                <div style="display: flex; gap: 10px">
                    <button
                        type="button"
                        class="btn btn-danger"
                        @click="
                            usersStore.deleteUser(userId);
                            showModal = false;
                            this.$parent.showDetails = false;
                            // Call parent method
                            this.$parent.changeUserToDefault();
                        "
                    >
                        Yes
                    </button>
                    <button
                        type="button"
                        class="btn btn-dark"
                        @click="showModal = false"
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
#user-information {
    border: 1px solid var(--primary-color);
    border-radius: 12px;
    padding: 33px 28px;
    overflow: hidden;
}

#user-information label {
    font-weight: 600;
}

.user-input-information {
    background-color: #fcfcfd !important;
    color: black;
    font-family: 'Poppins' sans-serif;
    font-weight: 400;
    font-size: 1rem;
    padding: 10px, 14px, 10px, 14px;
}

#user-function-btns-row {
    margin-top: 17;
    padding-left: 10px;
    padding-right: 10px;
}
.form-label {
    color: black;
    font-size: 0.875rem;
    font-weight: 600;
    font-family: 'Poppins' sans-serif;
}
.red-btn {
    background-color: #da7033;
    color: white;
    border: 1px solid var(--primary-color);
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
}

.red-btn:hover {
    background-color: rgb(209, 96, 15);
}
.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
}

.green-btn > svg {
    margin-left: 15px;
}

.green-btn:hover {
    background-color: #2ca695;
}

#close-popup-btn {
    border-radius: 20px;
    background-color: #36c1af;
    padding: 7px 10px;
}

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
    background-color: rgb(0, 0, 0);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
}

.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 300px;
    /* Could be more or less, depending on screen size */
}

/* Mobile */
@media (max-width: 480px) {
    #user-information {
        border-radius: 0px;
        padding-bottom: 0px;
    }
}

/* Tablets */
@media (min-width: 481px) and (max-width: 1024px) {
    #user-information {
        padding-left: 10px;
        padding-right: 10px;
        padding-bottom: 15px;
        margin-right: 10px;
        margin-bottom: 10px;
    }

    #user-function-btns-row {
        margin-top: 17;
        padding-left: 10px;
        padding-right: 10px;
        flex-direction: column;
    }

    .green-btn {
        margin-left: 10px !important;
        margin-right: auto !important;
    }
}

@media (min-width: 1025px) {
    #user-information {
        margin-left: auto;
        margin-right: auto;
        width: 90%;
    }
}
</style>
