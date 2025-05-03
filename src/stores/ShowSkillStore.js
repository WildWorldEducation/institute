import { defineStore } from 'pinia';

export const useShowSkillStore = defineStore('showSkill', {
    state: () => ({
        skill: null
    }),
    actions: {
        async findSkill(url) {
            const res = await fetch('/skills/url/' + url);
            this.skill = await res.json();
        },
        async getSkillFirstPart(url) {
            const res = await fetch('/skills/first/url/' + url);
            this.skill = await res.json();
        },
        async getSkillSecondPart(url) {
            const res = await fetch('/skills/second/url/' + url);
            const newSkillContent = await res.json();
            this.skill = { ...this.skill, ...newSkillContent };
        }
    }
});
