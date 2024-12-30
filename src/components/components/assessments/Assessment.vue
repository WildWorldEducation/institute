<script>
// Import the store.
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useSettingsStore } from '../../../stores/SettingsStore.js';
import { useSkillsStore } from '../../../stores/SkillsStore.js';
import { useAssessmentsStore } from '../../../stores/AssessmentsStore';
import { useUserSkillsStore } from '../../../stores/UserSkillsStore.js';
import { useSkillTreeStore } from '../../../stores/SkillTreeStore.js';
// Import custom component
import EssayAnswer from './EssayAnswer.vue';
import ImageAnswer from './ImageAnswer.vue';
import StudentAddMCQuestion from './StudentAddMCQuestion.vue';
import AssessmentResult from './AssessmentResult.vue';
import FlagModals from './../FlagModals.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const settingsStore = useSettingsStore();
        const skillsStore = useSkillsStore();
        const assessmentsStore = useAssessmentsStore();
        const userSkillsStore = useUserSkillsStore();
        const skillTreeStore = useSkillTreeStore();

        return {
            userDetailsStore,
            settingsStore,
            skillsStore,
            assessmentsStore,
            userSkillsStore,
            skillTreeStore
        };
    },
    data() {
        return {
            loading: true,
            skillId: this.$route.params.id,
            skill: {},
            mcQuestions: [],
            // list of mc question and user answer of that question
            mcQuestionsAnswer: [],
            essayQuestions: [],
            imageQuestions: [],
            questions: [],
            question: {},
            questionNumber: 0,
            score: 0,
            assessmentId: null,
            numMCQuestions: 0,
            numEssayQuestions: 0,
            numImageQuestions: 0,
            totalNumOfQuestions: 0,
            isAllQuestionsAnswered: false,
            waitForMarkModal: false,
            // the flag to determine whether the student update assessment
            oldAssessment: undefined,
            updatedAssessment: false,
            // flag relate variable
            showFlaggingModal: false,
            flagContentType: '',
            // flag to determine whether student pass the test
            isQuizPassed: false,
            // assign the initial index to infinity because index is number type
            answerHoveredIndex: Infinity,
            // _____ result relate variable _____
            showResult: false,
            assessmentStatus: '',
            haveEssayQuestion: false,
            finishTime: null,
            needToSelectInstructor: false,
            aiLoading: false,
            numOfImagesRequired: 1
        };
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

        // Check skill type.
        let skillType;
        for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
            if (this.skillsStore.skillsList[i].id == this.skillId) {
                skillType = this.skillsStore.skillsList[i].type;
                this.skill = this.skillsStore.skillsList[i];
            }
        }

        // check if student has an un-marked assessment for this skill
        this.oldAssessment = assessments.find((assessment) => {
            return (
                assessment.student_id === userDetails.userId &&
                assessment.skill_id === this.skill.id
            );
        });

        if (this.oldAssessment !== undefined) {
            // turn the flag for updated on
            this.updatedAssessment = true;
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
        ImageAnswer,
        StudentAddMCQuestion,
        AssessmentResult,
        FlagModals
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
                            option: this.mcQuestions[i].answer_1,
                            index: 1
                        });

                        answerOptions.push({
                            option: this.mcQuestions[i].answer_2,
                            index: 2
                        });

                        answerOptions.push({
                            option: this.mcQuestions[i].answer_3,
                            show: this.mcQuestions[i].show_answer_3,
                            index: 3
                        });

                        answerOptions.push({
                            option: this.mcQuestions[i].answer_4,
                            show: this.mcQuestions[i].show_answer_4,
                            index: 4
                        });

                        answerOptions.push({
                            option: this.mcQuestions[i].answer_5,
                            show: this.mcQuestions[i].show_answer_5,
                            index: 5
                        });

                        // Shuffle the questions if is_random.
                        if (this.mcQuestions[i].is_random) {
                            answerOptions = answerOptions.sort(
                                (a, b) => 0.5 - Math.random()
                            );
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
                    if (
                        data.length > 0 &&
                        !this.userDetailsStore.instructorId
                    ) {
                        if (this.settingsStore.isManualEssayMarking == 1)
                            this.needToSelectInstructor = true;
                    }
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

                    // // Shuffle array to create random set of questions for each user
                    // this.questions = this.questions.sort(
                    //     (a, b) => 0.5 - Math.random()
                    // );

                    // // Ensure that the number fo questions is at or below the setting.
                    // if (
                    //     this.questions.length >
                    //     this.settingsStore.quizMaxQuestions
                    // ) {
                    //     this.questions.length =
                    //         this.settingsStore.quizMaxQuestions;
                    // }

                    // // Set the first question in questions array for display
                    // this.question = this.questions[0];
                    // // Calculate the total num of questions.
                    // // At the moment, each question is 1 mark, so we get the total score from this.
                    // this.totalNumOfQuestions = this.questions.length;
                })
                .then(() => {
                    this.fetchImageQuestions(skillId);
                });
        },
        async fetchImageQuestions(skillId) {
            fetch('/questions/' + skillId + '/image')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    if (
                        data.length > 0 &&
                        !this.userDetailsStore.instructorId
                    ) {
                        if (this.settingsStore.isManualEssayMarking == 1)
                            this.needToSelectInstructor = true;
                    }
                    // Add the new questions to the existing questions.
                    this.imageQuestions = this.imageQuestions.concat(data);
                })
                .then(() => {
                    // Add field to elements, for the user's answer.
                    for (let i = 0; i < this.imageQuestions.length; i++) {
                        this.imageQuestions[i].userAnswer = null;
                        this.imageQuestions[i].questionType = 'image';
                    }
                })
                .then(() => {
                    this.questions = this.imageQuestions.concat(this.questions);

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

                    // Set number of images required for first question.
                    if (this.question.questionType == 'image') {
                        this.numOfImagesRequired =
                            this.question.num_images_required;
                    }
                    // Calculate the total num of questions.
                    // At the moment, each question is 1 mark, so we get the total score from this.
                    this.totalNumOfQuestions = this.questions.length;
                })
                .then(() => {
                    this.loading = false;
                });
        },
        Next() {
            // Handle essay answer
            if (this.questions[this.questionNumber].questionType == 'essay') {
                // Get the answer
                const answer = this.$refs.essayAnswer.getAnswer();
                // Store user answer in questions array before move to next questions
                this.questions[this.questionNumber].userAnswer = answer;
                // Clear the answer
                this.$refs.essayAnswer.clearAnswer();
            } else if (
                this.questions[this.questionNumber].questionType == 'image'
            ) {
                // Get the answer
                const answer = this.$refs.imageAnswer.getAnswer();
                // Store user answer in questions array before move to next questions
                this.questions[this.questionNumber].userAnswer = answer;
                // Clear the answer
                this.$refs.imageAnswer.clearAnswer();
            }
            // Get next question data
            this.questionNumber++;
            //  If the next question is essay question
            if (this.questions[this.questionNumber].questionType == 'essay') {
                // Set the next answer content if there are any
                if (this.questions[this.questionNumber].userAnswer) {
                    this.$refs.essayAnswer.setAnswer(
                        this.questions[this.questionNumber].userAnswer
                    );
                }
            } else if (
                this.questions[this.questionNumber].questionType == 'image'
            ) {
                // Set the next answer content if there are any
                if (this.questions[this.questionNumber].userAnswer) {
                    this.$refs.imageAnswer.setAnswer(
                        this.questions[this.questionNumber].userAnswer
                    );
                }
                // Set the number of images required.
                this.numOfImagesRequired =
                    this.questions[this.questionNumber].num_images_required;
            }
        },
        Previous() {
            if (this.questions[this.questionNumber].questionType == 'essay') {
                // Get the answer
                const answer = this.$refs.essayAnswer.getAnswer();
                // Store user answer in questions array before move to next questions
                this.questions[this.questionNumber].userAnswer = answer;
            } else if (
                this.questions[this.questionNumber].questionType == 'image'
            ) {
                // Get the answer
                const answer = this.$refs.imageAnswer.getAnswer();
                // Store user answer in questions array before move to next questions
                this.questions[this.questionNumber].userAnswer = answer;
            }
            this.questionNumber--;
            if (this.questions[this.questionNumber].questionType == 'essay') {
                // Set the answer to previous answer
                this.$refs.essayAnswer.setAnswer(
                    this.questions[this.questionNumber].userAnswer
                );
            } else if (
                this.questions[this.questionNumber].questionType == 'image'
            ) {
                // Set the answer to previous answer
                this.$refs.imageAnswer.setAnswer(
                    this.questions[this.questionNumber].userAnswer
                );
                // Set the number of images required.
                this.numOfImagesRequired =
                    this.questions[this.questionNumber].num_images_required;
            }
        },
        // Async because essay questions are marked on server.
        async Submit() {
            this.UserAnswer();
            if (!this.isAllQuestionsAnswered) {
                alert('Please answer all questions before submitting.');
                return;
            }
            // get the time when user submit the assessment result for result page
            this.finishTime = new Date();
            // if the last answer is also an essay question we handle it just like with the next and previous
            if (this.questions[this.questionNumber].questionType == 'essay') {
                // Get the answer
                let answer;
                answer = this.$refs.essayAnswer.getAnswer();
                // Store user answer in questions array before move to next questions
                this.questions[this.questionNumber].userAnswer = answer;
            } else if (
                this.questions[this.questionNumber].questionType == 'image'
            ) {
                // Get the answer
                let answer;
                answer = this.$refs.imageAnswer.getAnswer();
                // Store user answer in questions array before move to next questions
                this.questions[this.questionNumber].userAnswer = answer;
            }
            // Mark the MC questions (if there are any).
            for (let i = 0; i < this.questions.length; i++) {
                // Tally the score.
                if (this.questions[i].questionType == 'mc') {
                    this.numMCQuestions++;
                    if (
                        this.questions[i].userAnswer ==
                        this.questions[i].correct_answer
                    ) {
                        this.score++;
                    }
                } else if (this.questions[i].questionType == 'essay') {
                    this.numEssayQuestions++;
                } else {
                    this.numImageQuestions++;
                }
            }

            // If no essay questions, we return result.
            if (this.numEssayQuestions === 0 && this.numImageQuestions === 0) {
                // Pass mark from settings store.
                if (
                    (this.score / this.numMCQuestions) * 100 >=
                    this.settingsStore.passMark
                ) {
                    this.MakeMastered(this.skill);
                    this.isQuizPassed = true;
                    // show result page and hide assessment part
                    this.assessmentStatus = 'pass';
                    this.showResult = true;
                } else {
                    // show result page and hide assessment part
                    this.isQuizPassed = true;
                    this.assessmentStatus = 'fails';
                    this.showResult = true;
                }
            }

            // If there are essay or image questions.
            else {
                if (this.settingsStore.isManualEssayMarking == 1) {
                    // Deal with the essay questions.
                    let fetchMethod = 'POST';

                    if (this.oldAssessment !== undefined) {
                        fetchMethod = 'PUT';
                    }

                    let numUnmarkedQuestions =
                        this.numEssayQuestions + this.numImageQuestions;

                    // create an unmarked assessment record
                    const requestOptions = {
                        method: fetchMethod,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            totalScore: this.totalNumOfQuestions,
                            currentScore: this.score,
                            numUnmarkedQuestions: numUnmarkedQuestions
                        })
                    };
                    var url =
                        '/assessments/' +
                        this.userDetailsStore.userId +
                        '/' +
                        this.skillId;
                    /**
                     * we have the function below so we can access this key word in the promise
                     */
                    const turnOnModal = () => {
                        this.isQuizPassed = true;
                        this.showResult = true;
                        this.assessmentStatus =
                            'please wait for answers to be marked';
                    };

                    fetch(url, requestOptions)
                        .then(function (response) {
                            return response.json();
                        })
                        // Retrieve the assessment id.
                        .then((data) => {
                            this.assessmentId = data.id;
                            // Delete any existing questions in this assessment.
                            fetch(
                                '/unmarked-answers/delete/' + this.assessmentId,
                                {
                                    method: 'DELETE'
                                }
                            ).then(() => {
                                for (
                                    let i = 0;
                                    i < this.questions.length;
                                    i++
                                ) {
                                    if (
                                        this.questions[i].questionType ==
                                        'essay'
                                    ) {
                                        // create unmarked essay question records for each one.
                                        const requestOptions = {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type':
                                                    'application/json'
                                            },
                                            body: JSON.stringify({
                                                answer: this.questions[i]
                                                    .userAnswer,
                                                questionId: this.questions[i].id
                                            })
                                        };
                                        var url =
                                            '/unmarked-answers/add/essay/' +
                                            this.assessmentId;
                                        fetch(url, requestOptions).then(
                                            function (response) {
                                                turnOnModal();
                                            }
                                        );
                                    } else if (
                                        this.questions[i].questionType ==
                                        'image'
                                    ) {
                                        // create unmarked essay question records for each one.
                                        const requestOptions = {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type':
                                                    'application/json'
                                            },
                                            body: JSON.stringify({
                                                answer: this.questions[i]
                                                    .userAnswer,
                                                questionId: this.questions[i].id
                                            })
                                        };
                                        var url =
                                            '/unmarked-answers/add/image/' +
                                            this.assessmentId;
                                        fetch(url, requestOptions).then(
                                            function (response) {
                                                turnOnModal();
                                            }
                                        );
                                    }
                                }
                            });
                        });
                } else {
                    // Submit essay questions to AI for marking.
                    for (let i = 0; i < this.questions.length; i++) {
                        if (this.questions[i].questionType == 'essay') {
                            let question = this.questions[i].question;
                            let answer = this.questions[i].userAnswer;

                            await this.AIMarkEssayQuestion(question, answer, i);
                        } else if (this.questions[i].questionType == 'image') {
                            let question = this.questions[i].question;
                            let answer = this.questions[i].userAnswer;

                            await this.AIMarkImageQuestion(question, answer, i);
                        }
                    }
                    if (
                        (this.score / this.questions.length) * 100 >=
                        this.settingsStore.passMark
                    ) {
                        this.MakeMastered(this.skill);
                        this.isQuizPassed = true;
                        // show result page and hide assessment part
                        this.assessmentStatus = 'pass';
                        this.showResult = true;
                    } else {
                        // show result page and hide assessment part
                        this.isQuizPassed = true;
                        this.assessmentStatus = 'fails';
                        this.showResult = true;
                    }
                }
            }
        },
        async AIMarkEssayQuestion(question, answer, i) {
            this.aiLoading = true;
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: question,
                    answer: answer,
                    level: this.skill.level
                })
            };
            let url = '/questions/mark-essay-question';
            await fetch(url, requestOptions)
                .then(function (response) {
                    return response.json();
                })
                .then((result) => {
                    if (result.isCorrect == true) {
                        this.score++;
                        this.questions[i].isCorrect = true;
                    } else {
                        this.questions[i].explanation = result.explanation;
                        this.questions[i].isCorrect = false;
                    }
                })
                .finally(() => {
                    this.aiLoading = false;
                });
        },
        async AIMarkImageQuestion(question, answer, i) {
            this.aiLoading = true;
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: question,
                    answer: answer,
                    level: this.skill.level
                })
            };
            let url = '/questions/mark-image-question';
            await fetch(url, requestOptions)
                .then(function (response) {
                    return response.json();
                })
                .then((result) => {
                    if (result.isError == true) {
                        this.questions[i].isCorrect = false;
                        this.questions[i].explanation =
                            'There was an error grading this question. The file size(s) may be too big.';
                    } else if (result.isCorrect == true) {
                        this.score++;
                        this.questions[i].isCorrect = true;
                    } else {
                        this.questions[i].explanation = result.explanation;
                        this.questions[i].isCorrect = false;
                    }
                })
                .finally(() => {
                    this.aiLoading = false;
                });
        },
        UserAnswer() {
            for (let i = 0; i < this.questions.length; i++) {
                if (
                    this.questions[i].userAnswer == null ||
                    this.questions[i].userAnswer === ''
                ) {
                    this.isAllQuestionsAnswered = false;
                    return;
                } else {
                    this.isAllQuestionsAnswered = true;
                }
            }
        },
        // For development purposes. We will disable master feature
        TestPass() {
            // this.MakeMastered(this.skill);
            this.isQuizPassed = true;
        },
        handleClickFlagIcon() {
            // because we have difference name use in content-flag table
            switch (this.questions[this.questionNumber].questionType) {
                case 'mc':
                    this.flagContentType = 'mc_question';
                    break;
                case 'essay':
                    this.flagContentType = 'essay_question';
                    break;
                case 'image':
                    this.flagContentType = 'image_question';
                    break;
                default:
                    break;
            }

            this.showFlaggingModal = true;
        },
        async MakeMastered(skill) {
            await this.userSkillsStore.MakeMastered(
                this.userDetailsStore.userId,
                skill
            );
            // Reload the skills list for the student.
            await this.skillTreeStore.getUserSkills();
        }
    }
};
</script>

<template>
    <!-- <button v-if="!isQuizPassed" @click="TestPass()" class="btn green-btn me-2">
        Test Pass
    </button> -->

    <!-- Loading screen -->
    <div class="secondary-text" v-if="loading == true">Loading...</div>

    <!-- AI Essay Marking Loading Animation -->
    <div
        v-if="aiLoading"
        class="loading-animation d-flex justify-content-center align-items-center py-4"
    >
        <span class="loader"></span>
    </div>

    <!-- Assessment -->
    <div
        v-if="
            loading == false &&
            isQuizPassed == false &&
            !needToSelectInstructor &&
            !aiLoading
        "
    >
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
                            @click="updatedAssessment = false"
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Questions -->
        <div class="pb-2 pb-md-0">
            <div
                v-if="questions.length > 0"
                class="container mt-2 mb-3 p-3 pt-2 mb-3"
                id="question-container"
            >
                <!-- To wait for questions to be loaded, before the DOM renders. -->
                <div v-for="(question, questionNum) in questions" class="row">
                    <div v-if="questionNum == questionNumber">
                        <div
                            class="col d-flex my-2 gap-2 justify-content-between flex-column flex-md-row"
                        >
                            <!-- Question number and question -->
                            <div class="d-flex align-items-lg-center">
                                <div id="question-number-div">
                                    {{ questionNum + 1 }}
                                </div>

                                <div id="question-content">
                                    {{ question.question }}
                                </div>
                            </div>
                            <div class="d-flex justify-content-end">
                                <!-- Author Icon -->
                                <div
                                    v-if="question.is_human_edited"
                                    b-tooltip.hover
                                    title="This question was written or edited by a human"
                                    class="author-icon me-4"
                                    style="height: 50px"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 320 512"
                                        height="22"
                                        style="opacity: 0.5"
                                        class="primary-icon"
                                    >
                                        <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                                        <path
                                            d="M112 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm40 304l0 128c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-223.1L59.4 304.5c-9.1 15.1-28.8 20-43.9 10.9s-20-28.8-10.9-43.9l58.3-97c17.4-28.9 48.6-46.6 82.3-46.6l29.7 0c33.7 0 64.9 17.7 82.3 46.6l58.3 97c9.1 15.1 4.2 34.8-10.9 43.9s-34.8 4.2-43.9-10.9L232 256.9 232 480c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-128-16 0z"
                                        />
                                    </svg>
                                </div>
                                <div
                                    v-else
                                    b-tooltip.hover
                                    title="This question was written by an AI"
                                    class="author-icon me-4"
                                    style="height: 50px"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 640 512"
                                        height="22"
                                        style="opacity: 0.5"
                                        class="primary-icon"
                                    >
                                        <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                                        <path
                                            d="M320 0c17.7 0 32 14.3 32 32l0 64 120 0c39.8 0 72 32.2 72 72l0 272c0 39.8-32.2 72-72 72l-304 0c-39.8 0-72-32.2-72-72l0-272c0-39.8 32.2-72 72-72l120 0 0-64c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224l16 0 0 192-16 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-16 0 0-192 16 0z"
                                        />
                                    </svg>
                                </div>
                                <!-- Flag Icon -->
                                <div
                                    b-tooltip.hover
                                    title="Flag this question for review"
                                    @click="handleClickFlagIcon"
                                    class="flagging-icon"
                                    style="height: 50px"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 448 512"
                                        style="height: 22px; opacity: 0.5"
                                        class="primary-icon"
                                    >
                                        <path
                                            d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32V64 368 480c0 17.7 14.3 32 32 32s32-14.3 32-32V352l64.3-16.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30V66.1c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L64 48V32z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <!-- Multiple Choice Question Answer Options-->
                        <div v-if="question.questionType == 'mc'">
                            <!-- Allow for different number of answer options -->
                            <div
                                v-for="answerOption in question.answerOptions"
                                v-show="
                                    answerOption.index <= 2 ||
                                    answerOption.show == 1
                                "
                                class="form-check my-3"
                            >
                                <label class="control control-checkbox">
                                    <div
                                        :class="
                                            answerHoveredIndex ==
                                            answerOption.index
                                                ? 'my-auto mx-2 me-4 answer-option checkbox-hovered'
                                                : 'my-auto mx-2 me-4 answer-option'
                                        "
                                    >
                                        {{ answerOption.option }}
                                    </div>
                                    <input
                                        type="radio"
                                        :name="questionNum + 'answer'"
                                        :value="answerOption.index"
                                        v-model="
                                            questions[questionNum].userAnswer
                                        "
                                    />
                                    <div
                                        class="control_indicator"
                                        @mouseover="
                                            answerHoveredIndex =
                                                answerOption.index
                                        "
                                        @mouseleave="
                                            answerHoveredIndex = Infinity
                                        "
                                    ></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Essay Question Answer Section -->
                <div
                    :class="`${
                        questions[questionNumber].questionType == 'essay'
                            ? 'd-block'
                            : 'd-none'
                    }`"
                >
                    <div class="form-group">
                        <EssayAnswer ref="essayAnswer" />
                    </div>
                </div>
                <!-- Image Question Answer Section -->
                <div
                    :class="`${
                        questions[questionNumber].questionType == 'image'
                            ? 'd-block'
                            : 'd-none'
                    }`"
                >
                    <div class="form-group">
                        <ImageAnswer
                            :numImagesRequired="numOfImagesRequired"
                            ref="imageAnswer"
                        />
                    </div>
                </div>

                <!-- Quiz Navigation Buttons -->
                <div class="mt-3 d-flex justify-content-end">
                    <button
                        v-if="questionNumber > 0"
                        @click="Previous()"
                        class="btn primary-btn me-2"
                    >
                        Previous
                    </button>
                    <button
                        v-if="questionNumber < questions.length - 1"
                        @click="Next()"
                        class="btn green-btn"
                    >
                        Next
                    </button>
                    <button
                        v-if="questionNumber >= questions.length - 1"
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

    <!------- Assessment Result Page ------>
    <AssessmentResult
        :skill="skill"
        :isManualEssayMarking="settingsStore.isManualEssayMarking"
        v-if="showResult"
    />
    <!--------------- Modals -------------->
    <!-- The flagging Modal -->
    <FlagModals
        v-if="showFlaggingModal"
        :userId="userDetailsStore.userId"
        :contentId="questions[questionNumber].id"
        :contentType="flagContentType"
    />
    <div v-if="needToSelectInstructor" class="modal">
        <!-- Modal content -->
        <div class="modal-content">
            <div class="">
                <p class="text-center">
                    Please choose an instructor before taking these quizzes.
                </p>
            </div>
            <div
                class="d-flex flex-column-reverse flex-md-row justify-content-center gap-2"
            >
                <RouterLink
                    :to="`/skills/${skillId}`"
                    type="button"
                    class="btn green-btn w-100 w-md-50"
                >
                    <span>Back</span>
                </RouterLink>
                <RouterLink
                    to="/profile/edit"
                    type="button"
                    class="btn green-btn w-100 w-md-50"
                >
                    <span>Select Instructor</span>
                </RouterLink>
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
    background: #f2edff;
}

#question-number-div {
    top: 6px;
    left: 3px;
    padding: 6px 18px;
    border-radius: 8px;
    border: 1px;
    gap: 12px;
    color: white;
    border: 1px solidvar(--primary-color);
    box-shadow: 0px 1px 2px 0px #1018280d;
    background-color: var(--primary-color);
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
    color: var(--regular-text-colour);
    margin-left: 15px;
}

.form-control:focus {
    border-color: white;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
        0 0 12px var(--primary-color);
}

.modal-icon {
    width: 16px !important;
    height: 16px !important;
}

.answer-option {
    color: black;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
}

.answer-option:hover {
    color: var(--primary-color);
    text-decoration: underline;
}

/* Dynamic class for the check box is hovered */
.checkbox-hovered {
    text-decoration: underline;
    color: var(--primary-color);
}

/**-------------------------------------  */
/* A lot of CSS to styling check box */
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
    border: 2px solid var(--primary-color);
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
    border: solid var(--primary-color);
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
    background: var(--primary-color);
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

.flagging-icon:hover {
    scale: 1.2;
    cursor: pointer;
}

.author-icon:hover {
    scale: 1.2;
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

.loader {
    width: 48px;
    height: 48px;
    border: 5px solid var(--primary-color);
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}
@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
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
