<script>
import router from '../../router';

export default {
    data() {
        return {
            skillId: this.$route.params.skillId,
            question: {}
        };
    },
    methods: {
        Submit() {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: this.question.name,
                    question: this.question.question,
                    correct_answer: this.question.correctAnswer,
                    incorrect_answer_1: this.question.incorrectAnswer1,
                    incorrect_answer_2: this.question.incorrectAnswer2,
                    incorrect_answer_3: this.question.incorrectAnswer3,
                    incorrect_answer_4: this.question.incorrectAnswer4,
                    explanation: this.question.explanation,
                    skill_id: this.skillId
                })
            };
            var url = '/questions/mc-questions/add';
            fetch(url, requestOptions)
                .then(() => {
                    alert('Question added');
                })
                .then(() => {
                    this.$router.go(-1);
                });
        }
    }
};
</script>

<template>
    <div class="container mt-3 pb-3">
        <div class="row">
            <div class="col-10 d-flex align-items-end">
                <h2 id="header-tile">Add Question</h2>
            </div>
        </div>
        <div class="main-content-container container-fluid p-4">
            <div class="row">
                <div class="col-lg-6">
                    <div class="mb-3">
                        <label for="first_name" class="form-label"
                            >Question Name</label
                        >
                        <input
                            v-model="question.name"
                            type="text"
                            class="form-control"
                        />
                    </div>
                    <div class="mb-3">
                        <label for="last_name" class="form-label"
                            >Question</label
                        >
                        <input
                            v-model="question.question"
                            type="text"
                            class="form-control"
                        />
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Correct answer</label>
                        <input
                            v-model="question.correctAnswer"
                            type="text"
                            class="form-control"
                        />
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Wrong answer 1</label>
                        <input
                            v-model="question.incorrectAnswer1"
                            type="text"
                            class="form-control"
                        />
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Wrong answer 2</label>
                        <input
                            v-model="question.incorrectAnswer2"
                            type="text"
                            class="form-control"
                        />
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Wrong answer 3</label>
                        <input
                            v-model="question.incorrectAnswer3"
                            type="text"
                            class="form-control"
                        />
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Wrong answer 4</label>
                        <input
                            v-model="question.incorrectAnswer4"
                            type="text"
                            class="form-control"
                        />
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Explanation</label>
                        <textarea
                            v-model="question.explanation"
                            class="form-control"
                            rows="3"
                        />
                    </div>

                    <div class="d-flex justify-content-end gap-4">
                        <a class="btn red-btn" @click="$router.go(-1)"
                            >Cancel</a
                        >
                        <button class="btn purple-btn" @click="Submit()">
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.red-btn {
    background-color: #e24d4d;
    color: white;
    border: 1px solid #d33622;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
}

.red-btn:hover {
    background-color: #cc3535;
}

.purple-btn {
    background-color: #a48be6;
    color: white;
    border: 1px solid #7f56d9;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
}
</style>
