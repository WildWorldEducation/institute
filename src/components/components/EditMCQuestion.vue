<script>
import router from '../../router';

export default {
    data() {
        return {
            questionId: this.$route.params.id,
            question: {}
        };
    },
    created() {
        this.getQuestion();
    },
    methods: {
        getQuestion() {
            fetch('/questions/mc/show/' + this.questionId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => (this.question = data));
        },
        Submit() {
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: this.question.name,
                    question: this.question.question,
                    correct_answer: this.question.correct_answer,
                    incorrect_answer_1: this.question.incorrect_answer_1,
                    incorrect_answer_2: this.question.incorrect_answer_2,
                    incorrect_answer_3: this.question.incorrect_answer_3,
                    incorrect_answer_4: this.question.incorrect_answer_4,
                    explanation: this.question.explanation
                })
            };

            var url = '/questions/mc/' + this.questionId + '/edit';
            fetch(url, requestOptions).then(() => {
                this.$router.back();
            });
        }
    }
};
</script>

<template>
    <div class="container mt-3">
        <h1>Edit Question</h1>
        <div class="mb-3">
            <label class="form-label">Name</label>
            <input v-model="question.name" type="text" class="form-control" />
        </div>
        <div class="mb-3">
            <label class="form-label">Question</label>
            <input
                v-model="question.question"
                type="text"
                class="form-control"
            />
        </div>
        <div class="mb-3">
            <label class="form-label">Correct answer</label>
            <input
                v-model="question.correct_answer"
                type="text"
                class="form-control"
            />
        </div>
        <div class="mb-3">
            <label class="form-label">Incorrect answer 1</label>
            <input
                v-model="question.incorrect_answer_1"
                type="text"
                class="form-control"
            />
        </div>
        <div class="mb-3">
            <label class="form-label">Incorrect answer 2</label>
            <input
                v-model="question.incorrect_answer_2"
                type="text"
                class="form-control"
            />
        </div>
        <div class="mb-3">
            <label class="form-label">Incorrect answer 3</label>
            <input
                v-model="question.incorrect_answer_3"
                type="text"
                class="form-control"
            />
        </div>
        <div class="mb-3">
            <label class="form-label">Incorrect answer 4</label>
            <input
                v-model="question.incorrect_answer_4"
                type="text"
                class="form-control"
            />
        </div>
        <div class="mb-3">
            <label class="form-label">Explanation</label>
            <input
                v-model="question.explanation"
                type="text"
                class="form-control"
            />
        </div>
        <div class="mb-3">
            <button @click="Submit()" class="btn btn-dark">Submit</button>
        </div>
    </div>
</template>

<style scoped></style>
