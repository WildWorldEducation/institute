<script>
// Import the stores.
import { useUsersStore } from '../../stores/UsersStore';
import { useUserDetailsStore } from '../../stores/UserDetailsStore';

export default {
    props: ['userId', 'userRole'],
    setup(props) {
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
    computed: {},
    methods: {}
};
</script>

<template>
    <div id="user-information" class="container mt-4">
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
            <div class="col-12 col-md-5 col-lg-4 d-flex flex-column">
                <img id="user-avatar" :src="this.$parent.user.avatar" />
                <div
                    id="user-function-btns-row"
                    class="d-flex justify-content-center mt-3"
                >
                    <router-link
                        v-if="userDetailsStore.role == 'admin'"
                        :to="'/users/edit/' + this.$parent.user.id"
                        class="btn purple-btn"
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

                <router-link
                    v-if="userRole == 'student'"
                    :to="`/student/${this.$parent.user.id}/skill-tree`"
                    class="btn green-btn mx-auto mt-3"
                >
                    Skill tree
                    <!-- skill tree icon -->
                    <svg
                        width="21"
                        height="20"
                        viewBox="0 0 21 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M10.5 0C8.52219 0 6.58879 0.58649 4.9443 1.6853C3.29981 2.78412 2.01809 4.3459 1.26121 6.17317C0.504333 8.00043 0.306299 10.0111 0.692152 11.9509C1.078 13.8907 2.03041 15.6725 3.42894 17.0711C4.82746 18.4696 6.60929 19.422 8.5491 19.8079C10.4889 20.1937 12.4996 19.9957 14.3268 19.2388C16.1541 18.4819 17.7159 17.2002 18.8147 15.5557C19.9135 13.9112 20.5 11.9778 20.5 10C20.5 7.34784 19.4464 4.8043 17.5711 2.92893C15.6957 1.05357 13.1522 0 10.5 0ZM11.0217 6.10609C11.0636 6.08664 11.1089 6.07571 11.155 6.07394C11.2011 6.07217 11.2471 6.07959 11.2903 6.09578C11.3336 6.11196 11.3731 6.13659 11.4067 6.16821C11.4403 6.19984 11.4673 6.23784 11.4861 6.28C11.4861 6.29913 11.66 6.62783 11.9574 6.62783C12.2548 6.62783 12.4791 6.26261 12.4791 6.25739C12.5232 6.17529 12.598 6.11405 12.6872 6.08714C12.7764 6.06023 12.8727 6.06986 12.9548 6.11391C13.0369 6.15796 13.0981 6.23282 13.125 6.32202C13.1519 6.41123 13.1423 6.50746 13.0983 6.58957C12.9522 6.86435 12.547 7.33044 11.9522 7.33044C11.7142 7.32013 11.4839 7.24329 11.2875 7.10863C11.091 6.97397 10.9363 6.78691 10.8409 6.5687C10.8217 6.52683 10.8111 6.48158 10.8096 6.43558C10.8081 6.38958 10.8157 6.34373 10.8321 6.3007C10.8484 6.25767 10.8731 6.21832 10.9048 6.18491C10.9365 6.1515 10.9744 6.12471 11.0165 6.10609H11.0217ZM8.07392 6.10609C8.11568 6.08691 8.16082 6.07619 8.20675 6.07456C8.25267 6.07294 8.29847 6.08042 8.34148 6.09659C8.3845 6.11276 8.42388 6.1373 8.45736 6.16878C8.49084 6.20026 8.51774 6.23806 8.53653 6.28C8.54696 6.29913 8.71044 6.62783 9.00783 6.62783C9.30522 6.62783 9.52957 6.26261 9.52957 6.25739C9.57362 6.17529 9.64848 6.11405 9.73768 6.08714C9.82688 6.06023 9.92312 6.06986 10.0052 6.11391C10.0873 6.15796 10.1486 6.23282 10.1755 6.32202C10.2024 6.41123 10.1927 6.50746 10.1487 6.58957C10.0026 6.86435 9.59566 7.33044 9.00087 7.33044C8.76298 7.31993 8.53278 7.24301 8.33637 7.10837C8.13995 6.97374 7.98517 6.78679 7.88957 6.5687C7.87055 6.52662 7.8601 6.48117 7.85883 6.43501C7.85756 6.38885 7.86549 6.34291 7.88217 6.29984C7.89884 6.25678 7.92392 6.21747 7.95595 6.18421C7.98797 6.15094 8.0263 6.12438 8.0687 6.10609H8.07392ZM14.6635 6.64C14.5922 6.74783 12.9244 9.28 10.3157 9.28H10.253C7.58696 9.23652 6.36783 6.70609 6.3174 6.59826C6.27773 6.51385 6.27322 6.41714 6.30485 6.32941C6.33649 6.24168 6.40168 6.1701 6.48609 6.13043C6.5705 6.09077 6.66721 6.08626 6.75494 6.11789C6.84268 6.14953 6.91425 6.21472 6.95392 6.29913C6.96435 6.32174 8.04261 8.54087 10.2583 8.57739H10.3104C12.5435 8.57739 14.053 6.28174 14.0652 6.26087C14.0903 6.22204 14.1229 6.18855 14.1609 6.16229C14.199 6.13603 14.2419 6.11753 14.2871 6.10784C14.3323 6.09815 14.379 6.09747 14.4245 6.10582C14.47 6.11417 14.5134 6.1314 14.5522 6.15652C14.591 6.18164 14.6245 6.21417 14.6508 6.25224C14.677 6.2903 14.6955 6.33317 14.7052 6.37839C14.7149 6.42361 14.7156 6.47029 14.7072 6.51578C14.6989 6.56126 14.6816 6.60465 14.6565 6.64348L14.6635 6.64Z"
                            fill="white"
                        />
                    </svg>
                </router-link>
                <router-link
                    v-if="userRole == 'student'"
                    :to="'/student/' + this.$parent.user.id + '/skills'"
                    class="btn green-btn mx-auto mt-3"
                >
                    Skill list
                </router-link>
                <div class="d-flex justify-content-center mt-2">
                    <router-link
                        v-if="userDetailsStore.role == 'admin'"
                        target="_blank"
                        :to="'/users/activity-report/' + this.$parent.user.id"
                        class="btn purple-btn"
                    >
                        Activity Report
                    </router-link>
                </div>
            </div>
            <div id="user-form-info" class="col-12 col-md-6">
                <div class="mb-3">
                    <label class="form-label">First name</label>
                    <input
                        class="form-control user-input-information"
                        type="text"
                        v-model="this.$parent.user.firstName"
                        disabled
                    />
                </div>
                <div class="mb-3">
                    <label class="form-label">Last name</label>
                    <input
                        class="form-control user-input-information"
                        type="text"
                        v-model="this.$parent.user.lastName"
                        disabled
                    />
                </div>
                <div class="mb-3">
                    <label class="form-label">Username</label>
                    <input
                        class="form-control user-input-information"
                        type="text"
                        v-model="this.$parent.user.username"
                        disabled
                    />
                </div>
                <div class="mb-3">
                    <label class="form-label">Email</label>
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
                    <label class="form-label">Instructor</label>
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
    background-color: #e4ecf4;
    border-radius: 12px;
    padding: 33px 28px;
}

#user-information label {
    font-weight: 600;
}

#user-avatar {
    width: 269px;
    height: 269px;
    margin-left: auto;
    margin-right: auto;
    border-radius: 12px;
}

.user-input-information {
    background-color: #fcfcfd !important;
    color: #667085;
    font-family: 'Poppins' sans-serif;
    font-weight: 400;
    font-size: 1rem;
    padding: 10px, 14px, 10px, 14px;
}

#user-form-info {
    margin-left: auto;
    margin-right: auto;
}

#user-function-btns-row {
    margin-top: 17;
    padding-left: 10px;
    padding-right: 10px;
}
.form-label {
    color: #344054;
    font-size: 0.875rem;
    font-weight: 600;
    font-family: 'Poppins' sans-serif;
}
.red-btn {
    background-color: #da7033;
    color: white;
    border: 1px solid #7f56d9;
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

.purple-btn {
    background-color: #a48be6;
    color: white;
    border: 1px solid #7f56d9;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
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
    #user-avatar {
        width: 180px;
        height: 180px;
        margin-left: auto;
        margin-right: auto;
        border-radius: 12px;
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

    #user-avatar {
        width: 169px;
        height: 169px;
        margin-left: auto;
        margin-right: auto;
        border-radius: 12px;
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
</style>
