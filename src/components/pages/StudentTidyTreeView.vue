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
            studentId: this.$route.params.studentId,
            // Tutorial tooltips
            isTutorialComplete: false,
            showTutorialTip1: false,
            showTutorialTip2: false,
            showTutorialTip3: false,
            showTutorialTip4: false,
            showTutorialTip5: false,
            showTutorialTip6: false,
            showTutorialTip7: false,
            showTutorialTip8: false,
            showMobileTutorialTip5: false,
            showMobileTutorialTip6: false,
            showMobileTutorialTip7: false,
            isGradeFilter: true,
            isSubjectFilter: true,
            gradeFilter: 'phd',
            subjectFilters: [
                'Language',
                'Mathematics',
                'Science and Invention',
                'Computer Science',
                'History',
                'Life',
                'Dangerous Ideas'
            ],
            isUnlockedSkillsOnlyFilter: false,
            showMobileFiltersModal: false,
            isMobileCheck: window.innerWidth,
            isSkillsLocked: null
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
            if (this.usersStore.users[i].id == this.studentId) {
                this.studentName = this.usersStore.users[i].username;
            }
        }

        await this.checkIfSkillsLocked();

        // Check if tutorial has been seen.
        this.checkIfTutorialComplete();
    },
    components: {
        StudentTidyTree
    },
    methods: {
        async checkIfSkillsLocked() {
            const result = await fetch(
                '/instructor-students/' + this.studentId + '/is-skills-locked'
            );
            this.isSkillsLocked = await result.json();
        },
        // Filters
        updateSubjectFilters(subject) {
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
        },
        toggleisUnlockedSkillsFilter() {
            if (this.isUnlockedSkillsOnlyFilter == 1) {
                this.isUnlockedSkillsOnlyFilter = 0;
            } else if (this.isUnlockedSkillsOnlyFilter == 0) {
                this.isUnlockedSkillsOnlyFilter = 1;
            }
        },
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
                this.showTutorialTip3 = true;
            } else if (step == 3) {
                this.showTutorialTip3 = false;
                this.showTutorialTip4 = true;
            } else if (step == 4) {
                this.showTutorialTip4 = false;
                if (this.isMobileCheck > 576) {
                    this.showTutorialTip5 = true;
                } else {
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
                if (this.isMobileCheck > 576) {
                    this.showTutorialTip7 = false;
                    this.showTutorialTip8 = true;
                } else {
                    this.showMobileTutorialTip7 = false;
                    this.markTutorialComplete();
                }
            } else if (step == 8) {
                if (this.isMobileCheck > 576) {
                    this.showTutorialTip8 = false;
                    this.markTutorialComplete();
                }
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
    <div class="container-fluid position-absolute legend-div">
        <div class="mobile-legend">
            <div class="d-flex justify-content-between w-100">
                <h1 class="heading h2">{{ studentName }}</h1>
                <div>
                    <button
                        class="btn primary-btn me-1"
                        @click="showMobileFiltersModal = true"
                    >
                        Filters
                    </button>
                    <button
                        class="btn primary-btn me-1 d-md-block d-none"
                        @click="$refs.childComponent.resetPos()"
                    >
                        Center
                    </button>
                    <button
                        class="btn primary-btn"
                        @click="$refs.childComponent.restartTutorial()"
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
        <div class="tablet-and-up-legend">
            <!-- Center, expand all, print buttons -->
            <div class="d-flex justify-content-between w-100">
                <h1 class="heading h2">{{ studentName }}</h1>
                <div>
                    <div>
                        <!-- Reset Button -->
                        <button
                            class="btn primary-btn me-2"
                            @click="$refs.childComponent.resetPos()"
                        >
                            Center
                        </button>
                        <!-- Print Button -->
                        <button
                            class="btn primary-btn me-2"
                            @click="$refs.childComponent.printPDF()"
                        >
                            Print
                        </button>
                        <!-- Restart Tutorial Button -->
                        <button
                            class="btn primary-btn"
                            @click="$refs.childComponent.restartTutorial()"
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
            <!-- Tooltips -->
            <div class="d-flex justify-content-end w-100">
                <div
                    v-if="showTutorialTip8"
                    class="info-panel bg-light rounded p-2 mb-2 mt-2 float-right"
                >
                    <p>
                        Use the center button to center the skill tree,<br />
                        and the print button to print a PDF.
                    </p>
                    <button
                        class="btn primary-btn"
                        @click="progressTutorial(8)"
                    >
                        close
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Display loading screen while asynchronous call is made. -->
    <Suspense>
        <template #default>
            <StudentTidyTree
                :studentId="$route.params.studentId"
                :studentName="studentName"
                :restartTutorial="restartTutorial"
                ref="childComponent"
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
            v-if="showTutorialTip5"
            class="info-panel bg-light rounded p-2 mb-2"
        >
            <p>Use the buttons below to filter the skills by level.</p>
            <button class="btn primary-btn" @click="progressTutorial(5)">
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
                            this.gradeFilter == 'grade_school'
                    }"
                    @click="
                        this.gradeFilter = 'grade_school';
                        $refs.childComponent.filter(
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
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
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
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
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
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
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
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
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
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
            <div v-if="isSubjectFilter" class="d-flex flex-column">
                <button
                    class="btn mb-2"
                    :class="{
                        'chosen-subject': subjectFilters.includes('Language'),
                        'hidden-subject': !subjectFilters.includes('Language')
                    }"
                    @click="
                        this.updateSubjectFilters('Language');
                        $refs.childComponent.filter(
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
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
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
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
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
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
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
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
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
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
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
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
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
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
        <div v-if="showTutorialTip6" class="info-panel bg-light rounded p-2">
            Use the buttons on the left to filter the skills by subject.<br />
            <button class="btn primary-btn" @click="progressTutorial(6)">
                next
            </button>
        </div>
    </div>

    <!-- Filter for showing only unlocked skills in bottom left corner -->
    <div
        v-if="userDetailsStore.isSkillsLocked == 1"
        class="unlocked-filter d-flex flex-column-reverse"
    >
        <button
            class="btn primary-btn"
            @click="
                toggleisUnlockedSkillsFilter();
                $refs.childComponent.filter(
                    $route.params.studentId,
                    gradeFilter,
                    subjectFilters,
                    isUnlockedSkillsOnlyFilter
                );
            "
        >
            <span v-if="isUnlockedSkillsOnlyFilter">All skills</span>
            <span v-else>Available skills only</span>
        </button>

        <div
            v-if="showTutorialTip7"
            class="info-panel bg-light rounded p-2 mb-2"
        >
            <p>Use this button to toggle between unlocked and locked skills.</p>
            <button class="btn primary-btn" @click="progressTutorial(7)">
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

            <div class="d-flex flex-column">
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
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
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
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
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
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
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
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
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
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
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
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
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
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
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
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
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
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
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
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
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
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
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
                            $route.params.studentId,
                            gradeFilter,
                            subjectFilters,
                            isUnlockedSkillsOnlyFilter
                        );
                    "
                >
                    PHD
                </button>
            </div>
        </div>
    </div>

    <!-- Tooltip modal -->
    <div
        v-if="
            showTutorialTip1 ||
            showTutorialTip2 ||
            showTutorialTip3 ||
            showTutorialTip4 ||
            showMobileTutorialTip5 ||
            showMobileTutorialTip6 ||
            showMobileTutorialTip7
        "
        class="modal"
    >
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
                    next
                </button>
            </div>
            <div v-else-if="showTutorialTip3">
                <strong>Navigation</strong>
                <p>
                    If you know how to use Google Maps, you should know how to
                    navigate here.
                </p>
                <button class="btn primary-btn" @click="progressTutorial(3)">
                    next
                </button>
            </div>
            <div v-else-if="showTutorialTip4">
                <p>On a computer, use the mouse to navigate around.</p>
                <p>
                    Zoom in and out using the mousewheel, or by pressing the
                    <em>PageUp</em> and <em>PageDown</em> keys.
                </p>
                <p>
                    On a tablet or phone, navigate by dragging the screen. Zoom
                    in and out by pinching and zooming.
                </p>
                <p>
                    For computers and tablets, there are also zoom buttons at
                    the bottom right.
                </p>
                <button class="btn primary-btn" @click="progressTutorial(4)">
                    next
                </button>
            </div>
            <div v-else-if="showMobileTutorialTip5">
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
                <p>
                    Use the lock button below on the lower left side of the
                    screen to toggle between unlocked and locked skills.
                </p>
                <button class="btn primary-btn" @click="progressTutorial(7)">
                    close
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.mobile-legend {
    display: none;
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

    .mobile-legend {
        display: flex;
    }
}

/* Filters */
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

.legend-div {
    width: 100%;
    z-index: 2;
    top: 80px;
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

/* Subject filters */

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

.unlocked-filter {
    position: fixed;
    bottom: 10px;
    left: 3px;
}
.unlocked-filter button {
    border: 1px solid black;
}

/* Tutorials */
/* Tooltips */
.info-panel {
    border-color: var(--primary-color);
    border-width: 2px;
    border-style: solid;
    width: fit-content;
}
</style>
