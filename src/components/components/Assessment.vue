<script>
// Import
import router from '../../router';
// Import the store.
import { useUserDetailsStore } from '../../stores/UserDetailsStore';
import { useUserSkillsStore } from '../../stores/UserSkillsStore.js';
import { useSettingsStore } from '../../stores/SettingsStore.js';
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { subset } from 'd3';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const userSkillsStore = useUserSkillsStore();
        const settingsStore = useSettingsStore();
        const skillsStore = useSkillsStore();

        return {
            userDetailsStore,
            userSkillsStore,
            settingsStore,
            skillsStore
        };
    },
    data() {
        return {
            skillId: this.$route.params.id,
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
            isAllQuestionsAnswered: false
        };
    },
    async created() {
        // Load the max quiz question number setting.
        if (this.settingsStore.quizMaxQuestions == null) {
            await this.settingsStore.getSettings();
        }

        // Check skill type.
        let skillType;
        for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
            if (this.skillsStore.skillsList[i].id == this.skillId) {
                skillType = this.skillsStore.skillsList[i].type;
            }
        }
        // Get user skills, in case this is a sub skill. We have to check its siblings.
        // Need to get the questions for the quiz, before the DOM renders.
        if (skillType != 'super') {
            await this.fetchMCQuestions(this.skillId);
            await this.fetchEssayQuestions(this.skillId);
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
                await this.fetchEssayQuestions(subSkills[i].id);
            }
        }
    },
    methods: {
        fetchMCQuestions(skillId) {
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
                        this.mcQuestions[i].answerOptions = answerOptions;
                    }
                });
        },
        fetchEssayQuestions(skillId) {
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
                    console.log('question is: ');
                    console.log(this.question);

                    // Calculate the total num of questions.
                    // At the moment, each question is 1 mark, so we get the total score from this.
                    this.totalNumOfQuestions = this.questions.length;
                });
        },
        Next() {
            this.questionNumber++;
            this.question = this.questions[this.questionNumber];
        },
        Previous() {
            this.questionNumber--;
            this.question = this.questions[this.questionNumber];
        },
        Submit() {
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

            // If there are no essay questions, requiring manual marking, mark the test now.
            if (this.essayQuestions.length == 0) {
                // Pass mark of 90%.
                if ((this.score / this.numMCQuestions) * 100 >= 90) {
                    // Make skill mastered for this student.
                    this.MakeMastered(this.skillId);
                    alert('Well done! You have now mastered this skill.');
                } else {
                    alert('You failed');
                }
            } else {
                // Deal with the essay questions.
                alert(
                    'There is at least one question that needs to be marked manually. Please check whether you passed later.'
                );

                // create an unmarked assessment record
                const requestOptions = {
                    method: 'POST',
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
                                        // Return to tags list page.
                                        router.push({ name: 'post-login' });
                                    });
                                }
                            }
                        });
                    });
            }

            // Redirect the user.
            this.$router.push('/skills/' + this.skillId);
        },
        async MakeMastered(skillId) {
            await this.userSkillsStore.MakeMastered(
                this.userDetailsStore.userId,
                skillId
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
            this.MakeMastered(this.skillId);
        }
    }
};
</script>

<template>
    <!--<button @click="TestPass()" class="btn green-btn me-2">Test Pass</button> -->
    <div
        v-if="this.questions.length > 0"
        class="container mt-5 mb-3 p-3"
        id="question-container"
    >
        <!-- To wait for questions to be loaded, before the DOM renders. -->
        <div class="row mt-3">
            <div class="col d-flex my-2 gap-2 align-items-lg-center">
                <div id="question-number-div">
                    {{ this.questionNumber + 1 }}
                </div>
                <div id="question-content">
                    {{ question.question }}
                </div>
            </div>
            <div v-if="this.question.questionType == 'mc'">
                <!-- Option 1. -->
                <div
                    v-for="(answerOption, index) in this.question.answerOptions"
                    class="form-check"
                >
                    <input
                        @input="UserAnswer()"
                        class="form-check-input"
                        type="radio"
                        :value="answerOption.index"
                        v-model="questions[this.questionNumber].userAnswer"
                    />
                    <label class="form-check-label">
                        {{ answerOption.option }}
                    </label>
                </div>
            </div>
            <div v-else-if="this.question.questionType == 'essay'">
                <div class="form-group">
                    <textarea
                        @input="UserAnswer()"
                        class="form-control"
                        v-model="questions[this.questionNumber].userAnswer"
                        rows="3"
                    ></textarea>
                </div>
            </div>
        </div>

        <div class="mt-3 d-flex justify-content-end">
            <button
                v-if="this.questionNumber > 0"
                @click="Previous()"
                class="btn green-btn me-2"
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
    <div v-else>
        There is no quiz for this skill yet. Please check again soon.
    </div>
</template>

<style scoped>
.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
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
    font-family: 'Poppins' sans-serif;
    font-size: 20px;
    font-weight: 900;
    line-height: 28px;
    letter-spacing: 0em;
    text-align: left;
}

#question-content {
    font-family: 'Poppins' sans-serif;
    font-size: 17px;
    font-weight: 700;
    line-height: 28px;
    letter-spacing: 0em;
    text-align: left;
    color: #667085;
}

.form-control:focus {
    border-color: white;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 12px #a48be6;
}
</style>
