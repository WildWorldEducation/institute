<script>
import { useCohortsStore } from '../../../stores/CohortsStore.js';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';
import CohortPercentageStudentsMasteredAtLeastOneSkillPieChart from './../teacher-analytics/cohorts/CohortPercentageStudentsMasteredAtLeastOneSkillPieChart.vue';
export default {
    setup() {
        const cohortsStore = useCohortsStore();
        const userDetailsStore = useUserDetailsStore();

        return {
            cohortsStore,
            userDetailsStore
        };
    },
    data() {
        return {
            showModal: false,
            showRemoveStudentModal: false,
            localIsSkillsLocked: null,
            mode: 'big',
            isMobileCheck: window.innerWidth
        };
    },
    created() {},
    computed: {
        studentName() {
            return `${this.$parent.user.username}`.trim();
        }
    },
    components: {
        CohortPercentageStudentsMasteredAtLeastOneSkillPieChart
    },
    methods: {
        // For School admin reports
        async getCohortPercentageStudentsMasteredAtLeastOneSkill() {
            try {
                const response = await fetch(
                    `/student-analytics/percentage-students-mastered-one-skill/cohort/${this.cohortId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                this.percentageStudentsMasteredOneSkill = Array.isArray(data)
                    ? data
                    : [];
            } catch (error) {
                console.error(
                    'Error fetching all students failed assessments:',
                    error
                );
                this.percentageStudentsMasteredOneSkill = [];
            }
        }
    }
};
</script>

<template>
    <div id="user-information" class="container mt-1 bg-light p-2">
        <!-- The X to close the user details popup windows when on phone view -->
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
        <!-- Row: Avatar, name and basic details -->
        <div class="row" v-if="isMobileCheck < 576">
            <!-- Name and basic details -->
            <h1 class="secondary-heading h3">
                {{ this.cohortsStore.selectedCohort.name }}
            </h1>
        </div>
        <div
            class="row"
            v-if="
                userDetailsStore.role == 'instructor' ||
                userDetailsStore.role == 'partner'
            "
        >
            <!-- Cohort Progress -->
            <div class="col-12 col-md-8">
                <div class="d-flex flex-column">
                    <h2 class="secondary-heading h4">Check progress</h2>
                    <!-- Whether all students or cohort selected -->
                    <router-link
                        v-if="!cohortsStore.isAllStudentsSelected"
                        :to="`/cohort/${cohortsStore.selectedCohort.id}/progress-report`"
                        class="fit-content"
                        target="_blank"
                    >
                        Progress
                    </router-link>
                    <router-link
                        v-else
                        :to="`/cohort/all-students/progress-report`"
                        class="fit-content"
                        target="_blank"
                    >
                        Progress
                    </router-link>

                    <h2 class="secondary-heading h4 mt-4">Check activity</h2>
                    <!-- Whether all students or cohort selected -->
                    <router-link
                        v-if="!cohortsStore.isAllStudentsSelected"
                        :to="`/cohort/${this.cohortsStore.selectedCohort.id}/skill-activity`"
                        class="fit-content"
                        target="_blank"
                    >
                        Skill Activity
                    </router-link>
                    <router-link
                        v-else
                        :to="`/cohort/all-students/skill-activity`"
                        class="fit-content"
                        target="_blank"
                    >
                        Skill Activity
                    </router-link>

                    <!-- Whether all students or cohort selected -->
                    <router-link
                        v-if="!cohortsStore.isAllStudentsSelected"
                        :to="`/cohort/${this.cohortsStore.selectedCohort.id}/assessment-status`"
                        class="fit-content mt-2"
                        target="_blank"
                    >
                        Assessment status
                    </router-link>
                    <router-link
                        v-else
                        :to="`/cohort/all-students/assessment-status`"
                        class="fit-content mt-2"
                        target="_blank"
                    >
                        Assessment status
                    </router-link>

                    <!-- Whether all students or cohort selected -->
                    <router-link
                        v-if="!cohortsStore.isAllStudentsSelected"
                        :to="`/cohort/${this.cohortsStore.selectedCohort.id}/total-time`"
                        class="fit-content mt-2"
                        target="_blank"
                    >
                        Time on platform
                    </router-link>
                    <router-link
                        v-else
                        :to="`/cohort/all-students/total-time`"
                        class="fit-content mt-2"
                        target="_blank"
                    >
                        Time on platform
                    </router-link>

                    <!-- <h3>Possibly: Skills -> Learning Objectives</h3>
                    <ul>
                        <li><em>which are students struggling with</em></li>
                        <li>
                            <em
                                >Calendar showing: passing assessments, taking
                                them, failing them:
                                https://observablehq.com/@d3/calendar/2</em
                            >
                        </li>
                    </ul> -->

                    <!-- Goals -->
                    <h2 class="secondary-heading h4 mt-4">Assign work</h2>
                    <p>Assign goals</p>
                    <p>See current goals</p>
                </div>
            </div>
            <!-- Right column -->
            <div
                class="col-12 col-md-4"
                v-if="cohortsStore.isAllStudentsSelected == false"
            >
                <h2 class="secondary-heading h4">Edit</h2>
                <div class="d-flex flex-column">
                    <!-- Edit Cohort -->
                    <router-link
                        :to="`/cohort/edit/${cohortsStore.selectedCohort.id}`"
                        class="btn primary-btn mt-1"
                    >
                        Edit cohort&nbsp;
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
                    <!-- Delete Cohort -->
                    <button
                        class="btn btn-danger mt-1 remove-student-btn fit-content"
                        @click="showRemoveStudentModal = true"
                    >
                        Delete Cohort
                    </button>
                </div>
                <!-- Lock skill progress -->
                <!-- <div class="mt-4">
                    <div class="d-flex gap-1">
                        <h3 class="secondary-heading h6">
                            Lock skill progress?
                        </h3>
                        <div class="tooltip-wrapper"></div>
                    </div>
                    <input
                        type="radio"
                        value="0"
                        v-model="$parent.cohort.isSkillsLocked"
                        @change="updateSkillsLock()"
                    />
                    <label for="one">No</label>
                    &nbsp;
                    <input
                        type="radio"
                        value="1"
                        v-model="$parent.cohort.isSkillsLocked"
                        @change="updateSkillsLock()"
                    />
                    <label for="two">Yes</label>
                </div> -->
                <!-- <h2 class="secondary-heading h4 mt-4">Notifications</h2>
                <div class="d-flex flex-column">
                    <router-link
                        :to="`/student/${this.$parent.cohort.id}/progress-report`"
                        class="fit-content"
                        target="_blank"
                    >
                        Students ahead of estimated progress
                    </router-link>
                    <router-link
                        :to="`/student/${this.$parent.cohort.id}/progress-report`"
                        class="fit-content mt-2"
                        target="_blank"
                    >
                        Students behind estimated progress
                    </router-link>
                </div> -->
            </div>
        </div>
        <div
            v-if="
                userDetailsStore.role == 'school_admin' &&
                $route.name == 'classes'
            "
            class="d-flex flex-column"
        >
            <h2 class="secondary-heading">Student Progress & Attendance</h2>
            <h3>Usage and Fidelity Reports</h3>
            <!-- <CohortPercentageStudentsMasteredAtLeastOneSkillPieChart /> -->
            <p>
                Track weekly and cumulative usage, including the percentage of
                students who completed at least one skill, total tutoring time,
                and engagement.
            </p>
            <ul>
                <li>
                    percentage of students who completed at least one skill
                    <ul>
                        <li>
                            <em>task made</em>
                        </li>
                        <li>
                            <em
                                >percentage of students who completed at least
                                one skill
                            </em>
                        </li>
                        <li>
                            <em>pie chart </em>
                        </li>
                    </ul>
                </li>
                <li>
                    total tutoring time
                    <em
                        >(Would have to record time per student per skill, with
                        tutor)</em
                    >
                </li>
                <li>
                    engagement
                    <ul>
                        <li>
                            <em>task made</em>
                        </li>
                        <li>
                            <em
                                >starting date is when first student started
                                on</em
                            >
                        </li>
                        <li>
                            <em>total time on platform </em>
                        </li>
                        <li>
                            <em>line chart </em>
                        </li>
                    </ul>
                </li>
            </ul>
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
    <div v-if="showRemoveStudentModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
                <p>Are you sure you want to remove this student?</p>
                <div style="display: flex; gap: 10px">
                    <button
                        type="button"
                        class="btn btn-danger"
                        @click="removeStudentFromInstructor()"
                    >
                        Yes
                    </button>
                    <button
                        type="button"
                        class="btn btn-dark"
                        @click="showRemoveStudentModal = false"
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.remove-student-btn {
    font-weight: 500;
}

.fit-content {
    max-width: fit-content;
}

#user-information {
    border: 1px solid var(--primary-color);
    border-radius: 12px;
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
        border-radius: 10px;
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
    }
}
</style>
