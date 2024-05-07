import { defineStore } from 'pinia';

export const useEssayQuestionsStore = defineStore('essayQuestions', {
    state: () => ({
        essayQuestionsList: []
    }),
    actions: {
        async getEssayQuestionsList() {
            const result = await fetch('/questions/essay/list');
            const data = await result.json();
            this.essayQuestionsList = data;
        }
    }
});
