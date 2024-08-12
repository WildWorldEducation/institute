<script>
import PageNav from '../components/todo/PageNav.vue';
import CheckStudentQuestions from '../components/CheckStudentQuestions.vue';
import ContentEditsList from '../components/todo/content-edit/ContentEditsList.vue';
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
        <!-- In the pc view we display flex row -->
        <div class="h-100 d-flex">
            <PageNav class="h-100" :activeContent="activeContent" />

            <div id="contentDiv" class="d-flex flex-column">
                <div v-if="activeContent === 'editList'">
                    <ContentEditsList />
                </div>
                <div
                    v-if="activeContent === 'studentQuestionList'"
                    class="ps-0 ps-md-2"
                >
                    <h2>Student Suggested Questions</h2>
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
    color: #a48be7;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
}

#contentDiv {
    overflow: auto;
    width: 100%;
}

/* View Specific On Phone */
@media (min-width: 0px) and (max-width: 576px) {
    #contentDiv {
        width: fit-content;
        overflow: auto;
    }
}
</style>
