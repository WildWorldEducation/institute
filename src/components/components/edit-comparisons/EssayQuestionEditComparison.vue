<script>
export default {
    setup() {},
    data() {
        return {
            essayQuestionId: this.$route.params.contentId,
            userId: this.$route.params.userId,
            essayQuestion: {},
            essayQuestionEdit: {},
            comment: ''
        };
    },
    async created() {
        await this.getEssayQuestionEdit();
        await this.getEssayQuestion();
    },
    methods: {
        async getEssayQuestionEdit() {
            await fetch(
                '/questions/essay/submitted-for-review/' +
                    this.essayQuestionId +
                    '/' +
                    this.userId
            )
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    console.log(data);
                    this.essayQuestionEdit = data;
                    this.comment = data.comment;
                });
        },
        async getEssayQuestion() {
            await fetch('/questions/essay/show/' + this.essayQuestionId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    console.log(data);
                    this.essayQuestion = data;
                });
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
                <h3>Question</h3>
                <p>{{ essayQuestionEdit.question }}</p>

                <h3>Comment</h3>
                <p>{{ comment }}</p>
            </div>
            <div class="col">
                <h2>Original</h2>
                <h3>Question</h3>
                <p>{{ essayQuestion.question }}</p>
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
