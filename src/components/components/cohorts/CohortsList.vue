<script>
import { useCohortsStore } from '../../../stores/CohortsStore.js';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';

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
            // Local tracking of which item is selected to ensure accurate UI rendering
            selectedCohortId: null,
            showInformationModal: false
        };
    },
    async created() {
        await this.cohortsStore.getCohorts(this.userDetailsStore.userId);
        // Check if user has visited before
        this.checkIfTutorialComplete();
    },

    methods: {
        selectCohort(cohort) {
            this.cohortsStore.selectedCohort.id = cohort.id;
        },
        restartTutorial() {
            this.showTutorialTip2 = false;
            this.showTutorialTip3 = false;
            this.showTutorialTip4 = false;
            this.showTutorialTip1 = true;
        },
        closeMobileDetail() {
            this.showDetails = false; // Hide the mobile cohort detail modal
        },
        // Tutorials
        async checkIfTutorialComplete() {
            const result = await fetch(
                '/users/check-tutorial-progress/cohorts/' +
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
                '/users/mark-tutorial-complete/cohorts/' +
                this.userDetailsStore.userId;
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            };
            fetch(url, requestOptions);
        },
        skipTutorial() {
            this.showTutorialTip1 = false;
            this.showTutorialTip2 = false;
            this.showTutorialTip3 = false;
            this.showTutorialTip4 = false;
            this.isTutorialComplete = true;
            this.markTutorialComplete();
        }
    }
};
</script>

<template>
    <div class="container mt-1">
        <!-- <button class="mb-1 cohort-buttons">All students</button> -->
        <button
            v-for="cohort in cohortsStore.cohorts"
            @click="selectCohort(cohort)"
            :key="cohort.id"
            :class="
                cohort.id === selectedCohortId
                    ? 'isCurrentlySelected'
                    : 'cohort-buttons'
            "
            class="mb-1"
        >
            {{ cohort.name }}
        </button>
    </div>
</template>

<style>
.cohort-buttons {
    font-family: 'Poppins', sans-serif;
    height: 80px;
    width: 100%;
    border-radius: 8px;
    border: 1px solid var(--primary-color);
    background-color: #c8d7da;
    color: black;
    overflow: hidden;
    padding: 16px 28px;
    font-size: 1.25rem;
    font-weight: 400;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
}

.cohort-buttons:hover {
    background-color: var(--primary-color);
    color: var(--primary-contrast-color);
}

.isCurrentlySelected {
    font-family: 'Poppins', sans-serif;
    height: 80px;
    width: 100%;
    border-radius: 8px;
    border: 1px solid var(--secondary-contrast-color);
    background-color: var(--secondary-color);
    color: var(--secondary-contrast-color);
    overflow: hidden;
    padding: 16px 28px;
    font-size: 1.25rem;
    font-weight: 400;
    display: flex;
    align-items: center;
    justify-content: center;
}

ul li {
    list-style: none;
}

/* Mobile */
@media (max-width: 480px) {
}

/* Tablets */
@media (min-width: 481px) and (max-width: 1023px) {
}

/* Desktops/laptops */
@media (min-width: 1025px) {
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
