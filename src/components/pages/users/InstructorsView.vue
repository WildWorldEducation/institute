<script>
import InstructorsList from '../../components/instructors/InstructorsList.vue';
import InstructorDetails from '../../components/instructors/InstructorDetails.vue';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();

        return {
            userDetailsStore
        };
    },
    data() {
        return {
            isLoading: true,
            // Flag to show user details when in phone view
            showDetails: false,
            // Tutorial tooltips
            isTutorialComplete: false,
            showTutorialTip1: false,
            showTutorialTip2: false,
            showTutorialTip3: false,
            showTutorialTip4: false,
            instructorsPerTenant: [],
            selectedInstructor: {}
        };
    },
    components: {
        InstructorDetails,
        InstructorsList
    },
    async created() {
        if (this.instructorsPerTenant.length < 1) {
            await this.getInstructorsPerTenant(this.userDetailsStore.tenantId);
            this.selectedInstructor = this.instructorsPerTenant[0];
        }
        if (window.innerWidth < 769) this.showDetails = true;
        this.isLoading = false;
    },
    methods: {
        async getInstructorsPerTenant(tenantId) {
            const result = await fetch('/tenants/instructors/' + tenantId);
            const data = await result.json();
            this.instructorsPerTenant = data;
            this.selectedInstructor = this.instructorsPerTenant[0];
        },
        async checkIfTutorialComplete() {
            const result = await fetch(
                '/users/check-tutorial-progress/instructors/' +
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
                '/users/mark-tutorial-complete/skill/' +
                this.userDetailsStore.userId;
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            };
            fetch(url, requestOptions);
        },
        skipTutorial() {
            this.showTutorialTip1 = false;
            this.isTutorialComplete = true;
            this.markTutorialComplete();
        },
        updateInstructorDetails(instructor) {
            this.selectedInstructor = instructor;
            this.$refs.InstructorDetails.getInstructorPercentageStudentsMasteredAtLeastOneSkill();
            this.$refs.InstructorDetails.classProgress = [];
            this.$refs.InstructorDetails.getTenantClassProgress();
            this.$refs.InstructorDetails.getTenantClassDurationPerDay();
        }
    }
};
</script>

<template>
    <!-- Top row -->
    <div class="container-fluid">
        <!-- Top buttons -->
        <div class="d-flex justify-content-between mb-2">
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
                <InstructorsList :instructors="instructorsPerTenant" />
            </div>
            <!-- Right column -->
            <!-- User detail view for PC and Tablet View -->
            <div class="col-lg-8 col-md-7 d-none d-md-block">
                <div class="row user-form-data-row">
                    <InstructorDetails
                        ref="InstructorDetails"
                        v-if="!isLoading"
                    />
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
                    <InstructorDetails />
                </div>
            </div>
        </div>
    </div>
    <!-- Tutorial modals for school_admin -->
    <div
        v-if="userDetailsStore.role == 'school_admin' && showTutorialTip1"
        class="modal"
    >
        <div class="modal-content">
            <div v-if="showTutorialTip1">
                <p>
                    This page provides an overview of all instructors in your
                    school, allowing you to monitor their performance and
                    student progress.
                </p>
                <div class="d-flex justify-content-between">
                    <button
                        class="btn primary-btn"
                        @click="progressTutorial(1)"
                    >
                        close
                    </button>
                </div>
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
