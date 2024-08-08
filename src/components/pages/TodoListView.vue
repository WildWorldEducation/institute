<script>
import CheckStudentQuestions from '../components/CheckStudentQuestions.vue';
import ContentEditsList from '../components/ContentEditsList.vue';
import PageNav from '../components/todo/PageNav.vue';
export default {
    setup() {},
    data() {
        return {};
    },
    components: {
        CheckStudentQuestions,
        ContentEditsList,
        PageNav
    },
    methods: {}
};
</script>

<template>
    <div class="container-fluid h-100 p-0">
        <div class="d-flex h-100">
            <PageNav />
            <div class="d-flex flex-column">
                <h1 class="page-title">Todo List</h1>
                <h2>Student Edited Content</h2>
                <ContentEditsList />
                <h2>Student Suggested Questions</h2>
                <CheckStudentQuestions />
                <h2>Content Flags</h2>
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
