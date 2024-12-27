<script>
// Stores
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';
import { useUsersStore } from '../../stores/UsersStore';
// Components
import SkillsListParent from '../components/SkillsListParent.vue';
import SkillTreeSearchBar from '../components/skills-tree-search-bar/SkillTreeSearchBar.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const usersStore = useUsersStore();

        return {
            userDetailsStore,
            usersStore
        };
    },
    data() {
        return {
            studentId: this.$route.params.studentId,
            studentName: '',
            instructorMode: false,
            searchText: '',
            resultsSkills: [],
            chooseResult: null,
            // flag to make watcher do not react when user choose a result
            updateChooseResult: false,
            nameList: [],
            showTutorialTip1: false,
            showTutorialTip2: false,
            showMobileTutorialTip2: false,
            showTutorialTip3: false,
            showMobileTutorialTip3: false,
            showTutorialTip4: false,
            showMobileTutorialTip4: false,
            showTutorialTip5: false,
            showMobileTutorialTip5: false
        };
    },
    components: {
        SkillsListParent,
        SkillTreeSearchBar
    },
    async created() {
        // Tooltips
        if (localStorage.getItem('isCollapsibleTreeCompleted') != 'true') {
            this.showTutorialTip1 = true;
        }

        // Check if regular or instructor mode.
        if (typeof this.studentId == 'string') {
            this.instructorMode = true;

            if (this.usersStore.users.length == 0)
                await this.usersStore.getUsers();
            for (let i = 0; i < this.usersStore.users.length; i++) {
                if (this.usersStore.users[i].id == this.studentId) {
                    this.studentName = this.usersStore.users[i].username;
                }
            }
        }
    },
    methods: {
        clearResults() {
            this.$refs.skillList.path = [];
        },
        findNode(skillName) {
            this.$refs.skillList.findNode(skillName);
        },
        progressTutorial(step) {
            if (step == 1) {
                this.showTutorialTip1 = false;
                if (this.isMobileCheck > 576) {
                    this.showTutorialTip2 = true;
                } else {
                    this.showMobileTutorialTip2 = true;
                }
            } else if (step == 2) {
                if (this.isMobileCheck > 576) {
                    this.showTutorialTip2 = false;
                    this.showTutorialTip3 = true;
                } else {
                    this.showMobileTutorialTip2 = false;
                    this.showMobileTutorialTip3 = true;
                }
            } else if (step == 3) {
                if (this.isMobileCheck > 576) {
                    this.showTutorialTip3 = false;
                    this.showTutorialTip4 = true;
                } else {
                    this.showMobileTutorialTip3 = false;
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
                } else {
                    this.showMobileTutorialTip5 = false;
                }
                // Store
                localStorage.setItem('isCollapsibleTreeCompleted', 'true');
            }
        }
    }
};
</script>

<template>
    <div id="legend" class="container-fluid">
        <div class="position-absolute legend-div">
            <div id="mobile-legend">
                <div v-if="instructorMode" class="col-lg-9">
                    <h1 class="heading h4">Student: {{ studentName }}</h1>
                </div>
                <div class="search-mobile-row">
                    <!-- Search feature -->
                    <SkillTreeSearchBar
                        :findNode="findNode"
                        :clearResults="clearResults"
                    />
                </div>
            </div>
            <div id="tablet-and-up-legend">
                <div class="legend row">
                    <!-- Grade level filter -->
                    <div
                        v-if="
                            !instructorMode && userDetailsStore.role != 'admin'
                        "
                        class="col-lg-9 d-flex"
                    >
                        <button
                            class="btn grade-school me-2"
                            :class="{
                                'active-grade-filter':
                                    this.userDetailsStore.gradeFilter ==
                                    'grade_school'
                            }"
                            @click="
                                this.userDetailsStore.gradeFilter =
                                    'grade_school';
                                $refs.skillList.filter();
                            "
                        >
                            Grade school
                        </button>

                        <button
                            class="btn middle-school me-2"
                            :class="{
                                'active-grade-filter':
                                    this.userDetailsStore.gradeFilter ==
                                    'middle_school'
                            }"
                            @click="
                                this.userDetailsStore.gradeFilter =
                                    'middle_school';
                                $refs.skillList.filter();
                            "
                        >
                            Middle school
                        </button>
                        <button
                            class="btn high-school me-2"
                            :class="{
                                'active-grade-filter':
                                    this.userDetailsStore.gradeFilter ==
                                    'high_school'
                            }"
                            @click="
                                this.userDetailsStore.gradeFilter =
                                    'high_school';
                                $refs.skillList.filter();
                            "
                        >
                            High school
                        </button>
                        <button
                            class="btn college me-2"
                            :class="{
                                'active-grade-filter':
                                    this.userDetailsStore.gradeFilter ==
                                    'college'
                            }"
                            @click="
                                this.userDetailsStore.gradeFilter = 'college';
                                $refs.skillList.filter();
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
                                $refs.skillList.filter();
                            "
                        >
                            PHD
                        </button>
                        <!-- Add skill button -->
                        <router-link class="btn primary-btn" to="/skills/add"
                            >New skill&nbsp;
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
                        <!-- Skill filters button -->
                        <div
                            v-if="userDetailsStore.role == 'admin'"
                            class="d-flex gap-2"
                        >
                            <router-link class="btn primary-btn" to="/tags"
                                >Skill Filters</router-link
                            >
                        </div>
                    </div>
                    <div v-else-if="instructorMode" class="col-lg-9">
                        <h1 class="heading">Student: {{ studentName }}</h1>
                    </div>

                    <div class="col-lg-3">
                        <!-- Search Feature -->
                        <SkillTreeSearchBar
                            class="me-4"
                            :findNode="findNode"
                            :clearResults="clearResults"
                        />
                    </div>
                </div>
                <!-- Tooltips -->
                <div
                    v-if="
                        showTutorialTip2 ||
                        showTutorialTip3 ||
                        showTutorialTip4 ||
                        showTutorialTip5
                    "
                    class="info-panel me-4 mt-1"
                >
                    <div
                        v-if="showTutorialTip2"
                        class="info-text mt-1 rounded p-2"
                    >
                        <p>
                            Greyed out nodes are locked. You need to unlock them
                            by passing the quizzes of the skills that come
                            before them.
                        </p>
                        <button
                            class="btn primary-btn"
                            @click="progressTutorial(2)"
                        >
                            next
                        </button>
                    </div>
                    <div
                        v-else-if="showTutorialTip3"
                        class="info-text mt-1 rounded p-2"
                    >
                        <p>
                            Sad face icons mean that the skill has not yet been
                            mastered. When you master a skill, that face will
                            become happy.
                        </p>
                        <button
                            class="btn primary-btn"
                            @click="progressTutorial(3)"
                        >
                            next
                        </button>
                    </div>
                    <div
                        v-else-if="showTutorialTip4"
                        class="info-text mt-1 rounded p-2"
                    >
                        <p>Some nodes have a plus or minus sign.</p>
                        <p>
                            This indicates that the skill contains mini-skills
                            that need to be mastered, before mastery of the main
                            skill can be attempted.
                        </p>
                        <button
                            class="btn primary-btn"
                            @click="progressTutorial(4)"
                        >
                            next
                        </button>
                    </div>
                    <div
                        v-else-if="showTutorialTip5"
                        class="info-text mt-1 rounded p-2"
                    >
                        <p>
                            Click on a skill node to go to the page for that
                            skill.
                        </p>
                        <p>
                            Remember, you can only attempt to master unlocked
                            skills.
                        </p>
                        <button
                            class="btn primary-btn"
                            @click="progressTutorial(5)"
                        >
                            close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <SkillsListParent ref="skillList" />

    <!-- Tooltips -->
    <!-- Introduction modal -->
    <div
        v-if="
            showTutorialTip1 ||
            showMobileTutorialTip2 ||
            showMobileTutorialTip3 ||
            showMobileTutorialTip4 ||
            showMobileTutorialTip5
        "
        class="modal"
    >
        <div class="modal-content">
            <div v-if="showTutorialTip1">
                <p>This page is another view of your skill tree closed.</p>
                <p>Click on the down arrows to expand the skills.</p>

                <button class="btn primary-btn" @click="progressTutorial(1)">
                    next
                </button>
            </div>
            <div v-else-if="showMobileTutorialTip2">
                <p>
                    Greyed out nodes are locked. You need to unlock them by
                    passing the quizzes of the skills that come before them.
                </p>

                <button class="btn primary-btn" @click="progressTutorial(2)">
                    next
                </button>
            </div>
            <div v-else-if="showMobileTutorialTip3">
                <p>
                    Sad face icons mean that the skill has not yet been
                    mastered. When you master a skill, that face will become
                    happy.
                </p>

                <button class="btn primary-btn" @click="progressTutorial(3)">
                    next
                </button>
            </div>
            <div v-else-if="showMobileTutorialTip4">
                <p>Some nodes have a plus or minus sign.</p>
                <p>
                    This indicates that the skill contains mini-skills that need
                    to be mastered, before mastery of the main skill can be
                    attempted.
                </p>

                <button class="btn primary-btn" @click="progressTutorial(4)">
                    next
                </button>
            </div>
            <div v-else-if="showMobileTutorialTip5">
                <p>Click on a skill node to go to the page for that skill.</p>
                <p>Remember, you can only attempt to master unlocked skills.</p>

                <button class="btn primary-btn" @click="progressTutorial(5)">
                    close
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Tooltips */
.info-panel {
    position: relative;
    z-index: 2;
    float: right;
    max-width: 300px;
}

.info-text {
    border-color: var(--primary-color);
    border-width: 2px;
    border-style: solid;
}

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

#legend {
    height: 60px;
}

#legend .btn {
    font-weight: 500;
}

.legend-div {
    height: auto;
    width: 100%;
}

.topnav {
    padding: 5px 10px;
}

#mobile-legend {
    display: none;
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
    h1 {
        margin-bottom: 0px;
    }

    #mobile-legend {
        display: block;
    }

    #tablet-and-up-legend {
        display: none;
    }

    #print-btn {
        margin-bottom: 5px;
    }

    .search-mobile-row {
        width: 96%;
        margin-left: 0px;
        margin-right: auto;
    }
}

/* Bigger devices ( Tablet ) */
@media (min-width: 481px) and (max-width: 1024px) {
    #legend {
        height: 90px;
    }

    #mobile-legend {
        display: none;
    }

    #tablet-and-up-legend {
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

.img-fluid {
    width: 100% !important;
    height: auto;
}

.grade-level-legend {
    position: absolute;
    margin-top: 10px;
    right: 10px;
}

.have-results {
    border-bottom: 0px !important ;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
}

.loadingNode {
    background-color: #989ba1;
}

.skill-tree-input {
    outline: none;
    border: 0px;
    width: 100%;
}

.search-results {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 0;
    left: -1px;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    border-bottom: 1px solid #989ba1;
    border-right: 1px solid #989ba1;
    border-left: 1px solid #989ba1;
    background-color: white;
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;
    width: 100.5%;
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

:deep(.hightLight) {
    font-weight: 500;
    color: #9985d1;
    float: none !important;
    width: auto !important;
    height: auto !important;
    margin: 0px !important;
    border-radius: 0px !important;
    border: 0px !important;
}

/* Mobile view style */
@media (max-width: 480px) {
    .skill-tree-input {
        width: 100%;
    }
}

/* Tablet view style */
@media (min-width: 481px) and (max-width: 1024px) {
    .search-bar {
        margin-top: 5px;
    }
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
