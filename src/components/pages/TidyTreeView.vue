<script>
import { useSessionDetailsStore } from '../../stores/SessionDetailsStore.js';
import SkillTreeSearchBar from '../components/skills-tree-search-bar/SkillTreeSearchBar.vue';
import TidyTree from '../components/skilltrees/TidyTree.vue';
import TidyTreeNoAccount from '../components/skilltrees/TidyTreeNoAccount.vue';

export default {
    setup() {
        const sessionDetailsStore = useSessionDetailsStore();

        return {
            sessionDetailsStore
        };
    },
    data() {
        return {
            searchText: '',
            lastChooseResult: '',
            showResult: false,
            showConfirmModal: false,
            isGradeFilter: true,
            isSubjectFilter: true,
            gradeFilter: 'phd',
            isLanguage: true,
            isMathematics: true,
            isScienceAndInvention: true,
            isComputerScience: true,
            isHistory: true,
            isLife: true,
            isDangerousIdeas: true,
            subjectFilters: [
                'Language',
                'Mathematics',
                'Science & Invention',
                'Computer Science',
                'History',
                'Life',
                'Dangerous Ideas'
            ]
        };
    },
    created() {},
    mounted() {
        this.GetGoogleLoginResult();
    },
    components: { TidyTree, TidyTreeNoAccount, SkillTreeSearchBar },
    methods: {
        resetPos() {
            this.$refs.childComponent.resetPos();
        },
        handleChooseResult(resultName) {
            this.lastChooseResult = resultName;
            // Find the node with name
            const node = this.$refs.childComponent.findNodeWithName(resultName);
            if (!node) {
                console.error('Cannot find node with name: ' + resultName);
                return false;
            }
            // go to the skill position
            this.$refs.childComponent.goToLocation(node);
        },
        expandAllNodesWarning() {
            this.showConfirmModal = true;
        },
        expandAllNodes() {
            this.showConfirmModal = false;
            this.$refs.childComponent.expandAllChildren();
        },
        GetGoogleLoginResult() {
            fetch('/google-login-result')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    if (data.account == 'new account')
                        alert('Your account has been created!');
                });
        },
        clearResult() {
            this.$refs.childComponent.resetPos();
        },
        updateSubjectFilters() {
            this.subjectFilters = [];

            if (this.isLanguage) this.subjectFilters.push('Language');
            if (this.isMathematics) this.subjectFilters.push('Mathematics');
            if (this.isScienceAndInvention)
                this.subjectFilters.push('Science & Invention');
            if (this.isComputerScience)
                this.subjectFilters.push('Computer Science');
            if (this.isHistory) this.subjectFilters.push('History');
            if (this.isLife) this.subjectFilters.push('Life');
            if (this.isDangerousIdeas)
                this.subjectFilters.push('Dangerous Ideas');
        }
    }
};
</script>

<template>
    <div class="container-fluid position-absolute legend-div">
        <div class="mobile-legend">
            <div class="search-mobile-row">
                <!-- Search feature -->
                <SkillTreeSearchBar
                    :findNode="handleChooseResult"
                    :clearResults="clearResult"
                />
            </div>
            <div class="d-flex">
                <button class="btn primary-btn" @click="resetPos()">
                    Reset
                </button>
            </div>
        </div>
        <div class="tablet-and-up-legend">
            <div class="d-flex justify-content-between">
                <!-- Search bar, reset, expand all, print buttons -->
                <!-- Search Feature -->
                <SkillTreeSearchBar
                    class="ms-2"
                    :findNode="handleChooseResult"
                    :clearResults="clearResult"
                />
                <div class="d-flex justify-content-end">
                    <!-- Reset Button -->
                    <button class="btn primary-btn me-2" @click="resetPos()">
                        Reset
                    </button>
                    <!-- Expand all nodes -->
                    <button
                        v-if="sessionDetailsStore.isLoggedIn"
                        class="btn primary-btn me-2"
                        @click="expandAllNodesWarning()"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 448 512"
                            width="20"
                            height="20"
                        >
                            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                            <path
                                d="M32 32C14.3 32 0 46.3 0 64l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96z"
                                fill="white"
                            />
                        </svg>
                    </button>
                    <!-- Print Button -->
                    <button
                        v-if="sessionDetailsStore.isLoggedIn"
                        class="btn primary-btn me-2"
                        @click="$refs.childComponent.printPDF()"
                    >
                        Print
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div
        v-if="showConfirmModal"
        @click="showConfirmModal = false"
        class="modal"
    >
        <!-- Confirm Modal -->
        <div class="modal-content asking-modal">
            <div class="d-flex gap-4">
                <!-- Warn Triangle Icon -->
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    fill="grey"
                    width="45"
                    height="45"
                >
                    <path
                        d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
                    />
                </svg>
                <p>Are you sure you want to expand all skills?</p>
            </div>
            <!-- Buttons row -->
            <div class="d-flex justify-content-end gap-2">
                <button
                    type="button"
                    class="btn red-btn modal-btn"
                    @click="showConfirmModal = false"
                >
                    <span> No </span>
                </button>
                <button
                    type="button"
                    class="btn green-btn modal-btn"
                    @click="expandAllNodes()"
                >
                    <span> OK </span>
                </button>
            </div>
        </div>
    </div>
    <!-- Display loading screen while asynchronous call is made. -->
    <Suspense>
        <template #default>
            <TidyTree
                v-if="sessionDetailsStore.isLoggedIn"
                ref="childComponent"
            />
            <TidyTreeNoAccount v-else ref="childComponent" />
        </template>
        <template #fallback>
            <span>Loading...</span>
        </template>
    </Suspense>

    <!-- Bottom grade level truncation filters
        Not available on phone view -->
    <div
        v-if="sessionDetailsStore.isLoggedIn"
        class="tablet-and-up-legend position-absolute bottom-legend-div d-flex"
    >
        <div v-if="isGradeFilter" class="legend">
            <!-- Grade buttons -->
            <button
                class="btn grade-school me-2"
                @click="
                    this.gradeFilter = 'grade_school';
                    $refs.childComponent.filter(
                        this.gradeFilter,
                        this.subjectFilters
                    );
                "
            >
                Grade school
            </button>
            <button
                class="btn middle-school me-2"
                @click="
                    this.gradeFilter = 'middle_school';
                    $refs.childComponent.filter(
                        this.gradeFilter,
                        this.subjectFilters
                    );
                "
            >
                Middle school
            </button>
            <button
                class="btn high-school me-2"
                @click="
                    this.gradeFilter = 'high_school';
                    $refs.childComponent.filter(
                        this.gradeFilter,
                        this.subjectFilters
                    );
                "
            >
                High school
            </button>
            <button
                class="btn college me-2"
                @click="
                    this.gradeFilter = 'college';
                    $refs.childComponent.filter(
                        this.gradeFilter,
                        this.subjectFilters
                    );
                "
            >
                College
            </button>
            <button
                class="btn phd me-2"
                @click="
                    this.gradeFilter = 'phd';
                    $refs.childComponent.filter(
                        this.gradeFilter,
                        this.subjectFilters
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
    <div
        v-if="sessionDetailsStore.isLoggedIn"
        class="tablet-and-up-legend position-absolute left-legend-div"
    >
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
                        this.subjectFilters
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
                        this.subjectFilters
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
                        this.subjectFilters
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
                        this.subjectFilters
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
                        this.subjectFilters
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
                        this.subjectFilters
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
                        this.subjectFilters
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
</template>

<style>
.chosen-subject,
.switch-btn {
    background-color: var(--primary-color) !important;
    color: white;
}

.chosen-subject:hover,
.switch-btn:hover {
    background-color: var(--primary-color) !important;
    color: white;
}

.hidden-subject {
    background-color: grey !important;
    color: black;
}

.hidden-subject:hover {
    background-color: var(--primary-color) !important;
    color: white;
    border: 1px solid black;
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

.legend .btn {
    color: black;
    font-weight: 500;
    border: 1px solid black;
}

.legend-div {
    width: 100%;
    z-index: 2;
    top: 70px;
}

/* Grade level legend */
.search-bar {
    border: 1px solid #dce2f2;
    border-radius: 8px;
    height: 40px;
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
    /* extremely  weird things when 100% does not match the parent div*/
    width: 100.3%;
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

.result-row:focus {
    border: 1px solid #133b61;
}

.mobile-legend {
    display: none;
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
/* Level colors */
.legend .grade-school {
    background-color: #40e0d0;
}
.legend .middle-school {
    background-color: #33a133;
}
.legend .high-school {
    background-color: #ffd700;
}
.legend .college {
    background-color: #ffa500;
}
.legend .phd {
    background-color: #ff0000;
}

.skill-tree-input {
    width: 100%;
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
    .mobile-legend {
        display: flex;
    }

    .tablet-and-up-legend {
        display: none;
    }

    .search-mobile-row {
        margin-left: 0px;
        margin-right: auto;
    }

    /* Modal Content/Box */
    .modal-content {
        width: 90%;
        margin-top: 30%;
    }
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
/*---*/

.modal-btn {
    width: fit-content;
}

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
    max-width: fit-content;
}

.green-btn:hover {
    background-color: #3eb3a3;
}
.red-btn {
    background-color: #e24d4d;
    color: white;
    border: 1px solid #d33622;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.red-btn:hover {
    background-color: #cc3535;
    color: white;
}
</style>
