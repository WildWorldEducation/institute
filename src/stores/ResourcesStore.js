import { defineStore } from 'pinia';

export const useResourcesStore = defineStore('resources', {
    state: () => ({
        resourcesList: []
    }),
    actions: {
        async getResourcesList() {
            const result = await fetch('/resources/list');
            const data = await result.json();
            this.resourcesList = data;
        }
    }
});
