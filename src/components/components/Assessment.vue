<script>
// Import the store.
import { useUserDetailsStore } from '../../stores/UserDetailsStore';
import { useUserSkillsStore } from '../../stores/UserSkillsStore.js';
import { useSettingsStore } from '../../stores/SettingsStore.js';
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useAssessmentsStore } from '../../stores/AssessmentsStore';
import EssayAnswer from './EssayAnswer.vue';
import StudentAddMCQuestion from './StudentAddMCQuestion.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const userSkillsStore = useUserSkillsStore();
        const settingsStore = useSettingsStore();
        const skillsStore = useSkillsStore();
        const assessmentsStore = useAssessmentsStore();

        return {
            userDetailsStore,
            userSkillsStore,
            settingsStore,
            skillsStore,
            assessmentsStore
        };
    },
    data() {
        return {
            loading: true,
            skillId: this.$route.params.id,
            skill: {},
            mcQuestions: [],
            essayQuestions: [],
            questions: [],
            question: {},
            questionNumber: 0,
            score: 0,
            assessmentId: null,
            numMCQuestions: 0,
            numEssayQuestions: 0,
            totalNumOfQuestions: 0,
            isAllQuestionsAnswered: false,
            // flag for which modal to show
            passModal: false,
            failedModal: false,
            waitForMarkModal: false,
            // the flag to determine whether the student update assessment
            oldAssessment: undefined,
            updatedAssessment: false,
            // flagging modal data
            showFlaggingModal: false,
            isQuizPassed: false,
            showThankModal: false,
            // assign the initial index to infinity because index is number type
            answerHoveredIndex: Infinity
        };
    },
    mounted: function () {
        //  Summer note config
        $('.summernote').summernote({
            placeholder: 'this is the summer note',
            tabsize: 2,
            height: 120,
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'underline', 'clear']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['table', ['table']],
                ['insert', ['link', 'picture', 'video']],
                ['view', ['fullscreen', 'codeview', 'help']]
            ],
            maximumImageFileSize: 2048 * 1024, // 2 MB
            callbacks: {
                onImageUploadError: function (msg) {
                    alert('Max image size is 2MB.');
                }
            }
        });
    },
    async created() {
        // Load the max quiz question number setting.
        if (this.settingsStore.quizMaxQuestions == null) {
            await this.settingsStore.getSettings();
        }

        /**
         * We get assessment list every time the component is created
         * to assure that if this assessment available at the time
         */
        await this.assessmentsStore.getAssessments();
        const assessments = this.assessmentsStore.assessments;

        // Get current user Details
        const userDetails = await this.userDetailsStore.getUserDetails();

        // find if student have an un-mark assessment for this skill
        this.oldAssessment = assessments.find((assessment) => {
            return assessment.student_id === userDetails.userId;
        });

        if (this.oldAssessment !== undefined) {
            // turn the flag for updated on
            this.updatedAssessment = true;
        }

        // Check skill type.
        let skillType;
        for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
            if (this.skillsStore.skillsList[i].id == this.skillId) {
                skillType = this.skillsStore.skillsList[i].type;
                this.skill = this.skillsStore.skillsList[i];
            }
        }
        // Get user skills, in case this is a sub skill. We have to check its siblings.
        // Need to get the questions for the quiz, before the DOM renders.
        if (skillType != 'super') {
            await this.fetchMCQuestions(this.skillId);
            //  await this.fetchEssayQuestions(this.skillId);
            // If it is a super skill, populate quiz from its subskills.
        } else {
            let subSkills = [];
            for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
                if (
                    this.skillsStore.skillsList[i].parent == this.skillId &&
                    this.skillsStore.skillsList[i].type == 'sub'
                ) {
                    subSkills.push(this.skillsStore.skillsList[i]);
                }
            }
            for (let i = 0; i < subSkills.length; i++) {
                await this.fetchMCQuestions(subSkills[i].id);
                //  await this.fetchEssayQuestions(subSkills[i].id);
            }
        }
    },
    components: {
        EssayAnswer,
        StudentAddMCQuestion
    },
    methods: {
        async fetchMCQuestions(skillId) {
            fetch('/questions/' + skillId + '/multiple-choice')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    // Add the new questions to the existing questions.
                    this.mcQuestions = this.mcQuestions.concat(data);
                })
                .then(() => {
                    // Add field to elements, for the user's answer.
                    for (let i = 0; i < this.mcQuestions.length; i++) {
                        this.mcQuestions[i].userAnswer = null;
                        this.mcQuestions[i].questionType = 'mc';
                    }

                    // Create answer options.
                    for (let i = 0; i < this.mcQuestions.length; i++) {
                        var answerOptions = [];
                        answerOptions.push({
                            option: this.mcQuestions[i].correct_answer,
                            index: 1
                        });
                        answerOptions.push({
                            option: this.mcQuestions[i].incorrect_answer_1,
                            index: 2
                        });
                        answerOptions.push({
                            option: this.mcQuestions[i].incorrect_answer_2,
                            index: 3
                        });
                        answerOptions.push({
                            option: this.mcQuestions[i].incorrect_answer_3,
                            index: 4
                        });
                        answerOptions.push({
                            option: this.mcQuestions[i].incorrect_answer_4,
                            index: 5
                        });
                        // Shuffle the questions.
                        answerOptions = answerOptions.sort(
                            (a, b) => 0.5 - Math.random()
                        );
                        // Make sure that is one option is "All of the above",
                        // It is at the bottom.
                        for (let i = 0; i < answerOptions.length; i++) {
                            // Ignore case.
                            if (
                                answerOptions[i].option.toUpperCase() ==
                                'all of the above'.toUpperCase()
                            ) {
                                function arrayMove(arr, fromIndex, toIndex) {
                                    var element = arr[fromIndex];
                                    arr.splice(fromIndex, 1);
                                    arr.splice(toIndex, 0, element);
                                }
                                arrayMove(answerOptions, i, 4);
                            }
                        }
                        this.mcQuestions[i].answerOptions = answerOptions;
                    }
                })
                .then(() => {
                    this.fetchEssayQuestions(skillId);
                });
        },
        async fetchEssayQuestions(skillId) {
            fetch('/questions/' + skillId + '/essay')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    // Add the new questions to the existing questions.
                    this.essayQuestions = this.essayQuestions.concat(data);
                })
                .then(() => {
                    // Add field to elements, for the user's answer.
                    for (let i = 0; i < this.essayQuestions.length; i++) {
                        this.essayQuestions[i].userAnswer = null;
                        this.essayQuestions[i].questionType = 'essay';
                    }
                })
                .then(() => {
                    // TODO: below can be optimized in the case of this being a super skill
                    // drawing questions from each sub skill to create a combine array of both type of question
                    this.questions = this.essayQuestions.concat(
                        this.mcQuestions
                    );

                    // Shuffle array to create random set of questions for each user
                    this.questions = this.questions.sort(
                        (a, b) => 0.5 - Math.random()
                    );

                    // Ensure that the number fo questions is at or below the setting.
                    if (
                        this.questions.length >
                        this.settingsStore.quizMaxQuestions
                    ) {
                        this.questions.length =
                            this.settingsStore.quizMaxQuestions;
                    }

                    // Set the first question in questions array for display
                    this.question = this.questions[0];
                    // Calculate the total num of questions.
                    // At the moment, each question is 1 mark, so we get the total score from this.
                    this.totalNumOfQuestions = this.questions.length;
                })
                .then(() => {
                    this.loading = false;
                });
        },
        Next() {
            // Handle essay answer with summernote
            if (this.question.questionType == 'essay') {
                // Get the summernote answer code
                const summerNote = this.$refs.essayAnswer.getAnswer();
                // Store user answer in questions array before move to next questions
                this.questions[this.questionNumber].userAnswer = summerNote;
                // Clear the summernote text
                this.$refs.essayAnswer.clearAnswer();
            }
            // Get next question data
            this.questionNumber++;
            this.question = this.questions[this.questionNumber];
            //  If the next question is essay question we have to handle with summernote
            if (this.question.questionType == 'essay') {
                // Set the next answer content if there are any
                if (this.question.userAnswer) {
                    this.$refs.essayAnswer.setAnswer(this.question.userAnswer);
                }
            }
        },
        Previous() {
            if (this.question.questionType == 'essay') {
                // Get the summernote answer code
                const summerNote = this.$refs.essayAnswer.getAnswer();
                // Store user answer in questions array before move to next questions
                this.questions[this.questionNumber].userAnswer = summerNote;
            }
            this.questionNumber--;
            this.question = this.questions[this.questionNumber];
            if (this.question.questionType == 'essay') {
                // Set the summernote to previous answer
                this.$refs.essayAnswer.setAnswer(this.question.userAnswer);
            }
        },
        Submit() {
            // if the last answer is also an essay question we handle it just like with the next and previous
            if (this.question.questionType == 'essay') {
                // Get the summernote answer code
                const summerNote = this.$refs.essayAnswer.getAnswer();
                // Store user answer in questions array before move to next questions
                this.questions[this.questionNumber].userAnswer = summerNote;
            }
            // Mark the MC questions (if there are any).
            for (let i = 0; i < this.questions.length; i++) {
                // Tally the score.
                if (this.questions[i].questionType == 'mc') {
                    this.numMCQuestions++;
                    if (this.questions[i].userAnswer == 1) {
                        this.score++;
                    }
                } else {
                    this.numEssayQuestions++;
                }
            }

            // If there are no essay questions we, mark the test now. If there are essay question , requiring manual marking
            if (this.numEssayQuestions === 0) {
                // Pass mark of 90%.
                if ((this.score / this.numMCQuestions) * 100 >= 90) {
                    this.isQuizPassed = true;
                } else {
                    this.failedModal = true;
                }
            } else {
                // Deal with the essay questions.

                let fetchMethod = 'POST';

                if (this.oldAssessment !== undefined) {
                    fetchMethod = 'PUT';
                }

                // create an unmarked assessment record
                const requestOptions = {
                    method: fetchMethod,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        totalScore: this.totalNumOfQuestions,
                        currentScore: this.score,
                        numUnmarkedQuestions: this.numEssayQuestions
                    })
                };
                var url =
                    '/assessments/' +
                    this.userDetailsStore.userId +
                    '/' +
                    this.skillId;
                const turnOnModal = () => {
                    this.waitForMarkModal = true;
                };

                fetch(url, requestOptions)
                    .then(function (response) {
                        return response.json();
                    })
                    // Retrieve the assessment id.
                    .then((data) => {
                        this.assessmentId = data.id;
                        // Delete any existing questions in this assessment.
                        fetch('/unmarked-answers/delete/' + this.assessmentId, {
                            method: 'DELETE'
                        }).then(() => {
                            for (let i = 0; i < this.questions.length; i++) {
                                if (this.questions[i].questionType == 'essay') {
                                    // create unmarked essay question records for each one.
                                    const requestOptions = {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                            answer: this.questions[i]
                                                .userAnswer,
                                            questionId: this.questions[i].id
                                        })
                                    };
                                    var url =
                                        '/unmarked-answers/add/' +
                                        this.assessmentId;
                                    fetch(url, requestOptions).then(function (
                                        response
                                    ) {
                                        turnOnModal();
                                    });
                                }
                            }
                        });
                    });
            }
        },
        async MakeMastered(skill) {
            await this.userSkillsStore.MakeMastered(
                this.userDetailsStore.userId,
                skill
            );
        },
        UserAnswer() {
            for (let i = 0; i < this.questions.length; i++) {
                if (this.questions[i].userAnswer == null) {
                    this.isAllQuestionsAnswered = false;
                    return;
                } else {
                    this.isAllQuestionsAnswered = true;
                }
            }
        },
        // For development purposes.
        TestPass() {
            // this.MakeMastered(this.skill);
            this.isQuizPassed = true;
        },
        flagQuestion(questionId) {
            // Determine the type of flag based on question type
            const questionType =
                this.question.questionType == 'mc'
                    ? 'mc_question'
                    : 'essay_question';
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content_type: questionType,
                    content_id: questionId,
                    user_id: this.userDetailsStore.userId
                })
            };
            var url = '/content-flags/add';
            fetch(url, requestOptions).then(() => {
                this.showThankModal = true;
                this.showFlaggingModal = false;
            });
        }
    }
};
</script>

<template>
    <!-- <button v-if="!isQuizPassed" @click="TestPass()" class="btn green-btn me-2">
        Test Pass
    </button> -->
    <!-- Loading screen -->
    <div v-if="loading == true">Loading...</div>
    <!-- Assessment -->
    <div v-if="loading == false && isQuizPassed == false">
        <!-- Show student a warning if their take this assessment before and still wait for marking -->
        <div v-if="updatedAssessment">
            <div id="myModal" class="modal">
                <!-- Modal content -->
                <div class="modal-content">
                    <div class="mb-2">
                        You are taking a new quiz for this skill while your old
                        one is still waiting to be marked. Please note that your
                        old answers will be replaced.
                    </div>
                    <div class="d-flex flex-row-reverse">
                        <button
                            type="button"
                            class="btn green-btn"
                            @click="this.updatedAssessment = false"
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="pb-2 pb-md-0">
            <div
                v-if="questions.length > 0"
                class="container mt-5 mb-3 p-3 pt-2 mb-3"
                id="question-container"
            >
                <!-- To wait for questions to be loaded, before the DOM renders. -->
                <div class="row">
                    <div
                        class="col d-flex my-2 gap-2 justify-content-between flex-column flex-md-row"
                    >
                        <div class="d-flex align-items-lg-center">
                            <div id="question-number-div">
                                {{ this.questionNumber + 1 }}
                            </div>

                            <div id="question-content">
                                {{ question.question }}
                            </div>
                        </div>
                        <!-- Flag Icon -->
                        <div
                            b-tooltip.hover
                            title="flag this question for review"
                            @click="showFlaggingModal = true"
                            class="flagging-icon"
                            style="height: 50px"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                                style="height: 22px; opacity: 0.5"
                            >
                                <path
                                    fill="#8f7bd6"
                                    d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32V64 368 480c0 17.7 14.3 32 32 32s32-14.3 32-32V352l64.3-16.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30V66.1c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L64 48V32z"
                                />
                            </svg>
                        </div>
                    </div>

                    <!-- Multiple Choice Question -->
                    <div v-if="this.question.questionType == 'mc'">
                        <div
                            v-for="(answerOption, index) in this.question
                                .answerOptions"
                            class="form-check my-3"
                        >
                            <label class="control control-checkbox">
                                <div
                                    :class="
                                        answerHoveredIndex == answerOption.index
                                            ? 'my-auto mx-2 me-4 answer-option checkbox-hovered'
                                            : 'my-auto mx-2 me-4 answer-option'
                                    "
                                >
                                    {{ answerOption.option }}
                                </div>
                                <input
                                    type="radio"
                                    name="nodeType"
                                    :value="answerOption.index"
                                    v-model="
                                        questions[this.questionNumber]
                                            .userAnswer
                                    "
                                />
                                <div
                                    class="control_indicator"
                                    @mouseover="
                                        answerHoveredIndex = answerOption.index
                                    "
                                    @mouseleave="answerHoveredIndex = Infinity"
                                ></div>
                            </label>
                        </div>
                    </div>
                    <!-- Essay Question -->
                    <div v-else-if="this.question.questionType == 'essay'">
                        <div class="form-group">
                            <EssayAnswer ref="essayAnswer" />
                        </div>
                    </div>
                </div>
                <div class="mt-3 d-flex justify-content-end">
                    <button
                        v-if="this.questionNumber > 0"
                        @click="Previous()"
                        class="btn red-btn me-2"
                    >
                        Previous
                    </button>
                    <button
                        v-if="this.questionNumber != questions.length - 1"
                        @click="Next()"
                        class="btn green-btn"
                    >
                        Next
                    </button>
                    <!-- <button disabled v-if="this.questionNumber == questions.length - 1 && !isAllQuestionsAnswered" @click="Submit()"
                    class="btn green-btn">Submit</button> -->
                    <button
                        v-if="this.questionNumber == questions.length - 1"
                        @click="Submit()"
                        class="btn green-btn"
                    >
                        Submit
                    </button>
                </div>
            </div>
            <div v-else="waitForMark == false" id="question-content">
                There is no quiz for this skill yet. Please check again soon.
            </div>
        </div>
    </div>
    <StudentAddMCQuestion
        v-else-if="loading == false && isQuizPassed == true"
    />
    <!----- Modals ----------->
    <!-- Pass Modal -->
    <div v-if="passModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
                <div class="d-flex align-content-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="50"
                        height="50"
                        fill="green"
                    >
                        <path
                            d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"
                        />
                    </svg>
                    <div class="my-auto ms-2">
                        Well done! You have now mastered this skill.
                    </div>
                </div>
                <div class="d-flex flex-row-reverse">
                    <button
                        type="button"
                        class="btn green-btn"
                        @click="this.$router.push('/skills/' + this.skillId)"
                    >
                        Great!
                    </button>
                </div>
            </div>
        </div>
    </div>
    <!-- Failed Modal-->
    <div v-if="failedModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
                <div class="d-flex align-content-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        fill="red"
                        width="50"
                        height="50"
                    >
                        <path
                            d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"
                        />
                    </svg>
                    <div class="my-auto ms-2">
                        You failed this time, try again later !
                    </div>
                </div>
                <div class="d-flex flex-row-reverse">
                    <button
                        type="button"
                        class="btn red-btn"
                        @click="this.$router.push('/skills/' + this.skillId)"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    </div>
    <!-- Wait for mark modal -->
    <div v-if="waitForMarkModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
                <div>
                    There is at least one question that needs to be marked by
                    your instructor. Please check whether you passed later.
                </div>
                <div class="d-flex flex-row-reverse">
                    <button
                        type="button"
                        class="btn green-btn"
                        @click="this.$router.push('/')"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    </div>
    <!-- The flagging Modal -->
    <div v-if="showFlaggingModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content-flag">
                <div class="d-flex gap-4">
                    <!-- Warn Triangle Icon -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        fill="grey"
                        width="45"
                        height="45"
                    >
                        <path
                            d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
                        />
                    </svg>
                    <p>
                        Would you like to flag this as unhelpful or incorrect
                        for admin review
                    </p>
                </div>
                <div class="d-flex justify-content-between gap-2">
                    <button
                        type="button"
                        class="btn red-btn w-md-25"
                        @click="showFlaggingModal = false"
                    >
                        <span class="d-none d-md-block"> No </span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            width="18"
                            height="18"
                            fill="white"
                            class="d-md-none modal-icon"
                        >
                            <path
                                d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"
                            />
                        </svg>
                    </button>
                    <button
                        type="button"
                        class="btn green-btn w-md-25"
                        @click="flagQuestion(question.id)"
                    >
                        <span class="d-none d-md-block"> Yes </span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            width="18"
                            height="18"
                            fill="white"
                            class="d-md-none modal-icon"
                        >
                            <path
                                d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <!-- Thank You Modal After User Flags Question -->
    <div v-if="showThankModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content-flag">
                <div class="d-flex gap-4 text-center">
                    <p>
                        Thank you for flagging this question. We will take a
                        look as soon as possible !!
                    </p>
                </div>
                <div class="d-flex justify-content-center">
                    <button
                        type="button"
                        class="btn green-btn w-25"
                        @click="showThankModal = false"
                    >
                        <span> OK </span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.green-btn:hover {
    background-color: #3eb3a3;
}

#question-container {
    border-radius: 12px;
    background: #f2edffcc;
}

#question-number-div {
    top: 6px;
    left: 3px;
    padding: 6px 18px;
    border-radius: 8px;
    border: 1px;
    gap: 12px;
    color: white;
    border: 1px solid#8f7bd6;
    box-shadow: 0px 1px 2px 0px #1018280d;
    background-color: #8f7bd6;
    font-family: 'Poppins', sans-serif;
    font-size: 20px;
    font-weight: 900;
    line-height: 28px;
    letter-spacing: 0em;
    text-align: left;
    height: fit-content;
}

#question-content {
    font-family: sans-serif;
    font-size: 17px;
    font-weight: 700;
    line-height: 28px;
    letter-spacing: 0em;
    text-align: left;
    color: #667085;
    margin-left: 15px;
}

.form-control:focus {
    border-color: white;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 12px #a48be6;
}

.modal-icon {
    width: 16px !important;
    height: 16px !important;
}

.answer-option {
    color: #667085;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
}

/* Dynamic class for the check box is hovered */
.checkbox-hovered {
    text-decoration: underline;
    color: #7f56d9;
}

/**-------------------------------------  */
/* A lot of CSS to styling two check box */
.control {
    font-family: 'Poppins' sans-serif;
    display: block;
    position: relative;
    padding-left: 30px;
    margin-bottom: 5px;
    padding-top: 3px;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 5px;
}

.control > span {
    font-weight: 500;
    font-size: 0.938rem;
    color: #667085;
    text-align: center;
}
.control input {
    position: absolute;
    z-index: -1;
    opacity: 0;
}
.control_indicator {
    position: absolute;
    left: 0;
    height: 29.09px;
    width: 29.09px;
    background: #f9f5ff;
    border: 2px solid #9c7eec;
    border-radius: 60px;
}
.control:hover input ~ .control_indicator,
.control input:focus ~ .control_indicator {
    background: #e7ddf6;
}

.plus-svg:hover {
    cursor: pointer;
}
.control input:checked ~ .control_indicator {
    background: #f9f5ff;
}
.control:hover input:not([disabled]):checked ~ .control_indicator,
.control input:checked:focus ~ .control_indicator {
    background: #f9f5ff;
}
.control input:disabled ~ .control_indicator {
    background: #e6e6e6;
    opacity: 0.6;
    pointer-events: none;
}
.control_indicator:after {
    box-sizing: unset;
    content: '';
    position: absolute;
    display: none;
}
.control input:checked ~ .control_indicator:after {
    display: block;
}
.control-checkbox .control_indicator:after {
    left: 4px;
    top: 5px;
    width: 13.58px;
    height: 9.33px;
    border: solid #9c7eec;
    border-width: 0px 0px 2.9px 2.9px;
    transform: rotate(-45deg);
}
.control-checkbox input:disabled ~ .control_indicator:after {
    border-color: #7b7b7b;
}
.control-checkbox .control_indicator::before {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 4.5rem;
    height: 4.5rem;
    margin-left: -1.3rem;
    margin-top: -1.3rem;
    background: #9c7eec;
    border-radius: 3rem;
    opacity: 0.6;
    z-index: 99999;
    transform: scale(0);
}

.control-checkbox input + .control_indicator::before {
    animation: s-ripple 250ms ease-out;
}
.control-checkbox input:checked + .control_indicator::before {
    animation-name: s-ripple-dup;
}
/* End of check box styling */

/* Button Styling */
.red-btn {
    background-color: #dd2822;
    color: white;
    border: 1px solid #7f56d9;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
}

.red-btn:hover {
    background-color: rgb(209, 96, 15);
}

.purple-btn {
    background-color: #a48be6;
    color: white;
    border: 1px solid #7f56d9;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
}

.flagging-icon:hover {
    scale: 1.2;
    cursor: pointer;
}

/* ------------------------------------------------------------- */

/* The Warning Modal */
.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 1;
    /* Sit on top */
    left: 0;
    top: 0;
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    overflow: auto;
    /* Enable scroll if needed */
    background-color: rgb(0, 0, 0);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
}

.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 600px;
    /* Could be more or less, depending on screen size */
}

.modal-content-flag {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 300px;
    /* Could be more or less, depending on screen size */
}
/* End of Modal Styling */

/******************************/
/* Mobile Styling */
@media (max-width: 480px) {
    .modal-content {
        margin-top: 80%;
        width: 90%;
    }

    .modal-content-flag {
        margin-top: 85%;
        width: 90%;
    }

    .flagging-icon {
        margin-right: 0px;
        margin-left: auto;
    }
}

/* ************************* */
/* Tablet Styling */
@media (min-width: 577px) and (max-width: 1023px) {
    .modal-content {
        margin-top: 60%;
        width: 70%;
    }

    .modal-content-flag {
        margin-top: 55%;
        width: 50%;
    }
}
</style>
