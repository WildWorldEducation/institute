<script>
import PageNav from '../components/todo/PageNav.vue';
// import store
import { useSettingsStore } from '../../stores/SettingsStore';
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';
// import child component
import CheckStudentQuestions from '../components/todo/student-question/CheckStudentQuestions.vue';
import ContentEditsList from '../components/todo/content-edit/ContentEditsList.vue';
import ContentFlagsView from './ContentFlagsView.vue';
import NewSkillsAwaitingApprovalList from '../components/todo/new-skills-awaiting-approval/NewSkillsAwaitingApprovalList.vue';

export default {
    setup() {
        const settingStore = useSettingsStore();
        const userDetailsStore = useUserDetailsStore();
        return { settingStore, userDetailsStore };
    },
    data() {
        return {
            activeContent: 'editList',
            // Tutorial tooltips
            isTutorialComplete: false,
            showTutorialTip1: false,
            showTutorialTip2: false,
            showTutorialTip3: false,
            showTutorialTip4: false
        };
    },

    components: {
        CheckStudentQuestions,
        ContentEditsList,
        PageNav,
        ContentFlagsView,
        NewSkillsAwaitingApprovalList
    },
    computed: {},
    created() {
        this.checkIfTutorialComplete();
    },
    async mounted() {
        // fetch setting data if we dont have pagination data yet
        if (
            this.settingStore.todoContentFlagTableRows === 0 ||
            this.settingStore.todoEssayQuestionTableRows === 0 ||
            this.settingStore.todoImageQuestionTableRows === 0 ||
            this.settingStore.todoImageQuestionTableRows === 0 ||
            this.settingStore.todoMcQuestionTableRows === 0 ||
            this.settingStore.todoSkillTableRows === 0
        ) {
            await this.settingStore.getSettings();
        }
        // Get navigation state from URL
        const nav = this.$route.query.nav;
        if (nav) {
            this.activeContent = nav;
        }
    },
    methods: {
        hideNavBar() {
            this.showNavBar = false;
        }, // only for search bar to update the choose user id
        // Tutorial
        async checkIfTutorialComplete() {
            const result = await fetch(
                '/users/check-tutorial-progress/todo/' +
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
        restartTutorial() {
            this.showTutorialTip1 = true;
            this.showTutorialTip2 = false;
            this.showTutorialTip3 = false;
            this.showTutorialTip4 = false;
            this.isTutorialComplete = false;
        },
        markTutorialComplete() {
            let url =
                '/users/mark-tutorial-complete/todo/' +
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
    <div id="todo-page" class="bg-light d-flex h-100">
        <!-- In the pc view we display flex row -->

        <PageNav :activeContent="activeContent" />

        <div class="d-flex flex-column w-100">
            <div v-if="activeContent === 'editList'">
                <ContentEditsList />
            </div>
            <div v-if="activeContent === 'studentQuestionList'">
                <CheckStudentQuestions />
            </div>
            <div v-if="activeContent === 'flagList'">
                <ContentFlagsView />
            </div>
            <div v-if="activeContent === 'newSkillsList'">
                <NewSkillsAwaitingApprovalList />
            </div>
        </div>
        <div class="restartBtn">
            <button class="btn primary-btn" @click="restartTutorial">
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

    <!-- Editor Introduction modal -->
    <div
        v-if="
            showTutorialTip1 ||
            showTutorialTip2 ||
            showTutorialTip3 ||
            showTutorialTip4
        "
        class="modal"
    >
        <div class="modal-content">
            <div v-if="showTutorialTip1">
                <p>This is the Todo List page.</p>
                <p>There are 3 tabs on the left.</p>

                <button class="btn primary-btn" @click="progressTutorial(1)">
                    next
                </button>
            </div>
            <div v-if="showTutorialTip2">
                <p>
                    The "Approve Content Edits" tab shows edits to skill pages
                    and quiz questions, made by students or instructors, that
                    need to be approved, edited, or dismissed.
                </p>
                <button class="btn primary-btn" @click="progressTutorial(2)">
                    next
                </button>
            </div>
            <div v-if="showTutorialTip3">
                <p>
                    The "Approve Student Added Questions" tab shows questions
                    that students or instructors have submitted, that need to be
                    approved, edited, or dismissed.
                </p>
                <button class="btn primary-btn" @click="progressTutorial(3)">
                    next
                </button>
            </div>
            <div v-if="showTutorialTip4">
                <p>
                    The "Check Content Flags" tab shows all the things that
                    users have flagged as problematic. This could include
                    mistakes, bugs and incorrect information.
                </p>
                <p>
                    These need to be checked up on, and if a problem is found,
                    it should be fixed. Otherwise, the flag should be dismissed.
                </p>
                <button class="btn primary-btn" @click="progressTutorial(4)">
                    close
                </button>
            </div>
        </div>
    </div>
</template>

<style>
#todo-page {
    border-top: 1px solid var(--primary-color);
}

.restartBtn {
    padding-top: 15px;
    padding-bottom: 15px;
    width: fit-content;
    border-radius: 5px;
    margin-left: 15px;
    margin-right: 15px;
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
