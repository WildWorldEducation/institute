import { defineStore } from 'pinia'

export const useAssessmentsStore = defineStore("assessments", {
    state: () => {
        return {
            assessments: []
        }
    },
    actions: {
        async getAssessments() {
            const result = await fetch('/assessments/list');
            const data = await result.json();
            console.log('call assessment store: ');
            console.log(data)

            this.assessments = data;
            return this.$state;
        },
        async deleteAssessment(id) {
            const result = await fetch('/assessments/' + id,
                {
                    method: 'DELETE',
                })

            if (result.error) {
                console.log(result.error)
            }
        }
    }
});