<script>
// Import the stores.
import { useUsersStore } from '../../stores/UsersStore';

// Components
import UserFlagActions from '../components/UserFlagActions.vue';
import UserResourceActions from '../components/UserResourceActions.vue';
import UserQuestionActions from '../components/UserQuestionActions.vue';
import UserSkillActions from '../components/UserSkillActions.vue';
import UserStudentMcQuestionActions from '../components/UserStudentMcQuestionActions.vue';

export default {
    setup() {
        const usersStore = useUsersStore();
        return {
            usersStore
        };
    },
    data() {
        return {
            user: {
                id: this.$route.params.id,
                firstName: null,
                lastName: null,
                username: null,
                role: null,
                avatar: null
            },
            showFlags: false,
            showSources: false,
            showMcQuestions: false,
            showStudentMcQuestions: false,
            showSkills: false,
            mcQuestions: [],
            resources: [],
            flags: [],
            skillEdits: []
        };
    },
    components: {
        UserFlagActions,
        UserResourceActions,
        UserQuestionActions,
        UserStudentMcQuestionActions,
        UserSkillActions
    },
    async created() {
        // Get the user's details.
        await this.getUserDetails();
    },
    methods: {
        async getUserDetails() {
            // Populate the user details.
            if (this.usersStore.users.length < 1)
                await this.usersStore.getUsers();
            for (let i = 0; i < this.usersStore.users.length; i++) {
                if (this.usersStore.users[i].id == this.user.id) {
                    this.user.firstName = this.usersStore.users[i].first_name;
                    this.user.lastName = this.usersStore.users[i].last_name;
                    this.user.username = this.usersStore.users[i].username;
                    this.user.role = this.usersStore.users[i].role;
                    this.user.avatar = this.usersStore.users[i].avatar;
                }
            }
        }
    }
};
</script>

<template>
    <div class="container">
        <div class="mt-4 mb-4">
            <h1>User Activity Report</h1>
        </div>
        <!-- User Details -->
        <div class="row">
            <div class="d-flex flex-column flex-md-row gap-3">
                <img id="activity-report-user-avatar" :src="user.avatar" />
                <div class="d-flex flex-column">
                    <div id="user-name">{{ user.username }}</div>
                    <div id="role">{{ user.role }}</div>
                </div>
            </div>
        </div>
        <!------- Logging sections ------->
        <div>
            <!-- Flags -->
            <div class="d-flex flex-column">
                <div class="d-flex flex-row justify-content-between">
                    <div
                        class="log-type"
                        @click="showFlags = !showFlags"
                        b-on-hover
                        :title="showFlags ? 'collapse' : 'expand'"
                    >
                        <span> Flags </span>
                        <!-- Arrow Icon -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 320 512"
                            width="22"
                            height="22"
                            fill="#667085"
                            :class="[
                                showFlags
                                    ? 'arrow-point-down mb-2'
                                    : 'arrow-point-up '
                            ]"
                        >
                            <path
                                d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"
                            />
                        </svg>
                    </div>
                </div>
                <transition name="dropdown">
                    <div v-if="showFlags">
                        <UserFlagActions
                            ref="contentFlagsPerUser"
                            :userId="user.id"
                            @close-flag-div="showFlags = false"
                        />
                    </div>
                </transition>
            </div>
            <hr class="mt-5 mb-3" />

            <!-- Questions -->
            <!-- Only show Questions log if user is admin  -->
            <div v-if="user.role === 'admin'" class="d-flex flex-column">
                <div class="d-flex flex-row justify-content-between">
                    <div
                        class="log-type"
                        @click="showMcQuestions = !showMcQuestions"
                        b-on-hover
                        :title="showMcQuestions ? 'collapse' : 'expand'"
                    >
                        <span>Questions </span>
                        <!-- Arrow Icon -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 320 512"
                            width="22"
                            height="22"
                            fill="#667085"
                            :class="[
                                showMcQuestions
                                    ? 'arrow-point-down mb-2'
                                    : 'arrow-point-up'
                            ]"
                        >
                            <path
                                d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"
                            />
                        </svg>
                    </div>
                </div>
                <Transition name="dropdown">
                    <div v-if="showMcQuestions">
                        <UserQuestionActions
                            :userId="user.id"
                            @close-mc-question-div="showMcQuestions = false"
                        />
                    </div>
                </Transition>
            </div>
            <hr v-if="user.role === 'admin'" class="mt-5 mb-3" />

            <!-- Student Mc Questions -->
            <div class="d-flex flex-column">
                <div class="d-flex flex-row justify-content-between">
                    <div
                        class="log-type"
                        @click="
                            showStudentMcQuestions = !showStudentMcQuestions
                        "
                        b-on-hover
                        :title="showStudentMcQuestions ? 'collapse' : 'expand'"
                    >
                        <span>Student MC Questions </span>
                        <!-- Arrow Icon -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 320 512"
                            width="22"
                            height="22"
                            fill="#667085"
                            :class="[
                                showStudentMcQuestions
                                    ? 'arrow-point-down mb-2'
                                    : 'arrow-point-up'
                            ]"
                        >
                            <path
                                d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"
                            />
                        </svg>
                    </div>
                </div>
                <Transition name="dropdown">
                    <div v-if="showStudentMcQuestions">
                        <UserStudentMcQuestionActions
                            :userId="user.id"
                            @close-mc-question-div="
                                showStudentMcQuestions = false
                            "
                        />
                    </div>
                </Transition>
            </div>
            <hr class="mt-5 mb-3" />

            <!-- Resources -->
            <div class="d-flex flex-column">
                <div class="d-flex flex-row justify-content-between">
                    <div
                        class="log-type"
                        @click="showSources = !showSources"
                        b-on-hover
                        :title="showSources ? 'collapse' : 'expand'"
                    >
                        <span> Resources </span>
                        <!-- Arrow Icon -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 320 512"
                            width="22"
                            height="22"
                            fill="#667085"
                            :class="[
                                showSources
                                    ? 'arrow-point-down mb-2'
                                    : 'arrow-point-up '
                            ]"
                        >
                            <path
                                d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"
                            />
                        </svg>
                    </div>
                </div>
                <transition name="dropdown">
                    <div v-if="showSources">
                        <UserResourceActions
                            :userId="user.id"
                            @close-resource-div="showSources = false"
                        />
                    </div>
                </transition>
            </div>
            <hr class="mt-5 mb-3" />

            <!-- Skills  -->
            <div class="d-flex flex-column">
                <div class="d-flex flex-row justify-content-between">
                    <div
                        class="log-type"
                        @click="showSkills = !showSkills"
                        b-on-hover
                        :title="showSkills ? 'collapse' : 'expand'"
                    >
                        <span> Skills </span>
                        <!-- Arrow Icon -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 320 512"
                            width="22"
                            height="22"
                            fill="#667085"
                            :class="[
                                showSkills
                                    ? 'arrow-point-down mb-2'
                                    : 'arrow-point-up '
                            ]"
                        >
                            <path
                                d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"
                            />
                        </svg>
                    </div>
                </div>
                <transition name="dropdown">
                    <div v-if="showSkills">
                        <UserSkillActions
                            :userId="user.id"
                            @close-resource-div="showSkills = false"
                        />
                    </div>
                </transition>
            </div>
            <hr class="mt-5 mb-3" />
        </div>

        <!-- Skills -->
        <!-- <div class="row">
            <button type="button" @click="showSkills = !showSkills">
                <h2>Skills</h2>
            </button>
            <div :class="{ 'd-none': !showSkills }">
                <ul>
                    <li v-for="skillEdit in skillEdits">
                        <span v-if="skillEdit.type == 'edit'">Edited </span>
                        <span v-else-if="skillEdit.type == 'delete'"
                            >Deleted
                        </span>
                        <span v-else-if="skillEdit.type == 'create'"
                            >Created
                        </span>
                        <RouterLink
                            :to="'/skills/' + skillEdit.skill_id"
                            target="_blank"
                        >
                            {{ skillEdit.skill_name }}
                        </RouterLink>
                        , {{ skillEdit.date }}
                    </li>
                </ul>
            </div>
        </div> -->
    </div>
</template>

<style>
/* User details section */
#activity-report-user-avatar {
    width: 135px;
    height: 135px;
    border-radius: 12px;
}

#user-name {
    font-size: 20px;
    font-weight: 660;
    font-family: 'Poppins', sans-serif;
    color: #667085;
}

#role {
    color: #667085;
    margin-left: 2px;
}

.log-type {
    color: #667085;
    font-size: 18px;
    font-weight: 550;
    margin-top: 20px;
    width: fit-content;
}

.skill-modal-text {
    font-style: italic;
    color: #1f57c3;
    background-color: #f9f9f9;
    border-radius: 15px;
    padding: 5px 15px;
}

.log-type:hover {
    cursor: pointer;
}

/* === Buttons Styling === */
.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    display: flex;
    align-items: center;
    height: auto;
    align-items: center;
    justify-content: center;
}

.green-btn:hover {
    background-color: #3eb3a3;
    color: white;
}

/* === End of Buttons Styling === */

/* +-+-+ Rotate Arrow Animation +-+-+  */
.arrow-point-down {
    animation: rotation 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

.arrow-point-up {
    animation: rotationBack 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes rotation {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(180deg);
    }
}

@keyframes rotationBack {
    from {
        transform: rotate(180deg);
    }

    to {
        transform: rotate(0deg);
    }
}

/* +-+-+ Rotate Arrow Animation +-+-+  */
@keyframes slide {
    0% {
        opacity: 0;
        transform: scaleY(0);
    }

    100% {
        opacity: 1;
        transform: scaleY(1);
    }
}

.dropdown-enter-active {
    transform-origin: top center;
    animation: slide 0.5s;
}
.dropdown-leave-active {
    transform-origin: top center;
    animation: slide 0.5s reverse;
}

/* Style for component that shared among children */
.main-container {
    background-color: #e4ecf4;
    border-radius: 5px;
    padding: 15px 20px;
}

.skill-link {
    text-decoration: none;
    color: #667085;
    font-weight: 500;
}

.skill-link:hover {
    color: #5b7dcc;
    cursor: pointer;
}

.question-link {
    margin-left: 5px;
    margin-right: 5px;
    font-weight: 400;
    text-decoration: none;
    color: #667085;
}

.question-link:hover {
    color: #5b7dcc;
    cursor: pointer;
}

.user-link {
    font-weight: 400;
    text-decoration: none;
    color: #6c93ee;
}

/* Color code for actions */
.create-action {
    color: green;
}

.update-action {
    color: blue;
}

.delete-action {
    color: red;
}

.bulk-create-action {
    color: #5b7dcc;
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

#add-resource-column {
    padding-right: 0px !important;
    margin-right: 0px !important;
}

/* Modal Content/Box */
.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 300px;
    /* Could be more or less, depending on screen size */
}

.modal-btn {
    width: 25%;
}

.modal-label {
    font-size: 18px;
    font-family: 'Poppins', sans-serif;
}
/* End of Warning modal styling */

/* Shake animation for waring line */
.shake {
    animation: shake 0.62s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
    color: rgb(209, 184, 41);
}

@keyframes shake {
    10%,
    90% {
        transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
        transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
        transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
        transform: translate3d(4px, 0, 0);
    }
}

/* ++--++ */
</style>
