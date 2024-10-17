<script>
import diff from 'fast-diff';
import CompareString from './CompareString.vue';
import { nextTick } from 'vue';
import { diffWords } from 'diff';

export default {
    setup() {},
    data() {
        return {
            mcQuestionId: this.$route.params.contentId,
            userId: this.$route.params.userId,
            mcQuestion: {},
            mcQuestionEdit: {},
            tempMcQuestionEdit: {},
            comment: '',
            isEditMode: false,
            edited: false,
            showHighLight: true,
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
        this.compareEdit();
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
            // initiate a temp data of mc question edit
            this.tempMcQuestionEdit = this.mcQuestionEdit;
            this.isEditMode = true;
            this.$parent.disableBtn = true;
            // Auto size text area to show all text without scroll bar in next tick where the text area will appear.
            nextTick(() => {
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
            });

            // Scroll to page tile header
            const el = this.$refs.pageTile;

            if (el) {
                // Use el.scrollIntoView() to instantly scroll to the element
                el.scrollIntoView({ behavior: 'smooth' });
            }
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
                    edit: this.edited
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
        },
        applyMcQuestionChange() {
            this.compareEdit();
            this.edited = true;
            this.isEditMode = false;
            this.$parent.disableBtn = false;
            this.mcQuestionEdit = this.tempMcQuestionEdit;
        },
        cancelEditMcQuestion() {
            this.isEditMode = false;
            this.$parent.disableBtn = false;
        },
        // --- Compare all aspect of two question --- //
        compareEdit() {
            // --- Question Content
            if (
                this.mcQuestion.question !== this.mcQuestionEdit.question ||
                this.isEditMode
            ) {
                this.changed.question = diffWords(
                    this.mcQuestion.question,
                    this.mcQuestionEdit.question
                );

                this.changed.question.forEach((element) => {
                    if (element.added && !element.removed) {
                        this.changeCount.questionAdd =
                            this.changeCount.questionAdd + element.count;
                    }
                    if (!element.added && element.removed) {
                        this.changeCount.questionRemove =
                            this.changeCount.questionRemove + element.count;
                    }
                });
            }
            // --- Correct Answer
            if (
                this.mcQuestion.correct_answer !==
                    this.mcQuestionEdit.correct_answer ||
                this.isEditMode
            ) {
                this.changed.correct_answer = diffWords(
                    this.mcQuestion.correct_answer,
                    this.mcQuestionEdit.correct_answer
                );

                this.changed.correct_answer.forEach((element) => {
                    if (element.added && !element.removed) {
                        this.changeCount.correctAnswerAdd =
                            this.changeCount.correctAnswerAdd + element.count;
                    }
                    if (!element.added && element.removed) {
                        this.changeCount.correctAnswerRemove =
                            this.changeCount.correctAnswerRemove +
                            element.count;
                    }
                });
            }

            // --- Incorrect Answer 1
            if (
                this.mcQuestion.incorrect_answer_1 !==
                    this.mcQuestionEdit.incorrect_answer_1 ||
                this.isEditMode
            ) {
                this.changed.incorrect_answer_1 = diffWords(
                    this.mcQuestion.incorrect_answer_1,
                    this.mcQuestionEdit.incorrect_answer_1
                );

                this.changed.incorrect_answer_1.forEach((element) => {
                    if (element.added && !element.removed) {
                        this.changeCount.incorrectAnswer1Add =
                            this.changeCount.incorrectAnswer1Add +
                            element.count;
                    }
                    if (!element.added && element.removed) {
                        this.changeCount.incorrectAnswer1Remove =
                            this.changeCount.incorrectAnswer1Remove +
                            element.count;
                    }
                });
            }

            // --- Incorrect Answer 2
            if (
                this.mcQuestion.incorrect_answer_2 !==
                    this.mcQuestionEdit.incorrect_answer_2 ||
                this.isEditMode
            ) {
                this.changed.incorrect_answer_2 = diffWords(
                    this.mcQuestion.incorrect_answer_2,
                    this.mcQuestionEdit.incorrect_answer_2
                );

                this.changed.incorrect_answer_2.forEach((element) => {
                    if (element.added && !element.removed) {
                        this.changeCount.incorrectAnswer2Add =
                            this.changeCount.incorrectAnswer2Add +
                            element.count;
                    }
                    if (!element.added && element.removed) {
                        this.changeCount.incorrectAnswer2Remove =
                            this.changeCount.incorrectAnswer2Remove +
                            element.count;
                    }
                });
            }

            // --- Incorrect Answer 3
            if (
                this.mcQuestion.incorrect_answer_3 !==
                    this.mcQuestionEdit.incorrect_answer_3 ||
                this.isEditMode
            ) {
                this.changed.incorrect_answer_3 = diffWords(
                    this.mcQuestion.incorrect_answer_3,
                    this.mcQuestionEdit.incorrect_answer_3
                );

                this.changed.incorrect_answer_3.forEach((element) => {
                    if (element.added && !element.removed) {
                        this.changeCount.incorrectAnswer3Add =
                            this.changeCount.incorrectAnswer3Add +
                            element.count;
                    }
                    if (!element.added && element.removed) {
                        this.changeCount.incorrectAnswer3Remove =
                            this.changeCount.incorrectAnswer3Remove +
                            element.count;
                    }
                });
            }

            // --- Incorrect Answer 4
            if (
                this.mcQuestion.incorrect_answer_4 !==
                    this.mcQuestionEdit.incorrect_answer_4 ||
                this.isEditMode
            ) {
                this.changed.incorrect_answer_4 = diffWords(
                    this.mcQuestion.incorrect_answer_4,
                    this.mcQuestionEdit.incorrect_answer_4
                );

                this.changed.incorrect_answer_4.forEach((element) => {
                    if (element.added && !element.removed) {
                        this.changeCount.incorrectAnswer4Add =
                            this.changeCount.incorrectAnswer4Add +
                            element.count;
                    }
                    if (!element.added && element.removed) {
                        this.changeCount.incorrectAnswer4Remove =
                            this.changeCount.incorrectAnswer4Remove +
                            element.count;
                    }
                });
            }

            // --- Explanation
            if (
                this.mcQuestion.explanation !==
                    this.mcQuestionEdit.explanation ||
                this.isEditMode
            ) {
                this.changed.explanation = diffWords(
                    this.mcQuestion.explanation,
                    this.mcQuestionEdit.explanation
                );

                this.changed.explanation.forEach((element) => {
                    if (element.added && !element.removed) {
                        this.changeCount.explanationAdd =
                            this.changeCount.explanationAdd + element.count;
                    }
                    if (!element.added && element.removed) {
                        this.changeCount.explanationRemove =
                            this.changeCount.explanationRemove + element.count;
                    }
                });
            }
        }
    }
};
</script>

<template>
    <div class="container mt-4 mb-4">
        <h1 ref="pageTile" class="page-title">MC Question Change Comparison</h1>
        <hr />
        <!-- ---General info of skills -->
        <div class="d-flex flex-column gap-2 mb-3">
            <div class="d-flex gap-2 align-items-center">
                <div class="compare-container-tile">Skill:</div>
                <div class="minor-text">{{ mcQuestion.skill_name }}</div>
            </div>
            <div class="d-flex gap-2 align-items-center">
                <div class="compare-container-tile">Level:</div>
                <div class="minor-text">{{ mcQuestion.skill_level }}</div>
            </div>
        </div>
        <!-- ----Show and hide Hight light Button-->
        <div class="d-flex flex-row-reverse my-3">
            <div
                class="btn green-btn d-flex align-items-center"
                @click="showHighLight = !showHighLight"
            >
                {{ showHighLight ? 'Hide' : 'Show' }} Hight Light
                <svg
                    v-if="showHighLight"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 576 512"
                    width="30"
                    height="30"
                    fill="white"
                    class="ms-2"
                >
                    <path
                        d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"
                    />
                </svg>
                <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 512"
                    width="30"
                    height="30"
                    fill="white"
                    class="ms-2"
                >
                    <path
                        d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 97.7 269.5 80 320 80c65.2 0 118.8 29.6 159.9 67.7C518.4 183.5 545 226 558.6 256c-12.6 28-36.6 66.8-70.9 100.9l-53.8-42.2c9.1-17.6 14.2-37.5 14.2-58.7c0-70.7-57.3-128-128-128c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1zM394.9 284.2l-81.5-63.9c4.2-8.5 6.6-18.2 6.6-28.3c0-5.5-.7-10.9-2-16c.7 0 1.3 0 2 0c44.2 0 80 35.8 80 80c0 9.9-1.8 19.4-5.1 28.2zm9.4 130.3C378.8 425.4 350.7 432 320 432c-65.2 0-118.8-29.6-159.9-67.7C121.6 328.5 95 286 81.4 256c8.3-18.4 21.5-41.5 39.4-64.8L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5l-41.9-33zM192 256c0 70.7 57.3 128 128 128c13.3 0 26.1-2 38.2-5.8L302 334c-23.5-5.4-43.1-21.2-53.7-42.3l-56.1-44.2c-.2 2.8-.3 5.6-.3 8.5z"
                    />
                </svg>
            </div>
        </div>
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
            <!-- Compare Content -->
            <Transition name="dropdown">
                <div v-if="showQuestionChange && !isEditMode">
                    <div class="d-flex flex-column">
                        <!-- Addition and removal count section -->
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
                            <div class="new-container general-container">
                                <div class="container-tile">Changed</div>
                                <div class="container-content">
                                    <CompareString
                                        v-if="changed.question && showHighLight"
                                        :diffString="changed.question"
                                    />
                                    <div
                                        v-else-if="
                                            changed.question && !showHighLight
                                        "
                                    >
                                        {{ mcQuestionEdit.question }}
                                    </div>
                                    <div v-else>No changed Happened</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
            <!-- Editable Text area -->
            <Transition name="dropdown">
                <div v-if="showQuestionChange && isEditMode">
                    <div class="d-flex flex-column">
                        <textarea
                            class="editable-text-area"
                            v-model="tempMcQuestionEdit.question"
                        ></textarea>
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
                    <div v-if="showCorrectAnswerChange && !isEditMode">
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
                                <div class="new-container general-container">
                                    <div class="container-tile">Changed</div>
                                    <div class="container-content">
                                        <CompareString
                                            v-if="
                                                changed.correct_answer &&
                                                showHighLight
                                            "
                                            :diffString="changed.correct_answer"
                                        />
                                        <div
                                            v-else-if="
                                                changed.question &&
                                                !showHighLight
                                            "
                                        >
                                            {{ mcQuestionEdit.correct_answer }}
                                        </div>
                                        <div v-else>No changed Happened</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
                <!-- Editable Text area -->
                <Transition name="dropdown">
                    <div v-if="showCorrectAnswerChange && isEditMode">
                        <div class="d-flex flex-column">
                            <textarea
                                class="editable-text-area"
                                v-model="tempMcQuestionEdit.correct_answer"
                            ></textarea>
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
                    <div v-if="showIncorrectAnswer1Change && !isEditMode">
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
                                            v-if="
                                                changed.incorrect_answer_1 &&
                                                showHighLight
                                            "
                                            :diffString="
                                                changed.incorrect_answer_1
                                            "
                                        />
                                        <div
                                            v-else-if="
                                                changed.question &&
                                                !showHighLight
                                            "
                                        >
                                            {{
                                                mcQuestionEdit.incorrect_answer_1
                                            }}
                                        </div>
                                        <div v-else>No changed Happened</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
                <!-- Editable Text area -->
                <Transition name="dropdown">
                    <div v-if="showIncorrectAnswer1Change && isEditMode">
                        <div class="d-flex flex-column">
                            <textarea
                                class="editable-text-area"
                                v-model="tempMcQuestionEdit.incorrect_answer_1"
                            ></textarea>
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
                    <div v-if="showIncorrectAnswer2Change && !isEditMode">
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
                                            v-if="
                                                changed.incorrect_answer_2 &&
                                                showHighLight
                                            "
                                            :diffString="
                                                changed.incorrect_answer_2
                                            "
                                        />
                                        <div
                                            v-else-if="
                                                changed.incorrect_answer_2 &&
                                                !showHighLight
                                            "
                                        >
                                            {{
                                                mcQuestionEdit.incorrect_answer_2
                                            }}
                                        </div>
                                        <div v-else>No changed Happened</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
                <!-- Editable Text area -->
                <Transition name="dropdown">
                    <div v-if="showIncorrectAnswer2Change && isEditMode">
                        <div class="d-flex flex-column">
                            <textarea
                                class="editable-text-area"
                                v-model="tempMcQuestionEdit.incorrect_answer_2"
                            ></textarea>
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
                    <div v-if="showIncorrectAnswer3Change && !isEditMode">
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
                                            v-if="
                                                changed.incorrect_answer_3 &&
                                                showHighLight
                                            "
                                            :diffString="
                                                changed.incorrect_answer_3
                                            "
                                        />
                                        <div
                                            v-else-if="
                                                changed.incorrect_answer_3 &&
                                                !showHighLight
                                            "
                                        >
                                            {{
                                                mcQuestionEdit.incorrect_answer_3
                                            }}
                                        </div>
                                        <div v-else>No changed Happened</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
                <!-- Editable Text area -->
                <Transition name="dropdown">
                    <div v-if="showIncorrectAnswer3Change && isEditMode">
                        <div class="d-flex flex-column">
                            <textarea
                                class="editable-text-area"
                                v-model="tempMcQuestionEdit.incorrect_answer_3"
                            ></textarea>
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
                    <div v-if="showIncorrectAnswer4Change && !isEditMode">
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
                                            v-if="
                                                changed.incorrect_answer_4 &&
                                                showHighLight
                                            "
                                            :diffString="
                                                changed.incorrect_answer_4
                                            "
                                        />
                                        <div
                                            v-else-if="
                                                changed.incorrect_answer_4 &&
                                                !showHighLight
                                            "
                                        >
                                            {{
                                                mcQuestionEdit.incorrect_answer_4
                                            }}
                                        </div>
                                        <div v-else>No changed Happened</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
                <!-- Editable Text area -->
                <Transition name="dropdown">
                    <div v-if="showIncorrectAnswer4Change && isEditMode">
                        <div class="d-flex flex-column">
                            <textarea
                                class="editable-text-area"
                                v-model="tempMcQuestionEdit.incorrect_answer_4"
                            ></textarea>
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
                <div v-if="showExplanationChange && !isEditMode">
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
                                        v-if="
                                            changed.explanation && showHighLight
                                        "
                                        :diffString="changed.explanation"
                                    />
                                    <div
                                        v-else-if="
                                            changed.explanation &&
                                            !showHighLight
                                        "
                                    >
                                        {{ mcQuestionEdit.explanation }}
                                    </div>
                                    <div v-else>No changed Happened</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
            <!-- Editable Text area -->
            <Transition name="dropdown">
                <div v-if="showExplanationChange && isEditMode">
                    <div class="d-flex flex-column">
                        <textarea
                            class="editable-text-area"
                            v-model="tempMcQuestionEdit.explanation"
                        ></textarea>
                    </div>
                </div>
            </Transition>
        </div>
        <!-- ----| Buttons Only Shows when User Edit question |---- -->
        <div v-if="isEditMode" class="d-flex flex-row-reverse gap-3">
            <div
                class="btn green-btn d-flex align-items-center my-3"
                @click="applyMcQuestionChange"
            >
                Apply
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 576 512"
                    width="22"
                    heigh="22"
                    fill="white"
                    class="ms-2"
                >
                    <path
                        d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 125.7-86.8 86.8c-10.3 10.3-17.5 23.1-21 37.2l-18.7 74.9c-2.3 9.2-1.8 18.8 1.3 27.5L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128zM549.8 235.7l14.4 14.4c15.6 15.6 15.6 40.9 0 56.6l-29.4 29.4-71-71 29.4-29.4c15.6-15.6 40.9-15.6 56.6 0zM311.9 417L441.1 287.8l71 71L382.9 487.9c-4.1 4.1-9.2 7-14.9 8.4l-60.1 15c-5.5 1.4-11.2-.2-15.2-4.2s-5.6-9.7-4.2-15.2l15-60.1c1.4-5.6 4.3-10.8 8.4-14.9z"
                    />
                </svg>
            </div>
            <div
                class="btn red-btn d-flex align-items-center my-3"
                @click="cancelEditMcQuestion"
            >
                Cancel
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    width="22"
                    heigh="22"
                    fill="white"
                    class="ms-2"
                >
                    <path
                        d="M64 80c-8.8 0-16 7.2-16 16l0 320c0 8.8 7.2 16 16 16l384 0c8.8 0 16-7.2 16-16l0-320c0-8.8-7.2-16-16-16L64 80zM0 96C0 60.7 28.7 32 64 32l384 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zm175 79c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"
                    />
                </svg>
            </div>
        </div>
        <!-- ----| User comment |---- -->
        <!-- User Comment -->
        <div class="mt-5 w-lg-50 w-md-75 w-100 compare-container">
            <div class="d-flex flex-md-row flex-column gap-2">
                <h2 class="compare-container-tile mb-3">Comment:</h2>
                <div class="comment-text">
                    {{ mcQuestionEdit.comment }}
                </div>
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

.editable-text-area {
    border-radius: 5px;
    border: 1px solid rgb(46, 126, 38);
    padding: 5px 10px;
}

.editable-text-area:focus {
    outline: none;
}

.minus-icon {
    background-color: #f9d2d2;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px 5px;
}

.comment-text {
    background-color: #f1f5f9;
    border-radius: 5px;
    padding: 15px;
    width: 100%;
}
</style>
