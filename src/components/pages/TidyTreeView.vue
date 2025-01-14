<script>
import { useSessionDetailsStore } from '../../stores/SessionDetailsStore.js';
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';

import SkillTreeSearchBar from '../components/skills-tree-search-bar/SkillTreeSearchBar.vue';
import TidyTree from '../components/skilltrees/TidyTree.vue';
import TidyTreeNoAccount from '../components/skilltrees/TidyTreeNoAccount.vue';

export default {
    setup() {
        const sessionDetailsStore = useSessionDetailsStore();
        const userDetailsStore = useUserDetailsStore();

        return {
            sessionDetailsStore,
            userDetailsStore
        };
    },
    data() {
        return {
            searchText: '',
            lastChooseResult: '',
            showResult: false,
            showConfirmModal: false,
            // Filters
            isGradeFilter: true,
            isSubjectFilter: true,
            showMobileFiltersModal: false,
            // For guest mode only
            gradeFilter: 'phd',
            subjectFilters: [],
            // Tutorial tooltips
            isTutorialComplete: false,
            showTutorialTip1: false,
            showTutorialTip2: false,
            showTutorialTip3: false,
            showTutorialTip4: false,
            showMobileTutorialTip4: false,
            showTutorialTip5: false,
            showMobileTutorialTip5: false,
            showTutorialTip6: false,
            showMobileTutorialTip6: false,
            showMobileTutorialTip7: false,
            showTutorialTip7: false,
            showTutorialTip8: false,
            showTutorialTip9: false,
            isMobileCheck: window.innerWidth
        };
    },
    created() {
        // Turn this on only if user is logged in.
        if (this.sessionDetailsStore.isLoggedIn == true) {
        } else {
            this.subjectFilters = [
                'Language',
                'Mathematics',
                'Science and Invention',
                'Computer Science',
                'History',
                'Life',
                'Dangerous Ideas'
            ];
        }

        if (this.sessionDetailsStore.isLoggedIn) {
            this.checkIfTutorialComplete();
        }
    },
    mounted() {
        this.GetGoogleLoginResult();
    },
    components: { TidyTree, TidyTreeNoAccount, SkillTreeSearchBar },
    methods: {
        resetPos() {
            this.$refs.childComponent.resetPos();
        },
        async handleChooseResult(resultName) {
            this.lastChooseResult = resultName;
            // Find the node with name
            const node = this.$refs.childComponent.findNodeWithName(resultName);

            if (!node) {
                await this.$refs.childComponent.findHiddenSkill(resultName);
                return false;
            }
            // go to the skill position
            this.$refs.childComponent.goToLocation(node);
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
        // Filters
        updateSubjectFilters(subject) {
            // Only if user is logged in.
            if (this.sessionDetailsStore.isLoggedIn == true) {
                // if all subjects are selected, show only the clicked subject
                if (this.userDetailsStore.subjectFilters.length == 7) {
                    this.userDetailsStore.subjectFilters = [];
                    this.userDetailsStore.subjectFilters.push(subject);
                }

                // Check if filter already present.
                else if (
                    this.userDetailsStore.subjectFilters.includes(subject)
                ) {
                    // remove it
                    this.userDetailsStore.subjectFilters =
                        this.userDetailsStore.subjectFilters.filter(
                            (e) => e !== subject
                        );

                    // if array is empty, add all subjects.
                    if (this.userDetailsStore.subjectFilters.length == 0) {
                        this.userDetailsStore.subjectFilters.push('Language');
                        this.userDetailsStore.subjectFilters.push(
                            'Mathematics'
                        );
                        this.userDetailsStore.subjectFilters.push(
                            'Science and Invention'
                        );
                        this.userDetailsStore.subjectFilters.push(
                            'Computer Science'
                        );
                        this.userDetailsStore.subjectFilters.push('History');
                        this.userDetailsStore.subjectFilters.push('Life');
                        this.userDetailsStore.subjectFilters.push(
                            'Dangerous Ideas'
                        );
                    }
                } else {
                    // add it
                    this.userDetailsStore.subjectFilters.push(subject);
                }
            }
            // If not logged in.
            else {
                // if all subjects are selected, show only the clicked subject
                if (this.subjectFilters.length == 7) {
                    this.subjectFilters = [];
                    this.subjectFilters.push(subject);
                }

                // Check if filter already present.
                else if (this.subjectFilters.includes(subject)) {
                    // remove it
                    this.subjectFilters = this.subjectFilters.filter(
                        (e) => e !== subject
                    );

                    // if array is empty, add all subjects.
                    if (this.subjectFilters.length == 0) {
                        this.subjectFilters.push('Language');
                        this.subjectFilters.push('Mathematics');
                        this.subjectFilters.push('Science and Invention');
                        this.subjectFilters.push('Computer Science');
                        this.subjectFilters.push('History');
                        this.subjectFilters.push('Life');
                        this.subjectFilters.push('Dangerous Ideas');
                    }
                } else {
                    // add it
                    this.subjectFilters.push(subject);
                }
            }
        },
        toggleisUnlockedSkillsFilter() {
            if (this.userDetailsStore.isUnlockedSkillsOnlyFilter == 1) {
                this.userDetailsStore.isUnlockedSkillsOnlyFilter = 0;
            } else if (this.userDetailsStore.isUnlockedSkillsOnlyFilter == 0) {
                this.userDetailsStore.isUnlockedSkillsOnlyFilter = 1;
            }
        },
        // Onboardning tutorials
        async checkIfTutorialComplete() {
            const result = await fetch(
                '/users/check-tutorial-progress/vertical-tree/' +
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
                if (this.isMobileCheck > 576) {
                    this.showTutorialTip4 = true;
                } else {
                    this.showMobileTutorialTip4 = true;
                }
            } else if (step == 4) {
                if (this.isMobileCheck > 576) {
                    this.showTutorialTip4 = false;
                    this.showTutorialTip5 = true;
                } else {
                    this.showMobileTutorialTip4 = false;
                    this.showMobileTutorialTip5 = true;
                }
            } else if (step == 5) {
                if (this.isMobileCheck > 576) {
                    this.showTutorialTip5 = false;
                    this.showTutorialTip6 = true;
                } else {
                    this.showMobileTutorialTip5 = false;
                    this.showMobileTutorialTip6 = true;
                }
            } else if (step == 6) {
                if (this.isMobileCheck > 576) {
                    this.showTutorialTip6 = false;
                    this.showTutorialTip7 = true;
                } else {
                    this.showMobileTutorialTip6 = false;
                    this.showMobileTutorialTip7 = true;
                }
            } else if (step == 7) {
                if(this.isMobileCheck > 576){
                    this.showTutorialTip7 = false;
                    this.showTutorialTip8 = true;
                } else{
                    this.showMobileTutorialTip7 = false;
                    this.markTutorialComplete();
                }           
            } else if (step == 8) {
                this.showTutorialTip8 = false;
                this.showTutorialTip9 = true;
            } else if (step == 9) {
                this.showTutorialTip9 = false;
                this.markTutorialComplete();
            }
        },
        restartTutorial() {
            if (this.isMobileCheck < 768) {
                this.restartMobileTutorial();
            } else this.restartTabletUpTutorial();
        },
        restartTabletUpTutorial() {
            this.showTutorialTip1 = true;
            this.showTutorialTip2 = false;
            this.showTutorialTip3 = false;
            this.showTutorialTip4 = false;
            this.showTutorialTip5 = false;
            this.showTutorialTip6 = false;
            this.showTutorialTip7 = false;
            this.showTutorialTip8 = false;
            this.isTutorialComplete = false;
        },
        restartMobileTutorial() {
            this.showTutorialTip1 = true;
            this.showTutorialTip2 = false;
            this.showTutorialTip3 = false;
            this.showMobileTutorialTip4 = false;
            this.showMobileTutorialTip5 = false;
            this.showMobileTutorialTip6 = false;
            this.showMobileTutorialTip7 = false;
            this.isTutorialComplete = false;
        },
        markTutorialComplete() {
            let url =
                '/users/mark-tutorial-complete/vertical-tree/' +
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
            <div class="search-mobile-row">
                <!-- Search feature -->
                <SkillTreeSearchBar
                    :findNode="handleChooseResult"
                    :clearResults="clearResult"
                />
            </div>
            <div class="d-flex">
                <button
                    class="btn primary-btn me-1"
                    @click="showMobileFiltersModal = true"
                >
                    Filters
                </button>
                <button class="btn primary-btn" @click="resetPos()">
                    Center
                </button>
                <!-- Restart tutorial button -->
                <button
                    v-if="sessionDetailsStore.isLoggedIn"
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
                        Center
                    </button>
                    <!-- Print Button -->
                    <button
                        class="btn primary-btn me-2"
                        @click="$refs.childComponent.printPDF()"
                    >
                        Print
                    </button>
                    <!-- Restart tutorial button -->
                    <button
                        v-if="sessionDetailsStore.isLoggedIn"
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
            <!-- Tooltips -->
            <div
                v-if="showTutorialTip7"
                class="info-panel bg-light rounded p-2 mb-2"
            >
                <p>Use the search field to search for specific skills.</p>
                <button class="btn primary-btn" @click="progressTutorial(7)">
                    next
                </button>
            </div>
            <div
                v-else-if="showTutorialTip8"
                class="info-panel bg-light rounded p-2 mb-2 mt-2 float-right"
            >
                <p>
                    Use the center button to center the skill tree,<br />
                    and the print button to print a PDF.
                </p>
                <button class="btn primary-btn" @click="progressTutorial(8)">
                    next
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

    <!-- Bottom grade level truncation filters -->
    <div class="tablet-and-up-legend position-absolute bottom-legend-div">
        <!-- Tooltip -->
        <div
            v-if="showTutorialTip6"
            class="info-panel bg-light rounded p-2 mb-2"
        >
            <p>Use the buttons below to filter the skills by level.</p>
            <button class="btn primary-btn" @click="progressTutorial(6)">
                next
            </button>
        </div>
        <!-- Grade buttons -->
        <!-- If user is logged in -->
        <div v-if="sessionDetailsStore.isLoggedIn" class="d-flex">
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
        <!-- If user is not logged in -->
        <div v-else class="d-flex">
            <div v-if="isGradeFilter" class="legend">
                <button
                    class="btn grade-school me-2"
                    :class="{
                        'active-grade-filter':
                            this.gradeFilter == 'grade_school'
                    }"
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
                    :class="{
                        'active-grade-filter':
                            this.gradeFilter == 'middle_school'
                    }"
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
                    :class="{
                        'active-grade-filter': this.gradeFilter == 'high_school'
                    }"
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
                    :class="{
                        'active-grade-filter': this.gradeFilter == 'college'
                    }"
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
                    :class="{
                        'active-grade-filter': this.gradeFilter == 'phd'
                    }"
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
    </div>

    <!-- Left root subject filters  -->
    <div class="tablet-and-up-legend position-absolute left-legend-div">
        <div>
            <div
                v-if="isSubjectFilter && sessionDetailsStore.isLoggedIn"
                class="d-flex flex-column"
            >
                <button
                    class="btn mb-2"
                    :class="{
                        'chosen-subject':
                            userDetailsStore.subjectFilters.includes(
                                'Language'
                            ),
                        'hidden-subject':
                            !userDetailsStore.subjectFilters.includes(
                                'Language'
                            )
                    }"
                    @click="
                        this.updateSubjectFilters('Language');
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
                        'chosen-subject':
                            userDetailsStore.subjectFilters.includes(
                                'Mathematics'
                            ),
                        'hidden-subject':
                            !userDetailsStore.subjectFilters.includes(
                                'Mathematics'
                            )
                    }"
                    @click="
                        this.updateSubjectFilters('Mathematics');
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
                        'chosen-subject':
                            userDetailsStore.subjectFilters.includes('History'),
                        'hidden-subject':
                            !userDetailsStore.subjectFilters.includes('History')
                    }"
                    @click="
                        this.updateSubjectFilters('History');
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
                        'chosen-subject':
                            userDetailsStore.subjectFilters.includes('Life'),
                        'hidden-subject':
                            !userDetailsStore.subjectFilters.includes('Life')
                    }"
                    @click="
                        this.updateSubjectFilters('Life');
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
                        'chosen-subject':
                            userDetailsStore.subjectFilters.includes(
                                'Computer Science'
                            ),
                        'hidden-subject':
                            !userDetailsStore.subjectFilters.includes(
                                'Computer Science'
                            )
                    }"
                    @click="
                        this.updateSubjectFilters('Computer Science');
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
                        'chosen-subject':
                            userDetailsStore.subjectFilters.includes(
                                'Science and Invention'
                            ),
                        'hidden-subject':
                            !userDetailsStore.subjectFilters.includes(
                                'Science and Invention'
                            )
                    }"
                    @click="
                        this.updateSubjectFilters('Science and Invention');
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
                        'chosen-subject':
                            userDetailsStore.subjectFilters.includes(
                                'Dangerous Ideas'
                            ),
                        'hidden-subject':
                            !userDetailsStore.subjectFilters.includes(
                                'Dangerous Ideas'
                            )
                    }"
                    @click="
                        this.updateSubjectFilters('Dangerous Ideas');
                        $refs.childComponent.filter(
                            this.gradeFilter,
                            this.subjectFilters
                        );
                    "
                >
                    Dangerous Ideas
                </button>
            </div>
            <div v-else-if="isSubjectFilter" class="d-flex flex-column">
                <button
                    class="btn mb-2"
                    :class="{
                        'chosen-subject': subjectFilters.includes('Language'),
                        'hidden-subject': !subjectFilters.includes('Language')
                    }"
                    @click="
                        this.updateSubjectFilters('Language');
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
                        'chosen-subject':
                            subjectFilters.includes('Mathematics'),
                        'hidden-subject':
                            !subjectFilters.includes('Mathematics')
                    }"
                    @click="
                        this.updateSubjectFilters('Mathematics');
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
                        'chosen-subject': subjectFilters.includes('History'),
                        'hidden-subject': !subjectFilters.includes('History')
                    }"
                    @click="
                        this.updateSubjectFilters('History');
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
                        'chosen-subject': subjectFilters.includes('Life'),
                        'hidden-subject': !subjectFilters.includes('Life')
                    }"
                    @click="
                        this.updateSubjectFilters('Life');
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
                        'chosen-subject':
                            subjectFilters.includes('Computer Science'),
                        'hidden-subject':
                            !subjectFilters.includes('Computer Science')
                    }"
                    @click="
                        this.updateSubjectFilters('Computer Science');
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
                        'chosen-subject': subjectFilters.includes(
                            'Science and Invention'
                        ),
                        'hidden-subject': !subjectFilters.includes(
                            'Science and Invention'
                        )
                    }"
                    @click="
                        this.updateSubjectFilters('Science and Invention');
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
                        'chosen-subject':
                            subjectFilters.includes('Dangerous Ideas'),
                        'hidden-subject':
                            !subjectFilters.includes('Dangerous Ideas')
                    }"
                    @click="
                        this.updateSubjectFilters('Dangerous Ideas');
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
        <!-- Tooltip -->
        <div v-if="showTutorialTip4" class="info-panel bg-light rounded p-2">
            Use the buttons on the left to filter the skills by subject.<br />
            <button class="btn primary-btn" @click="progressTutorial(4)">
                next
            </button>
        </div>
    </div>

    <!-- Filter for showing only unlocked skills in bottom left corner -->
    <div v-if="sessionDetailsStore.isLoggedIn" class="unlocked-filter d-flex">
        <div>
            <button
                class="btn primary-btn"
                @click="
                    toggleisUnlockedSkillsFilter();
                    $refs.childComponent.filter();
                "
            >
                <svg
                    v-if="userDetailsStore.isUnlockedSkillsOnlyFilter"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 576 512"
                    width="18"
                    height="18"
                    fill="white"
                >
                    <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                    <path
                        class=""
                        d="M352 144c0-44.2 35.8-80 80-80s80 35.8 80 80l0 48c0 17.7 14.3 32 32 32s32-14.3 32-32l0-48C576 64.5 511.5 0 432 0S288 64.5 288 144l0 48L64 192c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64l-32 0 0-48z"
                    />
                </svg>
                <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    width="18"
                    height="18"
                    fill="white"
                >
                    <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                    <path
                        d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"
                    />
                </svg>
            </button>
        </div>
        <div
            v-if="showTutorialTip5"
            class="info-panel bg-light rounded p-2 mb-2"
        >
            <p>Use the buttons below to toggle between unlocked and locked skills.</p>
            <button class="btn primary-btn" @click="progressTutorial(5)">
                next
            </button>
        </div>
    </div>

    <!-- Filters Modal for Mobile Phone View.-->
    <div v-if="showMobileFiltersModal" class="modal">
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

            <div
                v-if="sessionDetailsStore.isLoggedIn"
                class="d-flex flex-column"
            >
                <!-- Subject buttons -->
                <button
                    class="btn"
                    :class="{
                        'chosen-subject':
                            userDetailsStore.subjectFilters.includes(
                                'Language'
                            ),
                        'hidden-subject':
                            !userDetailsStore.subjectFilters.includes(
                                'Language'
                            )
                    }"
                    @click="
                        this.updateSubjectFilters('Language');
                        $refs.childComponent.filter();
                    "
                >
                    Language
                </button>
                <button
                    class="btn"
                    :class="{
                        'chosen-subject':
                            userDetailsStore.subjectFilters.includes(
                                'Mathematics'
                            ),
                        'hidden-subject':
                            !userDetailsStore.subjectFilters.includes(
                                'Mathematics'
                            )
                    }"
                    @click="
                        this.updateSubjectFilters('Mathematics');
                        $refs.childComponent.filter();
                    "
                >
                    Math
                </button>
                <button
                    class="btn"
                    :class="{
                        'chosen-subject':
                            userDetailsStore.subjectFilters.includes('History'),
                        'hidden-subject':
                            !userDetailsStore.subjectFilters.includes('History')
                    }"
                    @click="
                        this.updateSubjectFilters('History');
                        $refs.childComponent.filter();
                    "
                >
                    History
                </button>
                <button
                    class="btn"
                    :class="{
                        'chosen-subject':
                            userDetailsStore.subjectFilters.includes('Life'),
                        'hidden-subject':
                            !userDetailsStore.subjectFilters.includes('Life')
                    }"
                    @click="
                        this.updateSubjectFilters('Life');
                        $refs.childComponent.filter();
                    "
                >
                    Life
                </button>
                <button
                    class="btn"
                    :class="{
                        'chosen-subject':
                            userDetailsStore.subjectFilters.includes(
                                'Computer Science'
                            ),
                        'hidden-subject':
                            !userDetailsStore.subjectFilters.includes(
                                'Computer Science'
                            )
                    }"
                    @click="
                        this.updateSubjectFilters('Computer Science');
                        $refs.childComponent.filter();
                    "
                >
                    Computer Science
                </button>
                <button
                    class="btn"
                    :class="{
                        'chosen-subject':
                            userDetailsStore.subjectFilters.includes(
                                'Science and Invention'
                            ),
                        'hidden-subject':
                            !userDetailsStore.subjectFilters.includes(
                                'Science and Invention'
                            )
                    }"
                    @click="
                        this.updateSubjectFilters('Science and Invention');
                        $refs.childComponent.filter();
                    "
                >
                    Science & Invention
                </button>
                <button
                    class="btn mb-2"
                    :class="{
                        'chosen-subject':
                            userDetailsStore.subjectFilters.includes(
                                'Dangerous Ideas'
                            ),
                        'hidden-subject':
                            !userDetailsStore.subjectFilters.includes(
                                'Dangerous Ideas'
                            )
                    }"
                    @click="
                        this.updateSubjectFilters('Dangerous Ideas');
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
            <div v-else class="d-flex flex-column">
                <!-- Subject buttons -->
                <button
                    class="btn"
                    :class="{
                        'chosen-subject': subjectFilters.includes('Language'),
                        'hidden-subject': !subjectFilters.includes('Language')
                    }"
                    @click="
                        this.updateSubjectFilters('Language');
                        $refs.childComponent.filter(
                            this.gradeFilter,
                            this.subjectFilters
                        );
                    "
                >
                    Language
                </button>
                <button
                    class="btn"
                    :class="{
                        'chosen-subject':
                            subjectFilters.includes('Mathematics'),
                        'hidden-subject':
                            !subjectFilters.includes('Mathematics')
                    }"
                    @click="
                        this.updateSubjectFilters('Mathematics');
                        $refs.childComponent.filter(
                            this.gradeFilter,
                            this.subjectFilters
                        );
                    "
                >
                    Math
                </button>
                <button
                    class="btn"
                    :class="{
                        'chosen-subject': subjectFilters.includes('History'),
                        'hidden-subject': !subjectFilters.includes('History')
                    }"
                    @click="
                        this.updateSubjectFilters('History');
                        $refs.childComponent.filter(
                            this.gradeFilter,
                            this.subjectFilters
                        );
                    "
                >
                    History
                </button>
                <button
                    class="btn"
                    :class="{
                        'chosen-subject': subjectFilters.includes('Life'),
                        'hidden-subject': !subjectFilters.includes('Life')
                    }"
                    @click="
                        this.updateSubjectFilters('Life');
                        $refs.childComponent.filter(
                            this.gradeFilter,
                            this.subjectFilters
                        );
                    "
                >
                    Life
                </button>
                <button
                    class="btn"
                    :class="{
                        'chosen-subject':
                            subjectFilters.includes('Computer Science'),
                        'hidden-subject':
                            !subjectFilters.includes('Computer Science')
                    }"
                    @click="
                        this.updateSubjectFilters('Computer Science');
                        $refs.childComponent.filter(
                            this.gradeFilter,
                            this.subjectFilters
                        );
                    "
                >
                    Computer Science
                </button>
                <button
                    class="btn"
                    :class="{
                        'chosen-subject': subjectFilters.includes(
                            'Science and Invention'
                        ),
                        'hidden-subject': !subjectFilters.includes(
                            'Science and Invention'
                        )
                    }"
                    @click="
                        this.updateSubjectFilters('Science and Invention');
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
                        'chosen-subject':
                            subjectFilters.includes('Dangerous Ideas'),
                        'hidden-subject':
                            !subjectFilters.includes('Dangerous Ideas')
                    }"
                    @click="
                        this.updateSubjectFilters('Dangerous Ideas');
                        $refs.childComponent.filter(
                            this.gradeFilter,
                            this.subjectFilters
                        );
                    "
                >
                    Dangerous Ideas
                </button>
                <!-- Grade buttons -->
                <button
                    class="btn grade-school"
                    :class="{
                        'active-grade-filter':
                            this.gradeFilter == 'grade_school'
                    }"
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
                    class="btn middle-school"
                    :class="{
                        'active-grade-filter':
                            this.gradeFilter == 'middle_school'
                    }"
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
                    class="btn high-school"
                    :class="{
                        'active-grade-filter': this.gradeFilter == 'high_school'
                    }"
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
                    class="btn college"
                    :class="{
                        'active-grade-filter': this.gradeFilter == 'college'
                    }"
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
                    class="btn phd"
                    :class="{
                        'active-grade-filter': this.gradeFilter == 'phd'
                    }"
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
        </div>
    </div>

    <!-- Onboarding tooltip modal -->
    <div
        v-if="
            showTutorialTip1 ||
            showTutorialTip2 ||
            showTutorialTip3 ||
            showTutorialTip9 ||
            showMobileTutorialTip4 ||
            showMobileTutorialTip5 ||
            showMobileTutorialTip6 || 
            showMobileTutorialTip7
        "
        class="modal"
    >
        <div class="modal-content">
            <div v-if="showTutorialTip1">
                <p>Welcome to the Collins Institute!</p>
                <p>
                    Click
                    <button
                        class="btn primary-btn"
                        @click="progressTutorial(1)"
                    >
                        next
                    </button>
                    to start the tutorial.
                </p>
            </div>
            <div v-else-if="showTutorialTip2">
                <p>
                    This page provides a look at all the skills one can study
                    here.
                </p>
                <button class="btn primary-btn" @click="progressTutorial(2)">
                    next
                </button>
            </div>
            <div v-else-if="showTutorialTip3">
                <p>
                    On a computer, use the mouse to navigate around. Zoom in and
                    out using the mousewheel.
                </p>
                <p>
                    On a tablet or phone, navigate by dragging the screen, or
                    use the thumbstick at the bottom right. Zoom in and out by
                    pinching and zooming.
                </p>
                <p>
                    There is also a slider bar at the bottom right, that ca be
                    used for zooming.
                </p>
                <button class="btn primary-btn" @click="progressTutorial(3)">
                    next
                </button>
            </div>
            <div v-if="showTutorialTip9">
                <p>
                    When you're ready, try another page by clicking one in the
                    navigation bar at the top right.
                </p>
                <button class="btn primary-btn" @click="progressTutorial(9)">
                    close
                </button>
            </div>
            <div v-if="showMobileTutorialTip4">
                <p>Use the search field to search for specific skills.</p>
                <button class="btn primary-btn" @click="progressTutorial(4)">
                    next
                </button>
            </div>
            <div v-if="showMobileTutorialTip5">
                <p>
                    The filter button will show ways to filter the skill tree by
                    both subjects and levels.
                </p>
                <button class="btn primary-btn" @click="progressTutorial(5)">
                    next
                </button>
            </div>
            <div v-if="showMobileTutorialTip6">
                <p>The center button will recenter the tree</p>
                <button class="btn primary-btn" @click="progressTutorial(6)">
                    next
                </button>
            </div>
            <div v-if="showMobileTutorialTip7">
                <p>Use the lock button below on the lower left side of the screen to toggle between unlocked and locked skills.</p>
                <button class="btn primary-btn" @click="progressTutorial(7)">
                    close
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

.float-right {
    float: right;
}

/*
 * Filters
 */

.unlocked-filter {
    position: fixed;
    bottom: 10px;
    left: 3px;
}
.unlocked-filter button {
    border: 1px solid black;
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

/* Root subject filters */
.chosen-subject,
.switch-btn {
    background-color: var(--primary-color) !important;
    color: var(--primary-contrast-color) !important;
    opacity: 1;
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

.bottom-legend-div {
    left: 50%;
    transform: translateX(-50%);
    bottom: 10px;
}

.left-legend-div {
    top: 50%;
    transform: translateY(-50%);
    left: 3px;
    /* For the tooltip */
    display: flex;
    align-items: center;
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

/* Modal filters */
.modal .btn {
    width: 200px;
    margin: auto;
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

.bottom-legend-div .btn {
    border: 1px solid black;
    font-weight: 500;
}

.skill-tree-input {
    width: 100%;
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
    .mobile-legend {
        display: flex;
    }

    .tablet-and-up-legend {
        display: none !important;
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
</style>
