<script>
// Import
import router from "../../router";
// Import the store.
import { useUserDetailsStore } from '../../stores/UserDetailsStore'
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useUserSkillsStore } from '../../stores/UserSkillsStore.js';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const skillsStore = useSkillsStore();
        const userSkillsStore = useUserSkillsStore();
        return {
            userDetailsStore, skillsStore, userSkillsStore
        }
    },
    data() {
        return {
            skillId: this.$route.params.id,
            mcQuestions: [],
            essayQuestions: [],
            questions: [],
            questionNumber: 0,
            // To wait for questions to be loaded, before the DOM renders.
            isFetching: true,
            score: 0,
            assessmentId: null,
            numMCQuestions: 0,
            numEssayQuestions: 0,
            totalNumOfQuestions: 0,
            isAllQuestionsAnswered: false
        };
    },
    async created() {
        // Get user skills, in case this is a sub skill. We have to check its siblings.
        if (this.userSkillsStore.unnestedList.length == 0) {
            await this.userSkillsStore.getUnnestedList(this.userDetailsStore.userId)
        }
        // Need to get the questions for the quiz, before the DOM renders.
        const fetchMCQuestions = async () => {
            await fetch('/questions/' + this.skillId + '/multiple-choice')
                .then(function (response) {
                    return response.json();
                }).then(data => this.mcQuestions = data)
                .then(() => {
                    // Add field to elements, for the user's answer and for the question type.
                    for (let i = 0; i < this.mcQuestions.length; i++) {
                        this.mcQuestions[i].userAnswer = null
                        this.mcQuestions[i].questionType = "mc"
                    }
                    // To allow the questions to render in the DOM.
                    this.isFetching = false;
                })
        }
        await fetchMCQuestions();

        const fetchEssayQuestions = async () => {
            await fetch('/questions/' + this.skillId + '/essay')
                .then(function (response) {
                    return response.json();
                }).then(data => this.essayQuestions = data)
                .then(() => {
                    // Add field to elements, for the user's answer.
                    for (let i = 0; i < this.essayQuestions.length; i++) {
                        this.essayQuestions[i].userAnswer = null
                        this.essayQuestions[i].questionType = "essay"
                    }
                    // To allow the questions to render in the DOM.
                    this.isFetching = false;
                })
        }
        await fetchEssayQuestions();

        this.questions = this.essayQuestions.concat(this.mcQuestions);
        // Shuffle array
        this.questions = this.questions.sort((a, b) => 0.5 - Math.random());

        // Calculate the total num of questions.
        // At the moment, each question is 1 mark, so we get the total score from this.
        this.totalNumOfQuestions = this.questions.length;

        // Load the skills if havent been yet.
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList()
        }
    },

    methods: {
        Next() {
            this.questionNumber++;
        },
        Previous() {
            this.questionNumber--;
        },
        Submit() {
            // Mark the MC questions (if there are any).
            for (let i = 0; i < this.questions.length; i++) {
                // Tally the score.
                if (this.questions[i].questionType == 'mc') {
                    this.numMCQuestions++

                    if (this.questions[i].userAnswer == this.questions[i].correct_answer) {
                        this.score++
                    }
                }
                else {
                    this.numEssayQuestions++
                }
            }

            // If there are no essay questions, requiring manual marking, mark the test now.
            if (this.essayQuestions.length == 0) {
                // Pass mark of 90%.
                if ((this.score / this.numMCQuestions.length) * 100 >= 90) {
                    // Make skill mastered for this student.
                    this.MakeMastered(this.skillId)
                    alert("Well done! You have now mastered this skill.")
                }
                else {
                    alert("You failed")
                }
            }
            else {
                // Deal with the essay questions.
                alert("There is at least one question that needs to be marked manually. Please check whether you passed later.")

                // create an unmarked assessment record
                const requestOptions = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(
                        {
                            totalScore: this.totalNumOfQuestions,
                            currentScore: this.score,
                            numUnmarkedQuestions: this.numEssayQuestions
                        })
                };
                var url = '/assessments/' + this.userDetailsStore.userId + "/" + this.skillId;
                fetch(url, requestOptions)
                    .then(function (response) {
                        return response.json()
                    })
                    // Retrieve the assessment id.
                    .then((data) => {
                        this.assessmentId = data.id
                        // Delete any existing questions in this assessment.
                        fetch('/unmarked-answers/delete/' + this.assessmentId,
                            {
                                method: 'DELETE',
                            })
                            .then(() => {
                                for (let i = 0; i < this.questions.length; i++) {
                                    if (this.questions[i].questionType == "essay") {
                                        // create unmarked essay question records for each one.                    
                                        const requestOptions = {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify(
                                                {
                                                    answer: this.questions[i].userAnswer,
                                                    questionId: this.questions[i].id,
                                                })
                                        };
                                        var url = '/unmarked-answers/add/' + this.assessmentId;
                                        fetch(url, requestOptions)
                                            .then(function (response) {
                                                // Return to tags list page.
                                                router.push({ name: "post-login" });
                                            });
                                    }
                                }
                            })
                    })
            }

            // Redirect the user.
            this.$router.push("/skill-tree");
        },
        MakeMastered(skillId) {
            var url = "/user-skills/mastered/" + this.userDetailsStore.userId + "/" + skillId;
            fetch(url)
                .then(() => {
                    let skill = {}
                    // Check if is a sub skill.                    
                    for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
                        if (this.skillsStore.skillsList[i].id == skillId) {
                            skill = this.skillsStore.skillsList[i]
                        }
                    }
                    if (skill.type != 'sub') {
                        // Get all the child skills, as have to make them unlocked.
                        const childSkills = []
                        for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
                            if (this.skillsStore.skillsList[i].parent == skillId) {
                                childSkills.push(this.skillsStore.skillsList[i])
                            }
                        }
                        let subSkills = []
                        // Make them accessible/unlocked if regular type skills.
                        for (let i = 0; i < childSkills.length; i++) {
                            if (childSkills[i].type == 'regular') {
                                this.MakeAccessible(childSkills[i].id)
                            }
                            // If super type skills, make their subskills accessible.
                            else if (childSkills[i].type == 'super') {
                                for (let j = 0; j < this.skillsStore.skillsList.length; j++) {
                                    if (this.skillsStore.skillsList[j].parent == childSkills[i].id
                                        && this.skillsStore.skillsList[j].type == 'sub') {
                                        subSkills.push(this.skillsStore.skillsList[j].id)
                                    }
                                }
                            }
                        }
                        for (let i = 0; i < subSkills.length; i++) {
                            this.MakeAccessible(subSkills[i])
                        }
                    }
                    else {
                        let siblingSkills = []
                        for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
                            if (this.skillsStore.skillsList[i].parent == skill.parent
                                && this.skillsStore.skillsList[i].id != skill.id) {
                                if (this.skillsStore.skillsList[i].type == 'sub') {
                                    siblingSkills.push(this.skillsStore.skillsList[i])
                                }
                            }
                        }

                        //Check if all the siblings are mastered.
                        let allMastered = true
                        for (let i = 0; i < this.userSkillsStore.unnestedList.length; i++) {
                            for (let j = 0; j < siblingSkills.length; j++) {
                                if (siblingSkills[j].id == this.userSkillsStore.unnestedList[i].id) {
                                    if (this.userSkillsStore.unnestedList[i].is_mastered != 1) {
                                        allMastered = false
                                    }
                                }
                            }
                        }

                        if (allMastered) {
                            this.MakeAccessible(skill.parent)
                        }
                    }
                });
        },
        MakeAccessible(skillId) {
            var url = "/user-skills/accessible/" + this.userDetailsStore.userId + "/" + skillId;
            fetch(url)
        },
        UserAnswer() {
            for (let i = 0; i < this.questions.length; i++) {
                if (this.questions[i].userAnswer == null) {
                    this.isAllQuestionsAnswered = false
                    return
                }
                else {
                    this.isAllQuestionsAnswered = true
                }
            }
        },
        TestPass() {
            this.MakeMastered(this.skillId)
        }
    }
}
</script>

<template>
    <div class="container mt-3">
        <button @click="TestPass()" class="btn green-btn me-2">Test Pass</button>
        <!-- To wait for questions to be loaded, before the DOM renders. -->
        <div v-if="!isFetching" class="row mt-3">
            <h2>Question {{ this.questionNumber + 1 }}</h2>
            <div class="mb-3">{{ this.questions[this.questionNumber].question }}</div>
            <div v-if="this.questions[this.questionNumber].questionType == 'mc'">
                <!-- Option 1. -->
                <div class="form-check">
                    <input @input="UserAnswer()" class="form-check-input" type="radio" value="1"
                        v-model="questions[this.questionNumber].userAnswer">
                    <label class="form-check-label">
                        {{
                            questions[this.questionNumber].answer_1 }}
                    </label>
                </div>
                <!-- Option 2. -->
                <div class="form-check">
                    <input @input="UserAnswer()" class="form-check-input" type="radio" value="2"
                        v-model="questions[this.questionNumber].userAnswer">
                    <label class="form-check-label">
                        {{
                            questions[this.questionNumber].answer_2 }}
                    </label>
                </div>
                <!-- Option 3. -->
                <div class="form-check">
                    <input @input="UserAnswer()" class="form-check-input" type="radio" value="3"
                        v-model="questions[this.questionNumber].userAnswer">
                    <label class="form-check-label">
                        {{
                            questions[this.questionNumber].answer_3 }}
                    </label>
                </div>
                <!-- Option 4. -->
                <div class="form-check">
                    <input @input="UserAnswer()" class="form-check-input" type="radio" value="4"
                        v-model="questions[this.questionNumber].userAnswer">
                    <label class="form-check-label">
                        {{
                            questions[this.questionNumber].answer_4 }}
                    </label>
                </div>
                <!-- Option 5. -->
                <div class="form-check">
                    <input @input="UserAnswer()" class="form-check-input" type="radio" value="5"
                        v-model="questions[this.questionNumber].userAnswer">
                    <label class="form-check-label">
                        {{
                            questions[this.questionNumber].answer_5 }}
                    </label>
                </div>
            </div>
            <div v-else-if="this.questions[this.questionNumber].questionType == 'essay'">
                <div class="form-group">
                    <textarea @input="UserAnswer()" class="form-control" v-model="questions[this.questionNumber].userAnswer"
                        rows="3"></textarea>
                </div>
            </div>
        </div>
        <div class="mt-3 mb-2 d-flex justify-content-end">
            <button v-if="this.questionNumber > 0" @click="Previous()" class="btn green-btn me-2">Previous</button>
            <button v-if="this.questionNumber != questions.length - 1" @click="Next()" class="btn green-btn">Next</button>
            <button disabled v-if="this.questionNumber == questions.length - 1 && !isAllQuestionsAnswered" @click="Submit()"
                class="btn green-btn">Submit</button>
            <button v-else-if="this.questionNumber == questions.length - 1 && isAllQuestionsAnswered" @click="Submit()"
                class="btn green-btn">Submit</button>
        </div>
    </div>
</template>

<style scoped>
.green-btn {
    background-color: #36C1AF;
    color: white;
    border: 1px solid #2CA695;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
}
</style>