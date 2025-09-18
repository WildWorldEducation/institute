<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    props: ['instructors'],
    data() {
        return {
            showInformationModal: false,
            isMobileCheck: window.innerWidth
        };
    },
    async created() {
        // Check if user has visited before
        this.checkIfTutorialComplete();
    },

    methods: {
        selectInstructor(instructor) {
            this.$parent.selectedTeacher = instructor;
            this.$parent.updateTeacherDetails(instructor);
            if (window.innerWidth < 769) this.$emit('showDetails');
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
        <div v-for="teacher in $parent.teachers" :key="teacher.id">
            <div class="d-flex bg-light rounded p-2">
                <button
                    :class="
                        teacher.id === $parent.selectedTeacher.id
                            ? 'isCurrentlySelected'
                            : 'cohort-buttons'
                    "
                    @click="selectInstructor(teacher)"
                >
                    {{ teacher.username }}
                </button>
                <router-link
                    v-if="isMobileCheck < 576"
                    :to="
                        '/teachers/' + this.$parent.selectedTeacher.id + '/edit'
                    "
                    class="btn ms-2 edit-btn"
                >
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
            </div>
        </div>
        <!-- Add Teacher Link -->
        <RouterLink to="/teachers/add" class="d-block mb-2 btn primary-btn">
            Add teacher
        </RouterLink>
    </div>
</template>

<style scoped>
.edit-btn {
    background-color: var(--primary-color);
    border: none;
    border-radius: 8px;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

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
    border: 1px solid var(--primary-color);
    background-color: var(--primary-color);
    color: white;
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
