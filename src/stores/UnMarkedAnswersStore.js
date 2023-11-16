import { defineStore } from 'pinia'

// Import another store.
import { useAssessmentsStore } from './AssessmentsStore.js'

export const useUnmarkedAnswersStore = defineStore("unmarkedAnswers", {
    state: () => {
        return {
            unmarkedAnswers: []
        }
    },
    actions: {
        async getUnmarkedAnswers() {
            // Get all unmarked answers.
            const result = await fetch('/unmarked-answers/list');
            const answers = await result.json();

            // Get all questions.
            const result2 = await fetch('/questions/essay/list');
            const questions = await result2.json();

            // Add the question.
            for (let i = 0; i < answers.length; i++) {
                for (let j = 0; j < questions.length; j++) {
                    if (answers[i].question_id == questions[j].id) {
                        answers[i].question = questions[j].question
                    }
                }
            }

            // Get all assessments.
            const result3 = await fetch('/assessments/list');
            const assessments = await result3.json();

            // Add the assessment details.
            for (let i = 0; i < answers.length; i++) {
                for (let j = 0; j < assessments.length; j++) {
                    if (answers[i].assessment_id == assessments[j].id) {
                        answers[i].studentId = assessments[j].student_id
                        answers[i].skillId = assessments[j].skill_id
                    }
                }
            }

            this.unmarkedAnswers = answers;

            return this.$state;
        },
        async deleteUnmarkedAnswer(answer) {
            const result = await fetch('/unmarked-answers/' + answer.id,
                {
                    method: 'DELETE',
                })

            // Get number of unmarked answers remaining in the assessment this answer was in.
            const result2 = await fetch('/unmarked-answers/list/' + answer.assessment_id);
            const numOfUnmarkedAnswersInAssessment = await result2.json();

            if (numOfUnmarkedAnswersInAssessment == 0) {
                // Delete the assessment.
                const assessmentsStore = useAssessmentsStore();
                assessmentsStore.deleteAssessment(answer.assessment_id)
            }

            if (result.error) {
                console.log(result.error)
            }

            this.getUnmarkedAnswers();
        }
    }
});