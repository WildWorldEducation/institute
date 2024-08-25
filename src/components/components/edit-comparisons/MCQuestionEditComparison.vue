<script>
import diff from 'fast-diff';
export default {
    setup() {},
    data() {
        return {
            mcQuestionId: this.$route.params.contentId,
            userId: this.$route.params.userId,
            mcQuestion: {},
            mcQuestionEdit: {},
            comment: '',
            isEditMode: false,
            // an object to store all flag to indicate content has change or not
            changed: {
                question: false,
                correct_answer: false,
                incorrect_answer_1: false,
                incorrect_answer_2: false,
                incorrect_answer_3: false,
                incorrect_answer_4: false,
                explanation: false
            }
        };
    },
    async created() {
        await this.getMCQuestionEdit();
        await this.getMCQuestion();

        // --- Compare all aspect of two question --- //
        if (this.mcQuestion.question !== this.mcQuestionEdit.question) {
            // find the difference between two string
            this.changed.question = diff(
                this.mcQuestion.question,
                this.mcQuestion.question
            );
        }
        // Belows if use the same technic as above
        if (
            this.mcQuestion.correct_answer !==
            this.mcQuestionEdit.correct_answer
        ) {
            this.changed.correct_answer = diff(
                this.mcQuestion.correct_answer,
                this.mcQuestionEdit.correct_answer
            );
        }

        if (
            this.mcQuestion.incorrect_answer_1 !==
            this.mcQuestionEdit.incorrect_answer_1
        ) {
            this.changed.incorrect_answer_1 = diff(
                this.mcQuestion.incorrect_answer_1,
                this.mcQuestionEdit.incorrect_answer_1
            );
        }

        if (
            this.mcQuestion.incorrect_answer_2 !==
            this.mcQuestionEdit.incorrect_answer_2
        ) {
            this.changed.correct_answer = diff(
                this.mcQuestion.incorrect_answer_2,
                this.mcQuestionEdit.incorrect_answer_2
            );
        }

        if (
            this.mcQuestion.incorrect_answer_3 !==
            this.mcQuestionEdit.incorrect_answer_3
        ) {
            this.changed.incorrect_answer_3 = diff(
                this.mcQuestion.incorrect_answer_3,
                this.mcQuestionEdit.incorrect_answer_3
            );
        }

        if (
            this.mcQuestion.incorrect_answer_4 !==
            this.mcQuestionEdit.incorrect_answer_4
        ) {
            this.changed.incorrect_answer_4 = diff(
                this.mcQuestion.incorrect_answer_4,
                this.mcQuestionEdit.incorrect_answer_4
            );
        }

        if (this.mcQuestion.explanation !== this.mcQuestionEdit.explanation) {
            this.changed.explanation = diff(
                this.mcQuestion.explanation,
                this.mcQuestionEdit.explanation
            );
        }

        console.log('Changed object: ');
        console.log(this.changed);

        // Auto size text area to show all text without scroll bar.
        const tx = document.getElementsByTagName('textarea');
        for (let i = 0; i < tx.length; i++) {
            tx[i].setAttribute(
                'style',
                'height:' + tx[i].scrollHeight + 'px;overflow-y:hidden;'
            );
            tx[i].addEventListener('input', OnInput, false);
        }

        function OnInput() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        }
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
        edit() {
            this.isEditMode = true;
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
                    explanation: this.mcQuestionEdit.explanation,
                    edit: this.isEditMode
                })
            };

            var url =
                '/questions/mc/' +
                this.mcQuestionEdit.mc_question_id +
                '/approve-edits';

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
        <h1 class="page-title">MC Question Change Comparison</h1>
        <hr />
        <div class=""></div>
        <div class="row">
            <div class="col">
                <h2>Change</h2>
                <h5>Question</h5>
                <textarea
                    class="form-control mb-2"
                    type="text"
                    v-model="mcQuestionEdit.question"
                    :readonly="!isEditMode"
                />
                <h5>Correct Answer</h5>
                <textarea
                    class="form-control mb-2"
                    type="text"
                    v-model="mcQuestionEdit.correct_answer"
                    :readonly="!isEditMode"
                />
                <h5>Correct Incorrect Answer 1</h5>
                <textarea
                    class="form-control mb-2"
                    type="text"
                    v-model="mcQuestionEdit.incorrect_answer_1"
                    :readonly="!isEditMode"
                />
                <h5>Correct Incorrect Answer 2</h5>
                <textarea
                    class="form-control mb-2"
                    type="text"
                    v-model="mcQuestionEdit.incorrect_answer_2"
                    :readonly="!isEditMode"
                />
                <h5>Correct Incorrect Answer 3</h5>
                <textarea
                    class="form-control mb-2"
                    type="text"
                    v-model="mcQuestionEdit.incorrect_answer_3"
                    :readonly="!isEditMode"
                />
                <h5>Correct Incorrect Answer 4</h5>
                <textarea
                    class="form-control mb-2"
                    type="text"
                    v-model="mcQuestionEdit.incorrect_answer_4"
                    :readonly="!isEditMode"
                />
                <h5>Explanation</h5>
                <textarea
                    class="form-control mb-2"
                    type="text"
                    v-model="mcQuestionEdit.explanation"
                    :readonly="!isEditMode"
                />
                <h3>Comment</h3>
                <textarea
                    class="form-control mb-2"
                    type="text"
                    v-model="mcQuestionEdit.comment"
                    :readonly="!isEditMode"
                />
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

<style scoped>
.page-title {
    color: #a48be7;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
}

.compare-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 5px;
    padding: 10px 15px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.compare-container-tile {
    color: #a48be7;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 22px;
}
</style>
