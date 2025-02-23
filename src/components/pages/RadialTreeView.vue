<script>
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';
import SkillTreeSearchBar from '../components/skills-tree-search-bar/SkillTreeSearchBar.vue';
import RadialTree from '../components/skilltrees/RadialTree.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    data() {
        return {
            gradeFilter: this.userDetailsStore.gradeFilter,
            isGradeFilter: true,
            isSubjectFilter: true,
            isLanguage: false,
            isMathematics: false,
            isScienceAndInvention: false,
            isComputerScience: false,
            isHistory: false,
            isLife: false,
            isDangerousIdeas: false,
            showMobileFiltersModal: false,
            // Tutorial tooltips
            isTutorialComplete: false,
            showTutorialTip1: false
        };
    },
    created() {
        for (let i = 0; i < this.userDetailsStore.subjectFilters.length; i++) {
            if (this.userDetailsStore.subjectFilters[i] == 'Language') {
                this.isLanguage = true;
            }
            if (this.userDetailsStore.subjectFilters[i] == 'Mathematics') {
                this.isMathematics = true;
            }
            if (
                this.userDetailsStore.subjectFilters[i] == 'Science & Invention'
            ) {
                this.isScienceAndInvention = true;
            }
            if (this.userDetailsStore.subjectFilters[i] == 'Computer Science') {
                this.isComputerScience = true;
            }
            if (this.userDetailsStore.subjectFilters[i] == 'History') {
                this.isHistory = true;
            }
            if (this.userDetailsStore.subjectFilters[i] == 'Life') {
                this.isLife = true;
            }
            if (this.userDetailsStore.subjectFilters[i] == 'Dangerous Ideas') {
                this.isDangerousIdeas = true;
            }
        }

        this.checkIfTutorialComplete();
    },
    components: { RadialTree, SkillTreeSearchBar },
    methods: {
        handleChooseResult(resultName) {
            // Find the node with name
            const node = this.$refs.childComponent.findNodeWithName(
                resultName.toLowerCase()
            );
            if (!node) {
                console.error('Cannot find node with name: ' + resultName);
                return false;
            }
            // go to the skill position
            this.$refs.childComponent.goToLocation(node);
        },
        clearResult() {
            this.$refs.childComponent.resetPos();
        },
        updateSubjectFilters() {
            this.userDetailsStore.subjectFilters = [];

            if (this.isLanguage)
                this.userDetailsStore.subjectFilters.push('Language');
            if (this.isMathematics)
                this.userDetailsStore.subjectFilters.push('Mathematics');
            if (this.isScienceAndInvention)
                this.userDetailsStore.subjectFilters.push(
                    'Science & Invention'
                );
            if (this.isComputerScience)
                this.userDetailsStore.subjectFilters.push('Computer Science');
            if (this.isHistory)
                this.userDetailsStore.subjectFilters.push('History');
            if (this.isLife) this.userDetailsStore.subjectFilters.push('Life');
            if (this.isDangerousIdeas)
                this.userDetailsStore.subjectFilters.push('Dangerous Ideas');
        },

        // Tutorial
        async checkIfTutorialComplete() {
            const result = await fetch(
                '/users/check-tutorial-progress/radial-tree/' +
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
                '/users/mark-tutorial-complete/radial-tree/' +
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
    <div class="container-fluid position-absolute legend-div">
        <div class="mobile-legend">
            <div class="search-mobile-row me-2">
                <!-- Search Feature -->
                <SkillTreeSearchBar
                    :findNode="handleChooseResult"
                    :clearResults="clearResult"
                />
            </div>
            <div class="d-flex justify-content-end">
                <!-- <button
                    class="btn legend-btn me-2"
                    @click="$refs.childComponent.printPDF()"
                >
                    Print
                </button> -->
                <button
                    class="btn primary-btn me-1"
                    @click="showMobileFiltersModal = true"
                >
                    Filters
                </button>

                <button class="btn primary-btn" @click="resetPos()">
                    Center
                </button>
            </div>
        </div>
        <div class="tablet-and-up-legend">
            <div class="d-flex justify-content-between">
                <!-- Search bar, reset, expand all, print buttons -->
                <div class="d-flex col-lg justify-content-between">
                    <!-- Search Feature -->
                    <SkillTreeSearchBar
                        class="me-2"
                        :findNode="handleChooseResult"
                        :clearResults="clearResult"
                    />
                    <!-- Print Button -->
                    <div>
                        <button
                            class="btn primary-btn me-2"
                            @click="$refs.childComponent.printPDF()"
                        >
                            Print
                        </button>
                        <button
                            class="btn primary-btn"
                            @click="restartTutorial"
                        >
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
            </div>
        </div>
    </div>

    <!-- Display loading screen while asynchronous call is made. -->
    <Suspense>
        <template #default>
            <RadialTree ref="childComponent" />
        </template>
        <template #fallback>
            <span>Loading...</span>
        </template>
    </Suspense>

    <!-- Bottom grade level truncation filters
        Not available on phone view -->

    <div
        class="tablet-and-up-legend position-absolute bottom-legend-div d-flex"
    >
        <div v-if="isGradeFilter" class="legend">
            <!-- Grade buttons -->
            <button
                class="btn grade-school me-2"
                :class="{
                    'active-grade-filter':
                        this.userDetailsStore.gradeFilter == 'grade_school'
                }"
                @click="
                    this.userDetailsStore.gradeFilter = 'grade_school';
                    $refs.childComponent.filter(
                        this.userDetailsStore.gradeFilter,
                        this.userDetailsStore.subjectFilters
                    );
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
                    $refs.childComponent.filter(
                        this.userDetailsStore.gradeFilter,
                        this.userDetailsStore.subjectFilters
                    );
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
                    $refs.childComponent.filter(
                        this.userDetailsStore.gradeFilter,
                        this.userDetailsStore.subjectFilters
                    );
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
                    $refs.childComponent.filter(
                        this.userDetailsStore.gradeFilter,
                        this.userDetailsStore.subjectFilters
                    );
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
                    $refs.childComponent.filter(
                        this.userDetailsStore.gradeFilter,
                        this.userDetailsStore.subjectFilters
                    );
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

    <!-- Left root subject filters  -->
    <div class="tablet-and-up-legend position-absolute left-legend-div">
        <div v-if="isSubjectFilter" class="d-flex flex-column">
            <button
                class="btn mb-2"
                :class="{
                    'chosen-subject': isLanguage,
                    'hidden-subject': !isLanguage
                }"
                @click="
                    this.isLanguage = !this.isLanguage;
                    this.updateSubjectFilters();
                    $refs.childComponent.filter(
                        this.gradeFilter,
                        this.userDetailsStore.subjectFilters
                    );
                "
            >
                Language
            </button>
            <button
                class="btn mb-2"
                :class="{
                    'chosen-subject': isMathematics,
                    'hidden-subject': !isMathematics
                }"
                @click="
                    this.isMathematics = !this.isMathematics;
                    this.updateSubjectFilters();
                    $refs.childComponent.filter(
                        this.gradeFilter,
                        this.userDetailsStore.subjectFilters
                    );
                "
            >
                Math
            </button>
            <button
                class="btn mb-2"
                :class="{
                    'chosen-subject': isHistory,
                    'hidden-subject': !isHistory
                }"
                @click="
                    this.isHistory = !this.isHistory;
                    this.updateSubjectFilters();
                    $refs.childComponent.filter(
                        this.gradeFilter,
                        this.userDetailsStore.subjectFilters
                    );
                "
            >
                History
            </button>
            <button
                class="btn mb-2"
                :class="{
                    'chosen-subject': isLife,
                    'hidden-subject': !isLife
                }"
                @click="
                    this.isLife = !this.isLife;
                    this.updateSubjectFilters();
                    $refs.childComponent.filter(
                        this.gradeFilter,
                        this.userDetailsStore.subjectFilters
                    );
                "
            >
                Life
            </button>
            <button
                class="btn mb-2"
                :class="{
                    'chosen-subject': isComputerScience,
                    'hidden-subject': !isComputerScience
                }"
                @click="
                    this.isComputerScience = !this.isComputerScience;
                    this.updateSubjectFilters();
                    $refs.childComponent.filter(
                        this.gradeFilter,
                        this.userDetailsStore.subjectFilters
                    );
                "
            >
                Computer Science
            </button>
            <button
                class="btn mb-2"
                :class="{
                    'chosen-subject': isScienceAndInvention,
                    'hidden-subject': !isScienceAndInvention
                }"
                @click="
                    this.isScienceAndInvention = !this.isScienceAndInvention;
                    this.updateSubjectFilters();
                    $refs.childComponent.filter(
                        this.gradeFilter,
                        this.userDetailsStore.subjectFilters
                    );
                "
            >
                Science & Invention
            </button>
            <button
                class="btn mb-2"
                :class="{
                    'chosen-subject': isDangerousIdeas,
                    'hidden-subject': !isDangerousIdeas
                }"
                @click="
                    this.isDangerousIdeas = !this.isDangerousIdeas;
                    this.updateSubjectFilters();
                    $refs.childComponent.filter(
                        this.gradeFilter,
                        this.userDetailsStore.subjectFilters
                    );
                "
            >
                Dangerous Ideas
            </button>
        </div>
        <button
            class="btn switch-btn"
            @click="isSubjectFilter = !isSubjectFilter"
        >
            <!-- Plus sign -->
            <svg
                v-if="!isSubjectFilter"
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

    <!-- Filters Modal for Mobile Phone View.-->
    <div v-if="showMobileFiltersModal" class="modal">
        <!-- Confirm Modal -->
        <div class="modal-content">
            <div class="d-flex flex-column">
                <button class="btn" @click="showMobileFiltersModal = false">
                    <!-- Close icon -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="25"
                        height="25"
                        fill="#ef4444"
                    >
                        <path
                            d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"
                        />
                    </svg>
                </button>
            </div>
            <div class="d-flex flex-column">
                <!-- Subject buttons -->
                <button
                    class="btn"
                    :class="{
                        'chosen-subject': isLanguage,
                        'hidden-subject': !isLanguage
                    }"
                    @click="
                        this.isLanguage = !this.isLanguage;
                        this.updateSubjectFilters();
                        $refs.childComponent.filter();
                    "
                >
                    Language
                </button>
                <button
                    class="btn"
                    :class="{
                        'chosen-subject': isMathematics,
                        'hidden-subject': !isMathematics
                    }"
                    @click="
                        this.isMathematics = !this.isMathematics;
                        this.updateSubjectFilters();
                        $refs.childComponent.filter();
                    "
                >
                    Math
                </button>
                <button
                    class="btn"
                    :class="{
                        'chosen-subject': isHistory,
                        'hidden-subject': !isHistory
                    }"
                    @click="
                        this.isHistory = !this.isHistory;
                        this.updateSubjectFilters();
                        $refs.childComponent.filter();
                    "
                >
                    History
                </button>
                <button
                    class="btn"
                    :class="{
                        'chosen-subject': isLife,
                        'hidden-subject': !isLife
                    }"
                    @click="
                        this.isLife = !this.isLife;
                        this.updateSubjectFilters();
                        $refs.childComponent.filter();
                    "
                >
                    Life
                </button>
                <button
                    class="btn"
                    :class="{
                        'chosen-subject': isComputerScience,
                        'hidden-subject': !isComputerScience
                    }"
                    @click="
                        this.isComputerScience = !this.isComputerScience;
                        this.updateSubjectFilters();
                        $refs.childComponent.filter();
                    "
                >
                    Computer Science
                </button>
                <button
                    class="btn"
                    :class="{
                        'chosen-subject': isScienceAndInvention,
                        'hidden-subject': !isScienceAndInvention
                    }"
                    @click="
                        this.isScienceAndInvention =
                            !this.isScienceAndInvention;
                        this.updateSubjectFilters();
                        $refs.childComponent.filter();
                    "
                >
                    Science & Invention
                </button>
                <button
                    class="btn mb-2"
                    :class="{
                        'chosen-subject': isDangerousIdeas,
                        'hidden-subject': !isDangerousIdeas
                    }"
                    @click="
                        this.isDangerousIdeas = !this.isDangerousIdeas;
                        this.updateSubjectFilters();
                        $refs.childComponent.filter();
                    "
                >
                    Dangerous Ideas
                </button>
                <!-- Grade buttons -->
                <button
                    class="btn grade-school"
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
                    class="btn middle-school"
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
                    class="btn high-school"
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
                    class="btn college"
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
                    class="btn phd"
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
        </div>
    </div>

    <!-- Introduction modal -->
    <div v-if="showTutorialTip1" class="modal">
        <div class="modal-content">
            <p>
                This page is like the Full Tree, but the skills are arranged in
                a radial format.
            </p>
            <button class="btn primary-btn ms-0" @click="progressTutorial(1)">
                close
            </button>
        </div>
    </div>
</template>

<style scoped>
/*
 * Filters 
 */

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

/* Root subject filters */
.chosen-subject,
.switch-btn {
    background-color: var(--primary-color) !important;
    color: var(--primary-contrast-color) !important;
}

.chosen-subject:active,
.chosen-subject:focus,
.switch-btn:hover {
    color: var(--primary-contrast-color) !important;
    opacity: 1 !important;
}

.btn:active,
.btn:focus {
    color: var(--primary-contrast-color);
    border: 1px solid black;
}

.chosen-subject:hover {
    opacity: 0.5;
    color: var(--primary-contrast-color) !important;
    border: 1px solid black;
}

.hidden-subject {
    color: var(--primary-contrast-color);
    background-color: var(--primary-color) !important;
    opacity: 0.5;
}

.hidden-subject:hover {
    background-color: var(--primary-color) !important;
    color: var(--primary-contrast-color);
    border: 1px solid black;
    opacity: 1;
}

.hidden-subject:active,
.hidden-subject:focus {
    background-color: var(--primary-color) !important;
    color: var(--primary-contrast-color);
    border: 1px solid black;
    opacity: 0.5;
}

/* Modal filters */
.modal .btn {
    width: 200px;
    margin: auto;
}

.tooltip .btn {
    /* margin: inherit; */
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

.bottom-legend-div {
    left: 50%;
    transform: translateX(-50%);
    bottom: 10px;
}

.left-legend-div {
    top: 50%;
    transform: translateY(-50%);
    left: 3px;
}

.left-legend-div button {
    border: 1px solid black;
    width: fit-content;
}

.legend {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.legend-div {
    width: 100%;
    z-index: 2;
    top: 70px;
}

.bottom-legend-div {
    left: 50%;
    transform: translateX(-50%);
    bottom: 10px;
}

.bottom-legend-div .btn {
    color: black;
}

.legend-div {
    z-index: 2;
    width: 100%;
    top: 80px;
}

#info-button {
    width: 50px;
    height: 20px;
    padding: 0px;
    float: right;
}

#info-button svg {
    width: 25px;
    height: 15px;
    margin-bottom: 8px;
}

.collapsible-tree-legend {
    width: 100%;
}

.legend span {
    float: left;
    width: 20px;
    height: 20px;
    margin: 2px;
    border-radius: 50%;
}

.hightLight {
    font-weight: 500;
    color: #9985d1;
    float: none !important;
    width: auto !important;
    height: auto !important;
    margin: 0px !important;
    border-radius: 0px !important;
    border: 0px !important;
}

.legend .btn {
    color: black;
    font-weight: 500;
    border: 1px solid black;
}

.legend {
    align-items: center;
    justify-content: center;
}

.have-results {
    border-bottom: 0px !important ;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
}
.skill-tree-input {
    outline: none;
    border: 0px;
}

.search-results {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 0;
    left: -1px;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    border-bottom: 1px solid #dce2f2;
    border-right: 1px solid #dce2f2;
    border-left: 1px solid #dce2f2;
    background-color: white;
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;
    width: 101%;
}

.result-row {
    padding: 4px;
    cursor: pointer;
    color: #6e6e6e;
    background-color: inherit;
    border: 0px;
    text-align: left;
}

.result-row:hover,
.result-row:focus {
    background-color: #f3f5f6;
    color: black;
}

.mobile-legend {
    display: none;
}

.skill-tree-input {
    width: 100%;
}

/* X-Small devices (portrait phones, less than 576px) */
@media (max-width: 480px) {
    .mobile-legend {
        display: flex;
        width: 100%;
        justify-content: space-between;
    }

    .tablet-and-up-legend {
        display: none !important;
    }

    .search-mobile-row {
        width: 96%;
        margin-left: 0px;
        margin-right: auto;
    }

    /* Modal Content/Box */
    .modal-content {
        width: 90%;
        margin-top: 30%;
    }
}

/* Bigger devices */
@media (min-width: 481px) and (max-width: 1024px) {
    .mobile-legend {
        display: none;
    }

    .tablet-and-up-legend {
        display: block;
    }

    .legend .col {
        display: flex;
    }
    .legend span {
        flex-shrink: 0;
    }
}
</style>
