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
    <div class="container-fluid h-100 p-0 bg-light">
        <!-- In the pc view we display flex row -->
        <div class="h-100 d-flex">
            <PageNav :activeContent="activeContent" />  

            <div id="contentDiv" class="d-flex flex-column">
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
.page-title {
    color: var(--primary-color);
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
}

#contentDiv {
    overflow-y: auto;
    width: 100%;
}

/* View Specific On Phone */
@media (min-width: 0px) and (max-width: 576px) {
    #contentDiv {
        width: fit-content;
        overflow-y: auto;
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
