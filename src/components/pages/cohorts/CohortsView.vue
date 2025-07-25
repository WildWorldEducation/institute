<script>
import CohortsList from '../../components/cohorts/CohortsList.vue';
import CohortDetails from '../../components/cohorts/CohortDetails.vue';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useCohortsStore } from '../../../stores/CohortsStore.js';

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
            isLoading: true,
            // Flag to show user details when in phone view
            showDetails: true,
            // Tutorial tooltips
            isTutorialComplete: false,
            showTutorialTip1: false,
            showTutorialTip2: false,
            showTutorialTip3: false,
            showTutorialTip4: false
        };
    },
    components: {
        CohortDetails,
        CohortsList
    },
    async created() {
        if (
            this.userDetailsStore.role === 'instructor' ||
            this.userDetailsStore.role === 'partner'
        ) {
            await this.cohortsStore.getCohorts(this.userDetailsStore.userId);
            this.cohortsStore.selectedCohort = this.cohortsStore.cohorts[0];
        }
        this.isLoading = false;
    },
    methods: {
        updateCohortDetails() {
            this.$refs.CohortDetails.getInstructorPercentageStudentsMasteredAtLeastOneSkill();
        }
    }
};
</script>

<template>
    <!-- Top row -->
    <div class="container-fluid">
        <!-- Top buttons -->
        <div class="d-flex justify-content-between mb-2">
            <router-link
                v-if="
                    userDetailsStore.role == 'instructor' ||
                    userDetailsStore.role == 'partner'
                "
                class="btn primary-btn me-2"
                to="/cohorts/add"
                >Add&nbsp;
                <!-- Plus sign -->
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M6.34811 20.0423L6.34811 13.6494L-0.0358702 13.6583C-0.320945 13.6579 -0.594203 13.5444 -0.795782 13.3428C-0.997361 13.1412 -1.11082 12.868 -1.11132 12.5829L-1.11729 7.41477C-1.1168 7.1297 -1.00334 6.85644 -0.801757 6.65486C-0.600179 6.45328 -0.326921 6.33982 -0.0418461 6.33933L6.3481 6.34231L6.3481 -0.0506238C6.34659 -0.193451 6.3736 -0.335145 6.42756 -0.467396C6.48152 -0.599646 6.56134 -0.719794 6.66234 -0.820794C6.76334 -0.921794 6.88349 -1.00161 7.01574 -1.05557C7.14799 -1.10953 7.28969 -1.13655 7.43251 -1.13503L12.5827 -1.12308C12.8678 -1.12259 13.141 -1.00913 13.3426 -0.807549C13.5442 -0.60597 13.6577 -0.332713 13.6582 -0.047637L13.6552 6.34231L20.0481 6.34231C20.3325 6.34248 20.6052 6.45552 20.8063 6.65661C21.0074 6.8577 21.1204 7.13039 21.1206 7.41477L21.1325 12.565C21.1324 12.8494 21.0193 13.122 20.8182 13.3231C20.6171 13.5242 20.3444 13.6373 20.0601 13.6374L13.6552 13.6494L13.6641 20.0334C13.6636 20.3184 13.5502 20.5917 13.3486 20.7933C13.147 20.9948 12.8738 21.1083 12.5887 21.1088L7.43252 21.1267C7.28969 21.1282 7.148 21.1012 7.01575 21.0473C6.88349 20.9933 6.76335 20.9135 6.66235 20.8125C6.56135 20.7115 6.48153 20.5913 6.42757 20.4591C6.37361 20.3268 6.34659 20.1851 6.34811 20.0423Z"
                        fill="white"
                    />
                </svg>
            </router-link>
            <button class="btn primary-btn me-1" @click="restartTutorial">
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
    </div>
    <!-- Loading animation -->
    <div
        v-if="isLoading == true"
        class="loading-animation d-flex justify-content-center align-items-center py-4"
    >
        <span class="loader"></span>
    </div>
    <div v-else id="user-container" class="container-fluid">
        <div class="row position-relative">
            <!-- Left column -->
            <div class="col-lg-4 col-md-5">
                <CohortsList />
            </div>
            <!-- Right column -->
            <!-- User detail view for PC and Tablet View -->
            <div class="col-lg-8 col-md-7 d-none d-md-block">
                <div class="row user-form-data-row">
                    <CohortDetails ref="CohortDetails" v-if="!isLoading" />
                    <div v-else>
                        <h1 class="text-muted py-5">You have no cohorts</h1>
                    </div>
                </div>
            </div>
            <!-- User detail view specific for phone -->
            <div
                v-if="showDetails"
                class="col-md-7 d-block d-md-none"
                id="user-detail-section"
            >
                <div class="row">
                    <CohortDetails
                        ref="CohortDetails"
                        v-if="
                            this.cohortsStore.cohortsPerTenant.length > 0 &&
                            this.cohortsStore.selectedCohort.id
                        "
                    />
                </div>
            </div>
        </div>
    </div>

    <!-- Instructor Introduction modal -->
    <div v-if="showTutorialTip1 || showTutorialTip2" class="modal">
        <div class="modal-content">
            <div v-if="showTutorialTip1">
                <p>This page shows a list of your students.</p>
                <p>Click on the student's name to see their details.</p>
                <div class="d-flex justify-content-between">
                    <button
                        class="btn primary-btn"
                        @click="progressTutorial(1)"
                    >
                        next
                    </button>
                    <button class="btn red-btn" @click="skipTutorial">
                        exit tutorial
                    </button>
                </div>
            </div>
            <div v-if="showTutorialTip2">
                <p>Under the heading "Progress" you will find 3 buttons:</p>
                <p>
                    "Vertical Tree" will provide a look at the student's
                    progress in the full tree view.
                </p>
                <p>
                    "Collapsible Tree" takes you to a page similar to your own
                    collapsible tree. Here you can see the student's progress
                    and set goals for students.
                </p>
                <p>
                    "Goals" will navigate to a page that displays all the
                    students goals and the progress they have made towards them.
                </p>

                <button class="btn primary-btn" @click="progressTutorial(2)">
                    close
                </button>
            </div>
        </div>
    </div>
    <!-- Instructor Tutorial modal -->
    <div
        v-if="
            (userDetailsStore.role == 'instructor' ||
                userDetailsStore.role == 'partner') &&
            (showTutorialTip1 ||
                showTutorialTip2 ||
                showTutorialTip3 ||
                showTutorialTip4)
        "
        class="modal"
    >
        <div class="modal-content bg-light">
            <div v-if="showTutorialTip1">
                <p>This is your Cohorts page.</p>

                <div class="d-flex justify-content-between">
                    <button
                        class="btn primary-btn"
                        @click="progressTutorial(1)"
                    >
                        next
                    </button>
                    <button class="btn red-btn" @click="skipTutorial">
                        exit tutorial
                    </button>
                </div>
            </div>
            <div v-if="showTutorialTip2">
                <p>
                    Cohorts allow you, as an instructor, to present the same
                    filtered version of a skill tree to a selective group of
                    handpicked students.
                </p>
                <p>
                    For example, if you are guiding students through a math
                    class, each student can create a math-specific account and
                    you can add those accounts to your math class cohort,
                    updating the nodes as your instruction progresses.
                </p>
                <div class="d-flex justify-content-between">
                    <button
                        class="btn primary-btn"
                        @click="progressTutorial(2)"
                    >
                        next
                    </button>
                    <button class="btn red-btn" @click="skipTutorial">
                        exit tutorial
                    </button>
                </div>
            </div>
            <div v-if="showTutorialTip3">
                <p>
                    To leverage this feature, create a cohort, add relevant
                    students, and filter the tree they are to see as desired.
                </p>
                <p>
                    You can update the filtered skill tree nodes in your cohort,
                    plus the cohort's members, whenever you please.
                </p>
                <div class="d-flex justify-content-between">
                    <button
                        class="btn primary-btn"
                        @click="progressTutorial(3)"
                    >
                        next
                    </button>
                    <button class="btn red-btn" @click="skipTutorial">
                        exit tutorial
                    </button>
                </div>
            </div>
            <div v-if="showTutorialTip4">
                <p>
                    Before adding a student to your cohort, make sure they are
                    in no other cohorts; students can only be in one cohort at a
                    time.
                </p>
                <button class="btn primary-btn" @click="progressTutorial(4)">
                    close
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
#first-content-row {
    margin-top: -10px;
    padding-left: 46px;
    padding-top: 16px;
    padding-bottom: 17px;
    padding-right: 46px;
    height: 77px;
}

#user-container {
    padding-left: 35px;
    padding-right: 46px;
}

/* Mobile */
@media (max-width: 480px) {
    #first-content-row {
        padding-top: 20px;
        padding-left: 20px;
        padding-right: 20px;
    }

    #user-container {
        padding-left: 10px;
        padding-right: 10px;
    }

    #user-detail-section {
        position: fixed;
        top: 0px;
        left: 50%;
        transform: translate(-50%, 0);
        width: 95%;
        height: 95%;
    }
}

/* Tablets */
@media (min-width: 481px) and (max-width: 1024px) {
    #user-container {
        padding-left: 10px;
        padding-right: 10px;
    }

    .user-form-data-row {
        margin-right: 0px;
    }
}

/* Loading animation */
.loader {
    width: 48px;
    height: 48px;
    border: 5px solid var(--primary-color);
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
/* End of loading animation */

.loading-animation {
    min-height: 100%;
    position: fixed;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
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
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 520px;
    font-size: 18px;
    /* Could be more or less, depending on screen size */
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
