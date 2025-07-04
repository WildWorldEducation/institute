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
            // Escape the question mark in the URL, if it is there
            const res = await fetch(
                '/skills/first/url/' + encodeURIComponent(url)
            );
            this.skill = await res.json();
        },
        async getSkillSecondPart(url) {
            // Escape the question mark in the URL, if it is there
            const res = await fetch(
                '/skills/second/url/' + encodeURIComponent(url)
            );
            const newSkillContent = await res.json();
            this.skill = { ...this.skill, ...newSkillContent };
        }
    }
});
