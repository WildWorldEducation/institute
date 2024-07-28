<script>
export default {
    setup() {},
    data() {
        return {
            mcQuestionId: this.$route.params.contentId,
            userId: this.$route.params.userId,
            mcQuestion: {},
            mcQuestionEdit: {},
            comment: ''
        };
    },
    async created() {
        await this.getMCQuestionEdit();
        await this.getMCQuestion();
    },
    methods: {
        async getMCQuestionEdit() {
            await fetch(
                '/questions/mc/submitted-for-review/' +
                    this.mcQuestionId +
                    '/' +
                    this.userId
            )
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    console.log(data);
                    this.comment = data.comment;
                    this.mcQuestionEdit = data;
                });
        },
        async getMCQuestion() {
            await fetch('/questions/mc/show/' + this.mcQuestionId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    console.log(data);
                    this.mcQuestion = data;
                });
        },
        dismissEdit() {
            console.log('mc');
        },
        editMode() {
            console.log('mc');
        },
        saveEdit() {
            console.log('mc');
        }
    }
};
</script>

<template>
    <div class="container mt-4 mb-4">
        <h1 class="page-title">Comparison</h1>
        <div class="row">
            <div class="col">
                <h2>Change</h2>
                <p>{{ mcQuestionEdit.question }}</p>
                <p>{{ mcQuestionEdit.correct_answer }}</p>
                <p>{{ mcQuestionEdit.incorrect_answer_1 }}</p>
                <p>{{ mcQuestionEdit.incorrect_answer_2 }}</p>
                <p>{{ mcQuestionEdit.incorrect_answer_3 }}</p>
                <p>{{ mcQuestionEdit.incorrect_answer_4 }}</p>
                <p>{{ mcQuestionEdit.explanation }}</p>
                <h3>Comment</h3>
                <p>{{ comment }}</p>
            </div>
            <div class="col">
                <h2>Original</h2>
                <p>{{ mcQuestion.question }}</p>
                <p>{{ mcQuestion.correct_answer }}</p>
                <p>{{ mcQuestion.incorrect_answer_1 }}</p>
                <p>{{ mcQuestion.incorrect_answer_2 }}</p>
                <p>{{ mcQuestion.incorrect_answer_3 }}</p>
                <p>{{ mcQuestion.incorrect_answer_4 }}</p>
                <p>{{ mcQuestion.explanation }}</p>
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
