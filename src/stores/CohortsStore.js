import { defineStore } from 'pinia';

export const useCohortsStore = defineStore('cohorts', {
    state: () => {
        return {
            cohorts: [],
            cohortSkills: []
        };
    },
    actions: {
        async getCohorts(instructorId) {
            const result = await fetch('/cohorts/' + instructorId + '/list');
            const data = await result.json();
            this.cohorts = data;
            return this.$state;
        },
        async getCohortSkillFilters(cohortId) {
            const result = await fetch(
                '/cohorts/' + cohortId + '/skill-filters'
            );
            this.cohortSkills = await result.json();
        }
    }
});
