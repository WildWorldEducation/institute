<script>
// import store

export default {
    props: {
        questions: {
            type: Array,
            required: true
        }
    },
    setup() {
        return {};
    },
    data() {},
    components: {},
    methods: {}
};
</script>

<template>
    <div class="container-fluid">
        <h2 class="secondary-heading h4">Check New Questions</h2>

        <div class="list-body">
            <div class="question" v-for="question in questions">
                <RouterLink
                    class="question-link"
                    :to="`/check-student-question/${question.id}`"
                >
                    <span class="student-name"> {{ question.student }}, </span>
                    <span class="skill-name"> {{ question.skillname }}, </span>
                    <span class="date">{{
                        formatDate(question.create_date)
                    }}</span>
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.table-div {
    padding-left: 15px;
    padding-right: 15px;
}

.question-link {
    font-family: 'Poppins';
    font-size: 16px;
    font-weight: 500;
    line-height: 28px;
    letter-spacing: 0em;
    text-align: left;
    text-decoration: none;
    color: #667085;
}

.question {
    border: 1px solid #dbd0f9;
    margin: 0px;
    padding: 10px 6px;
}

.student-name {
    color: #8f7bd6;
}

.list-body {
    overflow: auto;
}
</style>
