import { defineStore } from 'pinia';

export const useCohortsStore = defineStore('cohorts', {
    state: () => {
        return {
            cohorts: []
        };
    },
    actions: {
        async getCohorts() {
            const result = await fetch('/cohorts/list');
            const data = await result.json();
            this.cohorts = data;
            return this.$state;
        }
    }
});
