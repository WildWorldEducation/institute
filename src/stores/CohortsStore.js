import { defineStore } from 'pinia';

export const useCohortsStore = defineStore('cohorts', {
    state: () => {
        return {
            cohorts: [],
            cohortSkills: [],
            cohortFilteredSubjects: []
        };
    },
    actions: {
        async getCohorts(instructorId) {
            const result = await fetch('/cohorts/' + instructorId + '/list');
            const data = await result.json();
            this.cohorts = data;
            return this.$state;
        },
        // WHERE IS THIS USED? CAN IT BE DELETED?
        async getCohortSkillFilters(cohortId) {
            const result = await fetch(
                '/cohorts/' + cohortId + '/skill-filters'
            );
            this.cohortSkills = await result.json();
        },
        // To hide the relevant root subjects on the skill tree, if they have been filtered
        async getCohortFilteredSubjects(cohortId) {
            const result = await fetch(
                '/cohorts/' + cohortId + '/filteredSubjects'
            );
            this.cohortFilteredSubjects = await result.json();
        }
    }
});
