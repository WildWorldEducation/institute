<script>
import PageNav from '../components/todo/PageNav.vue';
import CheckStudentQuestions from '../components/CheckStudentQuestions.vue';
import ContentEditsList from '../components/ContentEditsList.vue';
import ContentFlagsView from './ContentFlagsView.vue';

export default {
    setup() {},
    data() {
        return {
            activeContent: 'editList',
            contentHeight: 0
        };
    },

    components: {
        CheckStudentQuestions,
        ContentEditsList,
        PageNav,
        ContentFlagsView
    },
    computed: {},
    methods: {
        hideNavBar() {
            this.showNavBar = false;
        }
    }
};
</script>

<template>
    <div class="container-fluid h-100 p-0">
        <div class="d-flex h-100">
            <PageNav class="h-100" :activeContent="activeContent" />

            <div id="contentDiv" class="d-flex flex-column w-100">
                <div v-if="activeContent === 'editList'">
                    <h2>Student Edited Content</h2>
                    <ContentEditsList />
                </div>
                <div v-if="activeContent === 'studentQuestionList'">
                    <h2>Student Suggested Questions</h2>
                    <CheckStudentQuestions />
                </div>
                <div v-if="activeContent === 'flagList'" class="w-100">
                    <ContentFlagsView />
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.page-title {
    color: #a48be7;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
}
</style>
