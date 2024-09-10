import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        skillDegradationDays: null,
        quizMaxQuestions: null,
        isManualEssayMarking: false,
        passMark: 80,
        todoSkillTableRows: 0,
        todoMcQuestionTableRows: 0,
        todoEssayQuestionTableRows: 0,
        todoImageQuestionTableRows: 0,
        todoContentFlagTableRows: 0,
    }),
    actions: {
        async getSettings() {
            const result = await fetch('/settings');
            const data = await result.json();
            this.skillDegradationDays = data[0].skill_degradation_days;
            this.quizMaxQuestions = data[0].quiz_max_questions;
            this.isManualEssayMarking = data[0].is_manual_essay_marking;
            this.passMark = data[0].pass_mark;
            this.todoSkillTableRows = data[0].todo_skill_table_rows;
            this.todoMcQuestionTableRows = data[0].todo_mc_question_table_rows;
            this.todoEssayQuestionTableRows = data[0].todo_essay_question_table_rows;
            this.todoContentFlagTableRows = data[0].todo_content_flag_table_rows;
        }
    }
});
