<script>
export default {
    setup() {},
    data() {
        return {
            essayQuestionId: this.$route.params.contentId,
            userId: this.$route.params.userId,
            essayQuestion: {},
            essayQuestionEdit: {},
            comment: '',
            isEditMode: false
        };
    },
    async created() {
        await this.getEssayQuestionEdit();
        await this.getEssayQuestion();

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
        },
        dismissEdit() {
            if (confirm('Delete this edit?')) {
                const result = fetch(
                    '/questions/essay/submitted-for-review/' +
                        this.essayQuestionId +
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
            this.isEditMode = true;
        },
        saveEdit() {
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: this.essayQuestionEdit.name,
                    question: this.essayQuestionEdit.question
                })
            };

            var url =
                '/questions/essay/' +
                this.essayQuestionEdit.essay_question_id +
                '/edit';
            fetch(url, requestOptions).then(() => {
                this.$router.back();
            });

            // Delete it afterwards.
            const result = fetch(
                '/questions/essay/submitted-for-review/' +
                    this.essayQuestionEdit.essay_question_id +
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
                <textarea
                    :readonly="!isEditMode"
                    id="content"
                    class="form-control"
                    v-model="essayQuestionEdit.question"
                >
                </textarea>

                <h3>Comment</h3>
                <p>{{ comment }}</p>
            </div>
            <div class="col">
                <h2>Original</h2>
                <h5>Question</h5>
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
