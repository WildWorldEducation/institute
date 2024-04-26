import { defineStore } from 'pinia';

export const useMCQuestionsStore = defineStore('mcQuestions', {
    state: () => ({
        mcQuestionsList: []
    }),
    actions: {
        async getMCQuestionsList() {
            const result = await fetch('/questions/mc/list');
            const data = await result.json();
            this.mcQuestionsList = data;
        }
    }
});
