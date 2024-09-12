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
        todoStudentQuestionTableRows: 0,
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
            this.todoImageQuestionTableRows = data[0].todo_image_question_table_rows;
            this.todoContentFlagTableRows = data[0].todo_content_flag_table_rows;
            this.todoStudentQuestionTableRows = data[0].todo_student_question_table_rows;
        },

        async saveSettings() {
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(
                    {
                        skill_degradation_days: this.skillDegradationDays,
                        quiz_max_questions: this.quizMaxQuestions,
                        is_manual_essay_marking: this.isManualEssayMarking,
                        pass_mark: this.passMark,
                        todo_skill_table_rows: this.todoSkillTableRows,
                        todo_mc_question_table_rows: this.todoMcQuestionTableRows,
                        todo_essay_question_table_rows: this.todoEssayQuestionTableRows,
                        todo_image_question_table_rows: this.todoImageQuestionTableRows,
                        todo_content_flag_table_rows: this.todoContentFlagTableRows,
                        todo_student_question_table_rows: this.todoStudentQuestionTableRows,
                    }
                )
            };

            await fetch('/settings/edit', requestOptions)
        }
    }
});
