<script>
// import components.
import LastVisitedSkills from '../components/hub-components/LastVisitedSkills.vue';
import Goals from '../components/hub-components/Goals.vue';
import RecommendedSkillsGenerator from '../components/hub-components/RecommendedSkillsGenerator.vue';
// Import store.
import { useUserDetailsStore } from '../../stores/UserDetailsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        // Run the GET request.
        userDetailsStore.getUserDetails();
        return {
            userDetailsStore
        };
    },
    data() {
        return {
            showWelcomeModal: false, // Modal to ask for tutorial preference
            isTutorialComplete: false,
            showTutorialTip1: false,
            showTutorialTip2: false,
            showTutorialTip3: false,
            showTutorialTip4: false
        };
    },
    components: {
        LastVisitedSkills,
        Goals,
        RecommendedSkillsGenerator
    },
    computed: {
        name() {
            return (
                this.userDetailsStore.firstName +
                ' ' +
                this.userDetailsStore.lastName
            );
        }
    },
    async created() {
        this.checkIfTutorialComplete();
    },
    methods: {
        // Tutorial
        async checkIfTutorialComplete() {
            try {
                const result = await fetch(
                    '/users/check-tutorial-progress/hub/' +
                        this.userDetailsStore.userId
                );
                const data = await result.json();

                if (data === 0 && this.userDetailsStore.role != 'student') {
                    this.showWelcomeModal = true;
                } else if (
                    data === 0 &&
                    this.userDetailsStore.role == 'student'
                ) {
                    this.showTutorialTip1 = true;
                } else if (data === 1) {
                    this.isTutorialComplete = true;
                }
            } catch (error) {
                console.error('Error checking tutorial progress:', error);
            }
        },
        progressTutorial(step) {
            if (step == 1) {
                this.showTutorialTip1 = false;
                this.showTutorialTip2 = true;
            } else if (step == 2) {
                this.showTutorialTip2 = false;
                this.showTutorialTip3 = true;
            } else if (step == 3) {
                this.showTutorialTip3 = false;
                this.showTutorialTip4 = true;
            } else if (step == 4) {
                this.showTutorialTip4 = false;
                this.markTutorialComplete();
            }
        },
        markTutorialComplete() {
            let url =
                '/users/mark-tutorial-complete/hub/' +
                this.userDetailsStore.userId;
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            };
            fetch(url, requestOptions);
        },
        async startTutorial() {
            // Show the tutorial tooltips and mark tutorial as not complete
            this.showTutorialTip1 = true;
            this.isTutorialComplete = false;
            this.showWelcomeModal = false;
            // Reset tutorial fields for the user
            await this.resetTutorialProgress();
        },
        async resetTutorialProgress() {
            try {
                await fetch(
                    `/users/reset-all-tutorials/${this.userDetailsStore.userId}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } catch (error) {
                console.error('Error resetting tutorials:', error);
            }
        },
        async closeTutorial() {
            // Close the welcome modal
            this.showWelcomeModal = false;
            // Mark all tutorials as complete
            await this.markAllTutorialsComplete();
        },
        restartTutorial() {
            this.startTutorial();
        },
        async markAllTutorialsComplete() {
            try {
                const response = await fetch(
                    `/users/mark-all-tutorials-complete/${this.userDetailsStore.userId}`,
                    {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
                if (response.ok) {
                    this.isTutorialComplete = true;
                } else {
                    console.error('Error marking tutorials as complete.');
                }
            } catch (error) {
                console.error('API request failed:', error);
            }
        }
    }
};
</script>

<template>
    <!-- Tutorial button -->
    <div class="container-fluid d-flex justify-content-end my-1">
        <button class="btn" @click="restartTutorial">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 192 512"
                width="20"
                height="20"
                class="primary-icon"
            >
                <!-- !Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                <path
                    d="M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 224 32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0 0-192-32 0c-17.7 0-32-14.3-32-32z"
                />
            </svg>
        </button>
    </div>

    <div class="container min-vh-100">
        <!-- Generate recommended skills bar -->
        <div class="row mb-5">
            <div class="col">
                <RecommendedSkillsGenerator />
                <!-- Tooltip -->
                <div
                    v-if="
                        showTutorialTip2 && userDetailsStore.role == 'student'
                    "
                    class="info-panel bg-light rounded p-2 mt-2"
                >
                    <p>Type a career or skill here to get recommendations.</p>
                    <button
                        class="btn primary-btn"
                        @click="progressTutorial(2)"
                    >
                        next
                    </button>
                </div>
            </div>
        </div>
        <!--  Mark Assessments, 
          Last Visited Skills / Student Suggested Questions,
          Goals -->
        <div class="row">
            <!--  Last Visited Skills / Mark Assessments -->
            <div class="col-md-6 mb-2">
                <div class="h-100">
                    <!-- Tooltip -->
                    <div
                        v-if="
                            showTutorialTip3 &&
                            userDetailsStore.role == 'student'
                        "
                        class="info-panel bg-light rounded p-2 mb-2"
                    >
                        <p>
                            This section shows your the last 5 skill pages you
                            visited.
                        </p>
                        <button
                            class="btn primary-btn"
                            @click="progressTutorial(3)"
                        >
                            next
                        </button>
                    </div>
                    <LastVisitedSkills
                        v-if="userDetailsStore.role == 'student'"
                        :userId="userDetailsStore.userId"
                    />
                </div>
            </div>
            <!-- Goals / Student Suggested Questions -->
            <div
                v-if="userDetailsStore.role == 'student'"
                class="col-md-6 mb-2"
            >
                <div class="h-100">
                    <!-- Tooltip -->
                    <div
                        v-if="
                            showTutorialTip4 &&
                            userDetailsStore.role == 'student'
                        "
                        class="info-panel bg-light rounded p-2 mb-2"
                    >
                        <p>This section shows any goals you might have made.</p>
                        <p>
                            You can make a goal when there is a skill you want
                            to master but it is not unlocked yet.
                        </p>
                        <button
                            class="btn primary-btn"
                            @click="progressTutorial(4)"
                        >
                            close
                        </button>
                    </div>
                    <Goals />
                </div>
            </div>
        </div>
    </div>

    <!-- Onboarding tooltip modals -->
    <div v-if="showWelcomeModal" class="modal">
        <div class="modal-content">
            <h1 class="heading h3">Welcome to the Collins Institute</h1>
            <p>Would you like to go through the tutorial?</p>
            <p>
                You can start or restart it anytime by clicking the "i" button
                on any page.
            </p>
            <div class="d-flex justify-content-between">
                <button class="btn red-btn mx-0" @click="closeTutorial">
                    No
                </button>
                <button class="btn primary-btn mx-0" @click="startTutorial">
                    Yes
                </button>
            </div>
        </div>
    </div>
    <!-- Student -->
    <div
        v-if="userDetailsStore.role == 'student' && showTutorialTip1"
        class="modal"
    >
        <div
            v-if="showTutorialTip1 && userDetailsStore.role == 'student'"
            class="modal-content"
        >
            <!-- Student -->
            <div>
                <p>This is your hub page.</p>
                <button class="btn primary-btn" @click="progressTutorial(1)">
                    next
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Tooltips */
.info-panel {
    border-color: var(--primary-color);
    border-width: 2px;
    border-style: solid;
    width: fit-content;
}

/* Modals */
.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 2000;
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

/* Modal Content/Box */
.modal-content {
    background-color: #fefefe;
    margin: 5% auto;
    /* 5% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    max-width: 520px;
    font-size: 18px;
    /* Could be more or less, depending on screen size */
}

/* Small devices (portrait phones) */
@media (max-width: 480px) {
    /* Modal Content/Box */
    .modal-content {
        width: 90%;
        margin-top: 5%;
    }
}
</style>
