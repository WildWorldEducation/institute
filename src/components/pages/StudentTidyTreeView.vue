<script>
import StudentTidyTree from '../components/skilltrees/StudentTidyTree.vue';
import { useUsersStore } from '../../stores/UsersStore';
import { useUserDetailsStore } from '../../stores/UserDetailsStore';

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
            studentName: '',
            // Tutorial tooltips
            isTutorialComplete: false,
            showTutorialTip1: false,
            showTutorialTip2: false,
            showTutorialTip3: false,
            isGradeFilter: true
        };
    },
    async created() {
        if (
            this.userDetailsStore.role == 'instructor' ||
            this.userDetailsStore.role == 'admin'
        ) {
            this.instructorId = this.userDetailsStore.userId;
        } else {
            alert('Only admin or instructors can access this page.');
            this.$router.push('/');
        }
        if (this.usersStore.users.length == 0) await this.usersStore.getUsers();
        for (let i = 0; i < this.usersStore.users.length; i++) {
            if (this.usersStore.users[i].id == this.$route.params.studentId) {
                this.studentName = this.usersStore.users[i].username;
            }
        }

        // Check if tutorial has been seen.
        this.checkIfTutorialComplete();
    },
    components: {
        StudentTidyTree
    },
    methods: {
        // Tutorial
        async checkIfTutorialComplete() {
            const result = await fetch(
                '/users/check-tutorial-progress/student-vertical-tree/' +
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
                this.markTutorialComplete();
            }
        },
        restartTutorial() {
            this.showTutorialTip1 = true;
            this.showTutorialTip2 = false;
            this.isTutorialComplete = false;
        },
        markTutorialComplete() {
            let url =
                '/users/mark-tutorial-complete/student-vertical-tree/' +
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
    <!-- Display loading screen while asynchronous call is made. -->
    <Suspense>
        <template #default>
            <StudentTidyTree
                :studentId="$route.params.studentId"
                :studentName="studentName"
                :restartTutorial="restartTutorial"
            />
        </template>
        <template #fallback>
            <span>Loading...</span>
        </template>
    </Suspense>

    <!-- Bottom grade level truncation filters -->
    <div class="tablet-and-up-legend position-absolute bottom-legend-div">
        <!-- Tooltip -->
        <div
            v-if="showTutorialTip3"
            class="info-panel bg-light rounded p-2 mb-2"
        >
            <p>Use the buttons below to filter the skills by level.</p>
            <button class="btn primary-btn" @click="progressTutorial(3)">
                next
            </button>
        </div>
        <!-- Grade buttons -->
        <div class="d-flex">
            <div v-if="isGradeFilter" class="legend">
                <button
                    class="btn grade-school me-2"
                    :class="{
                        'active-grade-filter':
                            this.userDetailsStore.gradeFilter == 'grade_school'
                    }"
                    @click="
                        this.userDetailsStore.gradeFilter = 'grade_school';
                        $refs.childComponent.filter();
                    "
                >
                    Grade school
                </button>
                <button
                    class="btn middle-school me-2"
                    :class="{
                        'active-grade-filter':
                            this.userDetailsStore.gradeFilter == 'middle_school'
                    }"
                    @click="
                        this.userDetailsStore.gradeFilter = 'middle_school';
                        $refs.childComponent.filter();
                    "
                >
                    Middle school
                </button>
                <button
                    class="btn high-school me-2"
                    :class="{
                        'active-grade-filter':
                            this.userDetailsStore.gradeFilter == 'high_school'
                    }"
                    @click="
                        this.userDetailsStore.gradeFilter = 'high_school';
                        $refs.childComponent.filter();
                    "
                >
                    High school
                </button>
                <button
                    class="btn college me-2"
                    :class="{
                        'active-grade-filter':
                            this.userDetailsStore.gradeFilter == 'college'
                    }"
                    @click="
                        this.userDetailsStore.gradeFilter = 'college';
                        $refs.childComponent.filter();
                    "
                >
                    College
                </button>
                <button
                    class="btn phd me-2"
                    :class="{
                        'active-grade-filter':
                            this.userDetailsStore.gradeFilter == 'phd'
                    }"
                    @click="
                        this.userDetailsStore.gradeFilter = 'phd';
                        $refs.childComponent.filter();
                    "
                >
                    PHD
                </button>
            </div>
            <button
                class="btn switch-btn me-2"
                @click="isGradeFilter = !isGradeFilter"
            >
                <!-- Plus sign -->
                <svg
                    v-if="!isGradeFilter"
                    width="18"
                    height="18"
                    fill="white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                >
                    <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                    <path
                        d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                    />
                </svg>
                <!-- Minus sign -->
                <svg
                    v-else
                    width="18"
                    height="18"
                    fill="white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                >
                    <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                    <path
                        d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                    />
                </svg>
            </button>
        </div>
    </div>

    <!-- Tooltip modal -->
    <div v-if="showTutorialTip1 || showTutorialTip2" class="modal">
        <div class="modal-content">
            <div v-if="showTutorialTip1">
                <p>This is your student's skill tree.</p>
                <button class="btn primary-btn" @click="progressTutorial(1)">
                    next
                </button>
            </div>
            <div v-else-if="showTutorialTip2">
                <p>
                    You can get a bird's eye view of their progress from here.
                </p>
                <button class="btn primary-btn" @click="progressTutorial(2)">
                    close
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
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

/* Filters */

.legend {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.legend span {
    float: left;
    width: 20px;
    height: 20px;
    margin: 2px;
    border-radius: 50%;
}

/* Small devices (portrait phones) */
@media (max-width: 480px) {
    .tablet-and-up-legend {
        display: none !important;
    }
}

.bottom-legend-div {
    left: 50%;
    transform: translateX(-50%);
    bottom: 10px;
}

.bottom-legend-div .btn {
    border: 1px solid black;
    font-weight: 500;
}

/* Bigger devices ( Tablet ) */
@media (min-width: 481px) and (max-width: 1024px) {
    .tablet-and-up-legend {
        display: block;
    }
    .legend {
        align-items: center;
    }

    .legend .col {
        display: flex;
    }
    .legend span {
        flex-shrink: 0;
    }
}

/* Grade level filter */
.grade-school {
    background-color: #40e0d0;
    opacity: 0.5;
    color: black;
}
.grade-school:hover,
.grade-school:active,
.grade-school:focus {
    background-color: #40e0d0;
    opacity: 1;
    color: black !important;
}
.grade-school.active-grade-filter {
    opacity: 1;
}

.middle-school {
    background-color: #33a133;
    opacity: 0.5;
}
.middle-school:hover,
.middle-school:active,
.middle-school:focus {
    background-color: #33a133;
    opacity: 1;
    color: black !important;
}
.middle-school.active-grade-filter {
    opacity: 1;
}

.high-school {
    background-color: #ffd700;
    opacity: 0.5;
    color: black;
}
.high-school:hover,
.high-school:active,
.high-school:focus {
    background-color: #ffd700;
    opacity: 1;
    color: black !important;
}
.high-school.active-grade-filter {
    opacity: 1;
}

.college {
    background-color: #ffa500;
    opacity: 0.5;
}
.college:hover,
.college:active,
.college:focus {
    background-color: #ffa500;
    opacity: 1;
    color: black !important;
}
.college.active-grade-filter {
    opacity: 1;
}

.phd {
    background-color: #ff0000;
    opacity: 0.5;
}
.phd:hover,
.phd:active,
.phd:focus {
    background-color: #ff0000;
    opacity: 1;
    color: black !important;
}
.phd.active-grade-filter {
    opacity: 1;
}

.switch-btn {
    max-height: 38px;
    margin: auto;
}
</style>
