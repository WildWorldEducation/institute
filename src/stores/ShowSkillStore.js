import { defineStore } from 'pinia';

export const useShowSkillStore = defineStore('showSkill', {
    state: () => ({
        skill: null,

    }),
    actions: {
        async findSkill(url) {
            const res = await fetch('/skills/url/' + url);
            this.skill = await res.json();
        }
    }
});
