<script>
// Import the stores.
import { useUsersStore } from '../../stores/UsersStore';
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';
// Components
import UserFlagActions from '../components/user-activity-report/UserFlagActions.vue';
import UserResourceActions from '../components/user-activity-report/UserResourceActions.vue';
import UserQuestionActions from '../components/user-activity-report/UserQuestionActions.vue';
import UserSkillActions from '../components/user-activity-report/UserSkillActions.vue';
import UserStudentMcQuestionActions from '../components/user-activity-report/UserStudentMcQuestionActions.vue';
import UserSkillAwaitingForApprovalActions from '../components/user-activity-report/UserSkillAwaitingForApprovalActions.vue';

export default {
    setup() {
        const usersStore = useUsersStore();
        const userDetailsStore = useUserDetailsStore();
        return {
            usersStore,
            userDetailsStore
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
            showSkillSubmittedByUsers: false,
            mcQuestions: [],
            resources: [],
            flags: [],
            skillEdits: [],
            // Tutorial tooltips
            isTutorialComplete: false,
            showTutorialTip1: false
        };
    },
    components: {
        UserFlagActions,
        UserResourceActions,
        UserQuestionActions,
        UserStudentMcQuestionActions,
        UserSkillActions,
        UserSkillAwaitingForApprovalActions
    },
    async created() {
        // Get the user's details.
        await this.getUserDetails();
        this.checkIfTutorialComplete();
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
        },
        // Tutorial
        async checkIfTutorialComplete() {
            const result = await fetch(
                '/users/check-tutorial-progress/user-activity-report/' +
                    this.userDetailsStore.userId
            );
            const data = await result.json();
            if (data == 0) {
                this.isTutorialComplete = false;
                this.showTutorialTip1 = true;
            } else if (data == 1) {
                this.isTutorialComplete = true;
            }
        },
        progressTutorial(step) {
            if (step == 1) {
                this.showTutorialTip1 = false;
                this.markTutorialComplete();
            }
        },
        restartTutorial() {
            this.showTutorialTip1 = true;
            this.isTutorialComplete = false;
        },
        markTutorialComplete() {
            let url =
                '/users/mark-tutorial-complete/user-activity-report/' +
                this.userDetailsStore.userId;
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            };
            fetch(url, requestOptions);
        }
    }
};
</script>

<template>
    <div class="container bg-light rounded p-3">
        <div class="d-flex justify-content-between">
            <h1 class="heading mb-2">User Activity Report</h1>
            <button class="btn primary-btn" @click="restartTutorial">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 192 512"
                    width="20"
                    height="20"
                    fill="white"
                >
                    <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                    <path
                        d="M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 224 32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0 0-192-32 0c-17.7 0-32-14.3-32-32z"
                    />
                </svg>
            </button>
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
                        <h2 class="secondary-heading h4">
                            Flags
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
                        </h2>
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

            <!-- Questions -->
            <!-- Only show Questions log if user is admin  -->
            <div class="d-flex flex-column">
                <div class="d-flex flex-row justify-content-between">
                    <div
                        class="log-type"
                        @click="showMcQuestions = !showMcQuestions"
                        b-on-hover
                        :title="showMcQuestions ? 'collapse' : 'expand'"
                    >
                        <h2 class="secondary-heading h4">
                            Questions
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
                        </h2>
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

            <!-- Student Suggested MC Questions -->
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
                        <h2 class="secondary-heading h4">
                            Student Suggested MC Questions
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
                        </h2>
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

            <!-- Sources -->
            <div class="d-flex flex-column">
                <div class="d-flex flex-row justify-content-between">
                    <div
                        class="log-type"
                        @click="showSources = !showSources"
                        b-on-hover
                        :title="showSources ? 'collapse' : 'expand'"
                    >
                        <h2 class="secondary-heading h4">
                            Sources
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
                        </h2>
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

            <!-- Skills  -->
            <div class="d-flex flex-column">
                <div class="d-flex flex-row justify-content-between">
                    <div
                        class="log-type"
                        @click="showSkills = !showSkills"
                        b-on-hover
                        :title="showSkills ? 'collapse' : 'expand'"
                    >
                        <h2 class="secondary-heading h4">
                            Skills
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
                        </h2>
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

            <!-- Skills  -->
            <div class="d-flex flex-column mb-3">
                <div class="d-flex flex-row justify-content-between">
                    <div
                        class="log-type"
                        @click="
                            showSkillSubmittedByUsers =
                                !showSkillSubmittedByUsers
                        "
                        b-on-hover
                        :title="
                            showSkillSubmittedByUsers ? 'collapse' : 'expand'
                        "
                    >
                        <h2 class="secondary-heading h4">
                            User Suggested New Skills
                            <!-- Arrow Icon -->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 320 512"
                                width="22"
                                height="22"
                                fill="#667085"
                                :class="[
                                    showSkillSubmittedByUsers
                                        ? 'arrow-point-down mb-2'
                                        : 'arrow-point-up '
                                ]"
                            >
                                <path
                                    d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"
                                />
                            </svg>
                        </h2>
                    </div>
                </div>
                <transition name="dropdown">
                    <div v-if="showSkillSubmittedByUsers">
                        <UserSkillAwaitingForApprovalActions
                            :userId="user.id"
                            @close-resource-div="
                                showSkillSubmittedByUsers = false
                            "
                        />
                    </div>
                </transition>
            </div>
        </div>
    </div>

    <!-- Editor Introduction modal -->
    <div v-if="showTutorialTip1" class="modal">
        <div class="modal-content">
            <div v-if="showTutorialTip1">
                <p>This is the User Activity List page.</p>
                <p>It shows what editors have been up to on the site.</p>

                <button class="btn primary-btn" @click="progressTutorial(1)">
                    next
                </button>
            </div>
        </div>
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
    color: var(--primary-color);
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 3px 10px;
    font-weight: 400;
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
    display: inline;
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
    color: var(--primary-color);
    cursor: pointer;
}

.user-link {
    font-weight: 400;
    text-decoration: none;
    color: var(--primary-color);
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

.edit-and-approve-action {
    color: rgb(5, 59, 5);
}

.approve-action {
    color: #0e5e53;
}

.submit_update_for_review {
    color: #71630a;
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
    font-weight: 500;
    color: #667085;
    text-align: center;
    margin-bottom: 10px;
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

.skill-modal {
    width: 580px !important;
}

/* Tablet and phone Styling */
@media (max-width: 1023px) {
    .skill-modal {
        width: 100% !important;
    }

    .modal-content {
        top: 25%;
    }
}

/* Small devices (portrait phones) */
@media (max-width: 480px) {
    /* Modal Content/Box */
    .modal-content {
        width: 90%;
        margin-top: 30%;
    }
}
</style>
