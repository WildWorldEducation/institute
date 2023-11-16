import { defineStore } from 'pinia'

export const useSkillTagsStore = defineStore("skillTags", {
    state: () => ({
        skillTagsList: []
    }),
    actions: {
        async getSkillTagsList() {
            const result = await fetch('/skill-tags/list');
            const data = await result.json();
            this.skillTagsList = data;
        },
    }
});