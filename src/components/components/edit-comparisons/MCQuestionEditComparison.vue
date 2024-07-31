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
            if (confirm('Delete this edit?')) {
                const result = fetch(
                    '/questions/mc/submitted-for-review/' +
                        this.mcQuestionId +
                        '/' +
                        this.userId,
                    {
                        method: 'DELETE'
                    }
                );

                if (result.error) {
                    console.log(result.error);
                }

                // Return to hub page.
                this.$router.back();
            }
        },
        editMode() {
            document.getElementById('content').removeAttribute('readonly');
        },
        saveEdit() {
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: this.mcQuestionEdit.name,
                    question: this.mcQuestionEdit.question,
                    correct_answer: this.mcQuestionEdit.correct_answer,
                    incorrect_answer_1: this.mcQuestionEdit.incorrect_answer_1,
                    incorrect_answer_2: this.mcQuestionEdit.incorrect_answer_2,
                    incorrect_answer_3: this.mcQuestionEdit.incorrect_answer_3,
                    incorrect_answer_4: this.mcQuestionEdit.incorrect_answer_4,
                    correct_answer: this.mcQuestionEdit.correct_answer,
                    explanation: this.mcQuestionEdit.explanation
                })
            };

            var url =
                '/questions/mc/' + this.mcQuestionEdit.mc_question_id + '/edit';

            fetch(url, requestOptions).then(() => {
                this.$router.back();
            });

            // Then delete.
            const result = fetch(
                '/questions/mc/submitted-for-review/' +
                    this.mcQuestionId +
                    '/' +
                    this.userId,
                {
                    method: 'DELETE'
                }
            );

            if (result.error) {
                console.log(result.error);
            }
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
                <h5>Question</h5>
                <input
                    class="form-control"
                    type="text"
                    v-model="mcQuestionEdit.question"
                    readonly
                />
                <h5>Correct Answer</h5>
                <p>{{ mcQuestionEdit.correct_answer }}</p>
                <h5>Correct Incorrect Answer 1</h5>
                <p>{{ mcQuestionEdit.incorrect_answer_1 }}</p>
                <h5>Correct Incorrect Answer 2</h5>
                <p>{{ mcQuestionEdit.incorrect_answer_2 }}</p>
                <h5>Correct Incorrect Answer 3</h5>
                <p>{{ mcQuestionEdit.incorrect_answer_3 }}</p>
                <h5>Correct Incorrect Answer 4</h5>
                <p>{{ mcQuestionEdit.incorrect_answer_4 }}</p>
                <h5>Explanation</h5>
                <p>{{ mcQuestionEdit.explanation }}</p>
                <h3>Comment</h3>
                <p>{{ comment }}</p>
            </div>
            <div class="col">
                <h2>Original</h2>
                <h5>Question</h5>
                <p>{{ mcQuestion.question }}</p>
                <h5>Correct Answer</h5>
                <p>{{ mcQuestion.correct_answer }}</p>
                <h5>Correct Incorrect Answer 1</h5>
                <p>{{ mcQuestion.incorrect_answer_1 }}</p>
                <h5>Correct Incorrect Answer 2</h5>
                <p>{{ mcQuestion.incorrect_answer_2 }}</p>
                <h5>Correct Incorrect Answer 3</h5>
                <p>{{ mcQuestion.incorrect_answer_3 }}</p>
                <h5>Correct Incorrect Answer 4</h5>
                <p>{{ mcQuestion.incorrect_answer_4 }}</p>
                <h5>Explanation</h5>
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
