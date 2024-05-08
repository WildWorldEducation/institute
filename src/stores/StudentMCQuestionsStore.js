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
        }
        // async deleteUser(id) {
        //     this.users = this.users.filter((u) => {
        //         return u.id !== id;
        //     });

        //     const result = fetch('/users/' + id, {
        //         method: 'DELETE'
        //     });

        //     if (result.error) {
        //         console.log(result.error);
        //     }
        // }
    }
});
