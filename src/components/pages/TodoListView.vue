<script>
import PageNav from '../components/todo/PageNav.vue';
// import store
import { useSettingsStore } from '../../stores/SettingsStore';
// import child component
import CheckStudentQuestions from '../components/todo/student-question/CheckStudentQuestions.vue';
import ContentEditsList from '../components/todo/content-edit/ContentEditsList.vue';
import ContentFlagsView from './ContentFlagsView.vue';

export default {
    setup() {
        const settingStore = useSettingsStore();
        return { settingStore };
    },
    data() {
        return {
            activeContent: 'editList'
        };
    },

    components: {
        CheckStudentQuestions,
        ContentEditsList,
        PageNav,
        ContentFlagsView
    },
    computed: {},
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
        // Get Setting state and fetch one if there are none
        console.log('Setting data Here');
        console.log(this.settingStore.todoContentFlagTableRows);
        // Get navigation state from URL
        const nav = this.$route.query.nav;
        if (nav) {
            this.activeContent = nav;
        }
    },
    methods: {
        hideNavBar() {
            this.showNavBar = false;
        }
    }
};
</script>

<template>
    <div class="container-fluid h-100 p-0">
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
            </div>
        </div>
    </div>
</template>

<style>
.page-title {
    color: #9c7eec;
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
</style>
