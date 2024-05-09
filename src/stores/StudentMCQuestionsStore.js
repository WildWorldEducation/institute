import { defineStore } from 'pinia';

export const useStudentMCQuestionsStore = defineStore('student-mc-questions', {
    state: () => ({
        studentMCQuestions: []
    }),
    actions: {
        async getStudentMCQuestions() {
            const result = await fetch('/questions/student-mc-questions/list');
            const data = await result.json();
            this.studentMCQuestions = data;
        },
        async deleteStudentMCQuestion(id) {
            const result = fetch('/questions/student-mc-questions/' + id, {
                method: 'DELETE'
            });

            if (result.error) {
                console.log(result.error);
            }
        }
    }
});
