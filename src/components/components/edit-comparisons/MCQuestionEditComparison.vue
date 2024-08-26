<script>
import diff from 'fast-diff';
import CompareString from './CompareString.vue';

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
            },
            changeCount: {
                questionAdd: 0,
                questionRemove: 0,
                correctAnswerAdd: 0,
                correctAnswerRemove: 0,
                incorrectAnswer1Add: 0,
                incorrectAnswer1Remove: 0,
                incorrectAnswer2Add: 0,
                incorrectAnswer2Remove: 0,
                incorrectAnswer3Add: 0,
                incorrectAnswer3Remove: 0,
                incorrectAnswer4Add: 0,
                incorrectAnswer4Remove: 0,
                explanationAdd: 0,
                explanationRemove: 0
            },
            showQuestionChange: true,
            showCorrectAnswerChange: true,
            showIncorrectAnswer1Change: true,
            showIncorrectAnswer2Change: true,
            showIncorrectAnswer3Change: true,
            showIncorrectAnswer4Change: true,
            showExplanationChange: true
        };
    },
    components: {
        CompareString
    },
    async created() {
        await this.getMCQuestionEdit();
        await this.getMCQuestion();

        // --- Compare all aspect of two question --- //
        // --- Question Content
        if (this.mcQuestion.question !== this.mcQuestionEdit.question) {
            // find the difference between two string
            this.changed.question = diff(
                this.mcQuestion.question,
                this.mcQuestionEdit.question
            );
            // counting add and remove token in string diff array
            this.changeCount.questionAdd = this.changed.question.filter((e) => {
                return e[0] === 1;
            }).length;

            this.changeCount.questionRemove = this.changed.question.filter(
                (e) => {
                    return e[0] === -1;
                }
            ).length;
        }
        // --- Correct Answer
        if (
            this.mcQuestion.correct_answer !==
            this.mcQuestionEdit.correct_answer
        ) {
            this.changed.correct_answer = diff(
                this.mcQuestion.correct_answer,
                this.mcQuestionEdit.correct_answer
            );

            // counting add and remove token in string diff array
            this.changeCount.correctAnswerAdd =
                this.changed.correct_answer.filter((e) => {
                    return e[0] === 1;
                }).length;

            this.changeCount.correctAnswerRemove =
                this.changed.correct_answer.filter((e) => {
                    return e[0] === -1;
                }).length;
        }

        // --- Incorrect Answer 1
        if (
            this.mcQuestion.incorrect_answer_1 !==
            this.mcQuestionEdit.incorrect_answer_1
        ) {
            this.changed.incorrect_answer_1 = diff(
                this.mcQuestion.incorrect_answer_1,
                this.mcQuestionEdit.incorrect_answer_1
            );
            // counting add and remove token in string diff array
            this.changeCount.incorrectAnswer1Add =
                this.changed.incorrect_answer_1.filter((e) => {
                    return e[0] === 1;
                }).length;

            this.changeCount.incorrectAnswer1Remove =
                this.changed.incorrect_answer_1.filter((e) => {
                    return e[0] === -1;
                }).length;
        }

        // --- Incorrect Answer 2
        if (
            this.mcQuestion.incorrect_answer_2 !==
            this.mcQuestionEdit.incorrect_answer_2
        ) {
            this.changed.incorrect_answer_2 = diff(
                this.mcQuestion.incorrect_answer_2,
                this.mcQuestionEdit.incorrect_answer_2
            );

            // counting add and remove token in string diff array
            this.changeCount.incorrectAnswer2Add =
                this.changed.incorrect_answer_2.filter((e) => {
                    return e[0] === 1;
                }).length;

            this.changeCount.incorrectAnswer2Remove =
                this.changed.incorrect_answer_2.filter((e) => {
                    return e[0] === -1;
                }).length;
        }

        // --- Incorrect Answer 3
        if (
            this.mcQuestion.incorrect_answer_3 !==
            this.mcQuestionEdit.incorrect_answer_3
        ) {
            this.changed.incorrect_answer_3 = diff(
                this.mcQuestion.incorrect_answer_3,
                this.mcQuestionEdit.incorrect_answer_3
            );
            // counting add and remove token in string diff array
            this.changeCount.incorrectAnswer3Add =
                this.changed.incorrect_answer_3.filter((e) => {
                    return e[0] === 1;
                }).length;

            this.changeCount.incorrectAnswer3Remove =
                this.changed.incorrect_answer_3.filter((e) => {
                    return e[0] === -1;
                }).length;
        }

        // --- Incorrect Answer 4
        if (
            this.mcQuestion.incorrect_answer_4 !==
            this.mcQuestionEdit.incorrect_answer_4
        ) {
            this.changed.incorrect_answer_4 = diff(
                this.mcQuestion.incorrect_answer_4,
                this.mcQuestionEdit.incorrect_answer_4
            );

            // counting add and remove token in string diff array
            this.changeCount.incorrectAnswer4Add =
                this.changed.incorrect_answer_4.filter((e) => {
                    return e[0] === 1;
                }).length;

            this.changeCount.incorrectAnswer4Remove =
                this.changed.incorrect_answer_4.filter((e) => {
                    return e[0] === -1;
                }).length;
        }

        // --- Explanation
        if (this.mcQuestion.explanation !== this.mcQuestionEdit.explanation) {
            this.changed.explanation = diff(
                this.mcQuestion.explanation,
                this.mcQuestionEdit.explanation
            );

            // counting add and remove token in string diff array
            this.changeCount.explanationAdd = this.changed.explanation.filter(
                (e) => {
                    return e[0] === 1;
                }
            ).length;

            this.changeCount.explanationRemove =
                this.changed.explanation.filter((e) => {
                    return e[0] === -1;
                }).length;
        }

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
        <!-- ----| Question Compare Container |---- -->
        <div class="compare-container">
            <div class="d-flex align-items-center">
                <h2 class="compare-container-tile mb-3">Question</h2>
                <div
                    @click="showQuestionChange = !showQuestionChange"
                    :class="[
                        showQuestionChange ? 'expand-arrow' : 'minimize-arrow'
                    ]"
                    b-on-hover
                    :title="showQuestionChange ? 'minimize' : 'expand'"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="16"
                        heigh="16"
                        fill="#475569"
                    >
                        <path
                            d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
                        />
                    </svg>
                </div>
            </div>
            <Transition name="dropdown">
                <div v-if="showQuestionChange">
                    <div class="d-flex flex-column">
                        <div class="d-flex flex-row-reverse gap-4 mb-3">
                            <div class="add-count">
                                <span class="plus-icon">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 448 512"
                                        height="15"
                                        width="15"
                                        fill="#1aa375"
                                    >
                                        <path
                                            d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"
                                        />
                                    </svg>
                                </span>
                                {{ changeCount.questionAdd }} addition
                            </div>
                            <div class="remove-count">
                                <span class="minus-icon">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 448 512"
                                        height="15"
                                        width="15"
                                        fill="#ea6c6c"
                                    >
                                        <path
                                            d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                                        />
                                    </svg>
                                </span>
                                {{ changeCount.questionRemove }} removal
                            </div>
                        </div>
                        <div class="d-flex flex-lg-row flex-column">
                            <!-- Old Banner -->
                            <div class="old-container general-container">
                                <div class="container-tile">Original</div>
                                <div class="container-content">
                                    {{ mcQuestion.question }}
                                </div>
                            </div>
                            <!-- Long arrow pointing right -->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                width="50"
                                height="50"
                                fill="#ac90e8"
                                class="d-none d-lg-block my-auto mx-1"
                            >
                                <path
                                    d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"
                                />
                            </svg>
                            <!-- Long arrow pointing down on tablet and mobile-->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 320 512"
                                fill="#ac90e8"
                                height="50"
                                width="50"
                                class="mx-auto my-2 d-lg-none"
                            >
                                <path
                                    d="M2 334.5c-3.8 8.8-2 19 4.6 26l136 144c4.5 4.8 10.8 7.5 17.4 7.5s12.9-2.7 17.4-7.5l136-144c6.6-7 8.4-17.2 4.6-26s-12.5-14.5-22-14.5l-72 0 0-288c0-17.7-14.3-32-32-32L128 0C110.3 0 96 14.3 96 32l0 288-72 0c-9.6 0-18.2 5.7-22 14.5z"
                                />
                            </svg>
                            <!-- New Banner -->
                            <div class="new-container general-container">
                                <div class="container-tile">Changed</div>
                                <div class="container-content">
                                    <CompareString
                                        v-if="changed.question"
                                        :diffString="changed.question"
                                    />
                                    <div v-else>No changed Happened</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
        <!-- ----| Answers Compare Container |---- -->
        <div class="compare-container mt-5">
            <!-- --Correct answer-- -->
            <div class="d-flex flex-column">
                <!-- --Correct answer-- -->
                <div class="d-flex align-items-center">
                    <h2 class="compare-container-tile mb-3">Correct Answer</h2>
                    <div
                        @click="
                            showCorrectAnswerChange = !showCorrectAnswerChange
                        "
                        :class="[
                            showCorrectAnswerChange
                                ? 'expand-arrow'
                                : 'minimize-arrow'
                        ]"
                        b-on-hover
                        :title="showCorrectAnswerChange ? 'minimize' : 'expand'"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            width="16"
                            heigh="16"
                            fill="#475569"
                        >
                            <path
                                d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
                            />
                        </svg>
                    </div>
                </div>
                <Transition name="dropdown">
                    <div v-if="showCorrectAnswerChange">
                        <div class="d-flex flex-column">
                            <div class="d-flex flex-row-reverse gap-4 mb-3">
                                <div class="add-count">
                                    <span class="plus-icon">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 448 512"
                                            height="15"
                                            width="15"
                                            fill="#1aa375"
                                        >
                                            <path
                                                d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"
                                            />
                                        </svg>
                                    </span>
                                    {{ changeCount.correctAnswerAdd }} addition
                                </div>
                                <div class="remove-count">
                                    <span class="minus-icon">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 448 512"
                                            height="15"
                                            width="15"
                                            fill="#ea6c6c"
                                        >
                                            <path
                                                d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                                            />
                                        </svg>
                                    </span>
                                    {{ changeCount.correctAnswerRemove }}
                                    removal
                                </div>
                            </div>
                            <div class="d-flex flex-lg-row flex-column">
                                <!-- Old Banner -->
                                <div class="old-container general-container">
                                    <div class="container-tile">Original</div>
                                    <div class="container-content">
                                        {{ mcQuestion.correct_answer }}
                                    </div>
                                </div>
                                <!-- Long arrow pointing right -->
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    width="50"
                                    height="50"
                                    fill="#ac90e8"
                                    class="d-none d-lg-block my-auto mx-1"
                                >
                                    <path
                                        d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"
                                    />
                                </svg>
                                <!-- Long arrow pointing down on tablet and mobile-->
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 320 512"
                                    fill="#ac90e8"
                                    height="50"
                                    width="50"
                                    class="mx-auto my-2 d-lg-none"
                                >
                                    <path
                                        d="M2 334.5c-3.8 8.8-2 19 4.6 26l136 144c4.5 4.8 10.8 7.5 17.4 7.5s12.9-2.7 17.4-7.5l136-144c6.6-7 8.4-17.2 4.6-26s-12.5-14.5-22-14.5l-72 0 0-288c0-17.7-14.3-32-32-32L128 0C110.3 0 96 14.3 96 32l0 288-72 0c-9.6 0-18.2 5.7-22 14.5z"
                                    />
                                </svg>
                                <!-- New Banner -->
                                <div class="new-container general-container">
                                    <div class="container-tile">Changed</div>
                                    <div class="container-content">
                                        <CompareString
                                            v-if="changed.correct_answer"
                                            :diffString="changed.correct_answer"
                                        />
                                        <div v-else>No changed Happened</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
            <div class="my-4">
                <hr />
            </div>
            <!-- --Incorrect Answer 1-- -->
            <div class="d-flex flex-column">
                <div class="d-flex align-items-center">
                    <h2 class="compare-container-tile mb-3">
                        Incorrect Answer 1
                    </h2>
                    <div
                        @click="
                            showIncorrectAnswer1Change =
                                !showIncorrectAnswer1Change
                        "
                        :class="[
                            showIncorrectAnswer1Change
                                ? 'expand-arrow'
                                : 'minimize-arrow'
                        ]"
                        b-on-hover
                        :title="
                            showIncorrectAnswer1Change ? 'minimize' : 'expand'
                        "
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            width="16"
                            heigh="16"
                            fill="#475569"
                        >
                            <path
                                d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
                            />
                        </svg>
                    </div>
                </div>
                <Transition name="dropdown">
                    <div v-if="showIncorrectAnswer1Change">
                        <div class="d-flex flex-column">
                            <div class="d-flex flex-row-reverse gap-4 mb-3">
                                <div class="add-count">
                                    <span class="plus-icon">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 448 512"
                                            height="15"
                                            width="15"
                                            fill="#1aa375"
                                        >
                                            <path
                                                d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"
                                            />
                                        </svg>
                                    </span>
                                    {{ changeCount.incorrectAnswer1Add }}
                                    addition
                                </div>
                                <div class="remove-count">
                                    <span class="minus-icon">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 448 512"
                                            height="15"
                                            width="15"
                                            fill="#ea6c6c"
                                        >
                                            <path
                                                d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                                            />
                                        </svg>
                                    </span>
                                    {{ changeCount.incorrectAnswer1Remove }}
                                    removal
                                </div>
                            </div>
                            <div class="d-flex flex-lg-row flex-column">
                                <!-- Old Banner -->
                                <div class="old-container general-container">
                                    <div class="container-tile">Original</div>
                                    <div class="container-content">
                                        {{ mcQuestion.incorrect_answer_1 }}
                                    </div>
                                </div>
                                <!-- Long arrow pointing right -->
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    width="50"
                                    height="50"
                                    fill="#ac90e8"
                                    class="d-none d-lg-block my-auto mx-1"
                                >
                                    <path
                                        d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"
                                    />
                                </svg>
                                <!-- Long arrow pointing down on tablet and mobile-->
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 320 512"
                                    fill="#ac90e8"
                                    height="50"
                                    width="50"
                                    class="mx-auto my-2 d-lg-none"
                                >
                                    <path
                                        d="M2 334.5c-3.8 8.8-2 19 4.6 26l136 144c4.5 4.8 10.8 7.5 17.4 7.5s12.9-2.7 17.4-7.5l136-144c6.6-7 8.4-17.2 4.6-26s-12.5-14.5-22-14.5l-72 0 0-288c0-17.7-14.3-32-32-32L128 0C110.3 0 96 14.3 96 32l0 288-72 0c-9.6 0-18.2 5.7-22 14.5z"
                                    />
                                </svg>
                                <!-- New Banner -->
                                <div class="new-container general-container">
                                    <div class="container-tile">Changed</div>
                                    <div class="container-content">
                                        <CompareString
                                            v-if="changed.incorrect_answer_1"
                                            :diffString="
                                                changed.incorrect_answer_1
                                            "
                                        />
                                        <div v-else>No changed Happened</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
            <div class="my-4">
                <hr />
            </div>
            <!-- --Incorrect Answer 2-- -->
            <div class="d-flex flex-column">
                <div class="d-flex align-items-center">
                    <h2 class="compare-container-tile mb-3">
                        Incorrect Answer 2
                    </h2>
                    <div
                        @click="
                            showIncorrectAnswer2Change =
                                !showIncorrectAnswer2Change
                        "
                        :class="[
                            showIncorrectAnswer2Change
                                ? 'expand-arrow'
                                : 'minimize-arrow'
                        ]"
                        b-on-hover
                        :title="
                            showIncorrectAnswer2Change ? 'minimize' : 'expand'
                        "
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            width="16"
                            heigh="16"
                            fill="#475569"
                        >
                            <path
                                d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
                            />
                        </svg>
                    </div>
                </div>
                <Transition name="dropdown">
                    <div v-if="showIncorrectAnswer2Change">
                        <div class="d-flex flex-column">
                            <div class="d-flex flex-row-reverse gap-4 mb-3">
                                <div class="add-count">
                                    <span class="plus-icon">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 448 512"
                                            height="15"
                                            width="15"
                                            fill="#1aa375"
                                        >
                                            <path
                                                d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"
                                            />
                                        </svg>
                                    </span>
                                    {{ changeCount.incorrectAnswer2Add }}
                                    addition
                                </div>
                                <div class="remove-count">
                                    <span class="minus-icon">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 448 512"
                                            height="15"
                                            width="15"
                                            fill="#ea6c6c"
                                        >
                                            <path
                                                d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                                            />
                                        </svg>
                                    </span>
                                    {{ changeCount.incorrectAnswer2Remove }}
                                    removal
                                </div>
                            </div>
                            <div class="d-flex flex-lg-row flex-column">
                                <!-- Old Banner -->
                                <div class="old-container general-container">
                                    <div class="container-tile">Original</div>
                                    <div class="container-content">
                                        {{ mcQuestion.incorrect_answer_2 }}
                                    </div>
                                </div>
                                <!-- Long arrow pointing right -->
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    width="50"
                                    height="50"
                                    fill="#ac90e8"
                                    class="d-none d-lg-block my-auto mx-1"
                                >
                                    <path
                                        d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"
                                    />
                                </svg>
                                <!-- Long arrow pointing down on tablet and mobile-->
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 320 512"
                                    fill="#ac90e8"
                                    height="50"
                                    width="50"
                                    class="mx-auto my-2 d-lg-none"
                                >
                                    <path
                                        d="M2 334.5c-3.8 8.8-2 19 4.6 26l136 144c4.5 4.8 10.8 7.5 17.4 7.5s12.9-2.7 17.4-7.5l136-144c6.6-7 8.4-17.2 4.6-26s-12.5-14.5-22-14.5l-72 0 0-288c0-17.7-14.3-32-32-32L128 0C110.3 0 96 14.3 96 32l0 288-72 0c-9.6 0-18.2 5.7-22 14.5z"
                                    />
                                </svg>
                                <!-- New Banner -->
                                <div class="new-container general-container">
                                    <div class="container-tile">Changed</div>
                                    <div class="container-content">
                                        <CompareString
                                            v-if="changed.incorrect_answer_2"
                                            :diffString="
                                                changed.incorrect_answer_2
                                            "
                                        />
                                        <div v-else>No changed Happened</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
            <div class="my-4">
                <hr />
            </div>
            <!-- --Incorrect Answer 3-- -->
            <div class="d-flex flex-column">
                <div class="d-flex align-items-center">
                    <h2 class="compare-container-tile mb-3">
                        Incorrect Answer 3
                    </h2>
                    <div
                        @click="
                            showIncorrectAnswer3Change =
                                !showIncorrectAnswer3Change
                        "
                        :class="[
                            showIncorrectAnswer3Change
                                ? 'expand-arrow'
                                : 'minimize-arrow'
                        ]"
                        b-on-hover
                        :title="
                            showIncorrectAnswer3Change ? 'minimize' : 'expand'
                        "
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            width="16"
                            heigh="16"
                            fill="#475569"
                        >
                            <path
                                d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
                            />
                        </svg>
                    </div>
                </div>
                <Transition name="dropdown">
                    <div v-if="showIncorrectAnswer3Change">
                        <div class="d-flex flex-column">
                            <div class="d-flex flex-row-reverse gap-4 mb-3">
                                <div class="add-count">
                                    <span class="plus-icon">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 448 512"
                                            height="15"
                                            width="15"
                                            fill="#1aa375"
                                        >
                                            <path
                                                d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"
                                            />
                                        </svg>
                                    </span>
                                    {{ changeCount.incorrectAnswer3Add }}
                                    addition
                                </div>
                                <div class="remove-count">
                                    <span class="minus-icon">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 448 512"
                                            height="15"
                                            width="15"
                                            fill="#ea6c6c"
                                        >
                                            <path
                                                d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                                            />
                                        </svg>
                                    </span>
                                    {{ changeCount.incorrectAnswer3Remove }}
                                    removal
                                </div>
                            </div>
                            <div class="d-flex flex-lg-row flex-column">
                                <!-- Old Banner -->
                                <div class="old-container general-container">
                                    <div class="container-tile">Original</div>
                                    <div class="container-content">
                                        {{ mcQuestion.incorrect_answer_3 }}
                                    </div>
                                </div>
                                <!-- Long arrow pointing right -->
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    width="50"
                                    height="50"
                                    fill="#ac90e8"
                                    class="d-none d-lg-block my-auto mx-1"
                                >
                                    <path
                                        d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"
                                    />
                                </svg>
                                <!-- Long arrow pointing down on tablet and mobile-->
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 320 512"
                                    fill="#ac90e8"
                                    height="50"
                                    width="50"
                                    class="mx-auto my-2 d-lg-none"
                                >
                                    <path
                                        d="M2 334.5c-3.8 8.8-2 19 4.6 26l136 144c4.5 4.8 10.8 7.5 17.4 7.5s12.9-2.7 17.4-7.5l136-144c6.6-7 8.4-17.2 4.6-26s-12.5-14.5-22-14.5l-72 0 0-288c0-17.7-14.3-32-32-32L128 0C110.3 0 96 14.3 96 32l0 288-72 0c-9.6 0-18.2 5.7-22 14.5z"
                                    />
                                </svg>
                                <!-- New Banner -->
                                <div class="new-container general-container">
                                    <div class="container-tile">Changed</div>
                                    <div class="container-content">
                                        <CompareString
                                            v-if="changed.incorrect_answer_3"
                                            :diffString="
                                                changed.incorrect_answer_3
                                            "
                                        />
                                        <div v-else>No changed Happened</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
            <div class="my-4">
                <hr />
            </div>
            <!-- --Incorrect Answer 4-- -->
            <div class="d-flex flex-column">
                <div class="d-flex align-items-center">
                    <h2 class="compare-container-tile mb-3">
                        Incorrect Answer 4
                    </h2>
                    <div
                        @click="
                            showIncorrectAnswer4Change =
                                !showIncorrectAnswer4Change
                        "
                        :class="[
                            showIncorrectAnswer4Change
                                ? 'expand-arrow'
                                : 'minimize-arrow'
                        ]"
                        b-on-hover
                        :title="
                            showIncorrectAnswer4Change ? 'minimize' : 'expand'
                        "
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            width="16"
                            heigh="16"
                            fill="#475569"
                        >
                            <path
                                d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
                            />
                        </svg>
                    </div>
                </div>
                <Transition name="dropdown">
                    <div v-if="showIncorrectAnswer4Change">
                        <div class="d-flex flex-column">
                            <div class="d-flex flex-row-reverse gap-4 mb-3">
                                <div class="add-count">
                                    <span class="plus-icon">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 448 512"
                                            height="15"
                                            width="15"
                                            fill="#1aa375"
                                        >
                                            <path
                                                d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"
                                            />
                                        </svg>
                                    </span>
                                    {{ changeCount.incorrectAnswer4Add }}
                                    addition
                                </div>
                                <div class="remove-count">
                                    <span class="minus-icon">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 448 512"
                                            height="15"
                                            width="15"
                                            fill="#ea6c6c"
                                        >
                                            <path
                                                d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                                            />
                                        </svg>
                                    </span>
                                    {{ changeCount.incorrectAnswer4Remove }}
                                    removal
                                </div>
                            </div>
                            <div class="d-flex flex-lg-row flex-column">
                                <!-- Old Banner -->
                                <div class="old-container general-container">
                                    <div class="container-tile">Original</div>
                                    <div class="container-content">
                                        {{ mcQuestion.incorrect_answer_4 }}
                                    </div>
                                </div>
                                <!-- Long arrow pointing right -->
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    width="50"
                                    height="50"
                                    fill="#ac90e8"
                                    class="d-none d-lg-block my-auto mx-1"
                                >
                                    <path
                                        d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"
                                    />
                                </svg>
                                <!-- Long arrow pointing down on tablet and mobile-->
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 320 512"
                                    fill="#ac90e8"
                                    height="50"
                                    width="50"
                                    class="mx-auto my-2 d-lg-none"
                                >
                                    <path
                                        d="M2 334.5c-3.8 8.8-2 19 4.6 26l136 144c4.5 4.8 10.8 7.5 17.4 7.5s12.9-2.7 17.4-7.5l136-144c6.6-7 8.4-17.2 4.6-26s-12.5-14.5-22-14.5l-72 0 0-288c0-17.7-14.3-32-32-32L128 0C110.3 0 96 14.3 96 32l0 288-72 0c-9.6 0-18.2 5.7-22 14.5z"
                                    />
                                </svg>
                                <!-- New Banner -->
                                <div class="new-container general-container">
                                    <div class="container-tile">Changed</div>
                                    <div class="container-content">
                                        <CompareString
                                            v-if="changed.incorrect_answer_4"
                                            :diffString="
                                                changed.incorrect_answer_4
                                            "
                                        />
                                        <div v-else>No changed Happened</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>
        <!-- ----| Explanation Compare Container -->
        <div class="compare-container mt-5">
            <div class="d-flex align-items-center">
                <h2 class="compare-container-tile mb-3">Explanation</h2>
                <div
                    @click="showExplanationChange = !showExplanationChange"
                    :class="[
                        showExplanationChange
                            ? 'expand-arrow'
                            : 'minimize-arrow'
                    ]"
                    b-on-hover
                    :title="showExplanationChange ? 'minimize' : 'expand'"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="16"
                        heigh="16"
                        fill="#475569"
                    >
                        <path
                            d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
                        />
                    </svg>
                </div>
            </div>
            <Transition name="dropdown">
                <div v-if="showExplanationChange">
                    <div class="d-flex flex-column">
                        <div class="d-flex flex-row-reverse gap-4 mb-3">
                            <div class="add-count">
                                <span class="plus-icon">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 448 512"
                                        height="15"
                                        width="15"
                                        fill="#1aa375"
                                    >
                                        <path
                                            d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"
                                        />
                                    </svg>
                                </span>
                                {{ changeCount.explanationAdd }} addition
                            </div>
                            <div class="remove-count">
                                <span class="minus-icon">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 448 512"
                                        height="15"
                                        width="15"
                                        fill="#ea6c6c"
                                    >
                                        <path
                                            d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                                        />
                                    </svg>
                                </span>
                                {{ changeCount.explanationRemove }} removal
                            </div>
                        </div>
                        <div class="d-flex flex-lg-row flex-column">
                            <!-- Old Banner -->
                            <div class="old-container general-container">
                                <div class="container-tile">Original</div>
                                <div class="container-content">
                                    {{ mcQuestion.explanation }}
                                </div>
                            </div>
                            <!-- Long arrow pointing right -->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                width="50"
                                height="50"
                                fill="#ac90e8"
                                class="d-none d-lg-block my-auto mx-1"
                            >
                                <path
                                    d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"
                                />
                            </svg>
                            <!-- Long arrow pointing down on tablet and mobile-->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 320 512"
                                fill="#ac90e8"
                                height="50"
                                width="50"
                                class="mx-auto my-2 d-lg-none"
                            >
                                <path
                                    d="M2 334.5c-3.8 8.8-2 19 4.6 26l136 144c4.5 4.8 10.8 7.5 17.4 7.5s12.9-2.7 17.4-7.5l136-144c6.6-7 8.4-17.2 4.6-26s-12.5-14.5-22-14.5l-72 0 0-288c0-17.7-14.3-32-32-32L128 0C110.3 0 96 14.3 96 32l0 288-72 0c-9.6 0-18.2 5.7-22 14.5z"
                                />
                            </svg>
                            <!-- New Banner -->
                            <div class="new-container general-container">
                                <div class="container-tile">Changed</div>
                                <div class="container-content">
                                    <CompareString
                                        v-if="changed.explanation"
                                        :diffString="changed.explanation"
                                    />
                                    <div v-else>No changed Happened</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
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

.old-container {
    position: relative;
    background-color: white;
    border: 1px solid rgb(163, 42, 42);
    border-radius: 10px;
    padding: 10px 15px;
    color: rgb(163, 42, 42);
}

.new-container {
    position: relative;
    background-color: white;
    border: 1px solid rgb(46, 126, 38);
    border-radius: 10px;
    padding: 10px 15px;
    color: rgb(46, 126, 38);
}

.container-tile {
    position: absolute;
    top: -15px;
    font-size: 18px;
    left: 20px;
    padding-left: 5px;
    padding-right: 5px;
    background-color: white;
}

@keyframes rotation {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(180deg);
    }
}

@keyframes rotationBack {
    from {
        transform: rotate(180deg);
    }

    to {
        transform: rotate(0deg);
    }
}

/* Slide down animation */
@keyframes slide {
    0% {
        opacity: 0;
        transform: scaleY(0);
    }

    100% {
        opacity: 1;
        transform: scaleY(1);
    }
}
.dropdown-enter-active {
    transform-origin: top center;
    animation: slide 0.2s;
}
.dropdown-leave-active {
    transform-origin: top center;
    animation: slide 0.2s reverse;
}

/* End of sliding animation */
.general-container {
    width: 100%;
    height: 400;
    display: flex;
    justify-content: center;
}

.container-content {
    color: black;
    text-align: left;
    width: 100%;
    margin-top: 5px;
    margin-left: 9px;
}

.expand-arrow {
    margin-left: 5px;
    margin-right: auto;
    margin-bottom: 10px;
    animation: rotation 0.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
    cursor: pointer;
}

.minimize-arrow {
    margin-left: 5px;
    margin-right: auto;
    margin-bottom: 20px;
    animation: rotationBack 0.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
    cursor: pointer;
}

.add-count {
    color: #157a6e;
    font-size: 16px;
    font-weight: 500;
    display: flex;
    gap: 5px;
}

.remove-count {
    color: #b12c2b;
    font-size: 16px;
    font-weight: 500;
    display: flex;
    gap: 5px;
}

.plus-icon {
    background-color: #ccebe0;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px 5px;
}

.minus-icon {
    background-color: #f9d2d2;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px 5px;
}
</style>
