<script>
// import components.
import StudentProgress from '../components/hub-components/StudentProgress.vue';
import LastVisitedSkills from '../components/hub-components/LastVisitedSkills.vue';
import Goals from '../components/hub-components/Goals.vue';
import MarkAssessment from '../components/hub-components/MarkAssessment.vue';
import HubStudentQuestionList from '../components/hub-components/HubStudentQuestionList.vue';

import PathwayGenerator from '../components/hub-components/PathwayGenerator.vue';

// Import store.
import { useUserDetailsStore } from '../../stores/UserDetailsStore';
import { useAssessmentsStore } from '../../stores/AssessmentsStore.js';
import { useUsersStore } from '../../stores/UsersStore.js';
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useInstructorStudentsStore } from '../../stores/InstructorStudentsStore.js';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const assessmentsStore = useAssessmentsStore();
        const usersStore = useUsersStore();
        const skillsStore = useSkillsStore();
        const instructorStudentsStore = useInstructorStudentsStore();
        // Run the GET request.
        userDetailsStore.getUserDetails();
        return {
            userDetailsStore,
            assessmentsStore,
            usersStore,
            skillsStore,
            instructorStudentsStore
        };
    },
    data() {
        return {
            showWelcomeModal: false, // Modal to ask for tutorial preference
            assessments: [],
            questions: [],
            studentIds: [],
            isTutorialComplete: false,
            showTutorialTip1: false,
            showTutorialTip2: false,
            showTutorialTip3: false,
            showTutorialTip4: false,
            showTutorialTip5: false
        };
    },
    components: {
        StudentProgress,
        MarkAssessment,
        LastVisitedSkills,
        Goals,
        HubStudentQuestionList,
        PathwayGenerator
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

        if (this.userDetailsStore.role == 'instructor') {
            await this.fetchAssessments();
            await this.getStudentMCQuestions();
        }
    },
    methods: {
        async fetchAssessments() {
            // Create the assessments array ---------------------------------
            // Get unmarked assessments if there no assessment store before
            await this.assessmentsStore.getAssessments();

            // Get the instructor student list, if not yet loaded.
            if (
                this.instructorStudentsStore.instructorStudentsList.length == 0
            ) {
                await this.instructorStudentsStore.getInstructorStudentsList();
            }

            // Just get the students that this instructors teaches.
            for (
                let i = 0;
                i < this.instructorStudentsStore.instructorStudentsList.length;
                i++
            ) {
                if (
                    this.userDetailsStore.userId ==
                    this.instructorStudentsStore.instructorStudentsList[i]
                        .instructor_id
                ) {
                    this.studentIds.push(
                        this.instructorStudentsStore.instructorStudentsList[i]
                            .student_id
                    );
                }
            }
            // Get the assessments for those students.
            for (let i = 0; i < this.assessmentsStore.assessments.length; i++) {
                for (let j = 0; j < this.studentIds.length; j++) {
                    if (
                        this.assessmentsStore.assessments[i].student_id ==
                        this.studentIds[j]
                    ) {
                        this.assessments.push(
                            this.assessmentsStore.assessments[i]
                        );
                    }
                }
            }

            // Date.
            for (let i = 0; i < this.assessments.length; i++) {
                let date = new Date(this.assessments[i].date).toDateString();
                this.assessments[i].date = date;
            }

            // Get users.
            if (this.usersStore.users.length == 0) {
                await this.usersStore.getUsers();
            }
            // Add the student name.
            for (let i = 0; i < this.assessments.length; i++) {
                for (let j = 0; j < this.usersStore.users.length; j++) {
                    if (
                        this.assessments[i].student_id ==
                        this.usersStore.users[j].id
                    ) {
                        this.assessments[i].studentUsername =
                            this.usersStore.users[j].username;
                    }
                }
            }

            // Get skills.
            if (this.skillsStore.skillsList.length == 0) {
                await this.skillsStore.getSkillsList();
            }
            // Add the skill name.
            for (let i = 0; i < this.assessments.length; i++) {
                for (let j = 0; j < this.skillsStore.skillsList.length; j++) {
                    if (
                        this.assessments[i].skill_id ==
                        this.skillsStore.skillsList[j].id
                    ) {
                        this.assessments[i].skillName =
                            this.skillsStore.skillsList[j].name;
                    }
                }
            }
        },
        async getStudentMCQuestions() {
            const result = await fetch(
                '/questions/student-mc-questions/full-data-list'
            );
            const data = await result.json();
            this.questions = data;
        },
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
                if (this.userDetailsStore.role == 'editor') {
                    this.markTutorialComplete();
                    return;
                }
                if (this.userDetailsStore.role == 'instructor') {
                    this.markTutorialComplete();
                    return;
                }
                this.showTutorialTip3 = true;
            } else if (step == 3) {
                this.showTutorialTip3 = false;
                this.showTutorialTip4 = true;
            } else if (step == 4) {
                this.showTutorialTip4 = false;
                this.showTutorialTip5 = true;
            } else if (step == 5) {
                this.showTutorialTip5 = false;
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
        <!-- Generate pathway bar -->
        <div class="row mb-3">
            <div class="col">
                <PathwayGenerator />
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
        <!-- Available Skills / Mark Assessments, 
          Last Visited Skills / Student Suggested Questions,
          Goals -->
        <div class="row">
            <!-- Available Skills / Mark Assessments -->
            <div
                class="col-lg-4 col-md-6 mb-2"
                v-if="userDetailsStore.role != 'editor'"
                :class="{
                    'd-none':
                        userDetailsStore.role == 'instructor' &&
                        assessments.length === 0
                }"
            >
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
                            This section shows your available skills. These are
                            the skills that you can try to master by taking a
                            quiz.
                        </p>
                        <p>
                            Once you master a skill, more skills will get
                            unlocked.
                        </p>
                        <button
                            class="btn primary-btn"
                            @click="progressTutorial(3)"
                        >
                            next
                        </button>
                    </div>
                    <StudentProgress
                        v-if="userDetailsStore.role == 'student'"
                        :userId="userDetailsStore.userId"
                    />
                    <MarkAssessment
                        v-else-if="userDetailsStore.role == 'instructor'"
                        :assessments="assessments"
                    />
                </div>
            </div>
            <!-- Last Visited Skills / Student Suggested Questions -->
            <div
                class="col-lg-4 col-md-6 mb-2"
                v-if="userDetailsStore.role != 'editor'"
                :class="{
                    'd-none':
                        userDetailsStore.role == 'instructor' &&
                        questions.length === 0
                }"
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
                        <p>
                            This section shows your the last 5 skill pages you
                            visited.
                        </p>
                        <button
                            class="btn primary-btn"
                            @click="progressTutorial(4)"
                        >
                            next
                        </button>
                    </div>
                    <LastVisitedSkills
                        v-if="userDetailsStore.role == 'student'"
                        :userId="userDetailsStore.userId"
                    />
                    <!-- Student Added Questions List -->
                    <HubStudentQuestionList
                        v-else-if="userDetailsStore.role == 'instructor'"
                        :questions="questions"
                    />
                </div>
            </div>
            <!-- Goals -->
            <div
                v-if="userDetailsStore.role == 'student'"
                class="col-lg-4 col-md-6 mb-2"
            >
                <div class="h-100">
                    <!-- Tooltip -->
                    <div
                        v-if="
                            showTutorialTip5 &&
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
                            @click="progressTutorial(5)"
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
