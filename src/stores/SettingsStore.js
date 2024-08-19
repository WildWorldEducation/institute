import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        skillDegradationDays: null,
        quizMaxQuestions: null,
        isManualEssayMarking: false,
        passMark: 80
    }),
    actions: {
        async getSettings() {
            const result = await fetch('/settings');
            const data = await result.json();
            this.skillDegradationDays = data[0].skill_degradation_days;
            this.quizMaxQuestions = data[0].quiz_max_questions;
            this.isManualEssayMarking = data[0].is_manual_essay_marking;
            this.passMark = data[0].pass_mark;
        }
    }
});
