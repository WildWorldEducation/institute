import { defineStore } from 'pinia';

export const useUserSkillsStore = defineStore('userSkills', {
    state: () => ({
        unnestedList: [],
        filteredUnnestedList: [],
        masteredSkills: []
    }),
    actions: {
        async getUnnestedList(userId) {
            const result = await fetch('/user-skills/unnested-list/' + userId);
            this.unnestedList = await result.json();
        },
        async getFilteredUnnestedList(userId) {
            const result = await fetch(
                '/user-skills/filtered-unnested-list/' + userId
            );
            this.filteredUnnestedList = await result.json();
        },
        async MakeMastered(userId, skill) {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    skill: skill
                })
            };
            let url = '/user-skills/make-mastered/' + userId;
            await fetch(url, requestOptions);
        },
        async MakeAccessible(userId, skillId) {
            var url = '/user-skills/accessible/' + userId + '/' + skillId;
            fetch(url);

            // Update user skills if havent been yet.
            await this.getUnnestedList(userId);
        },
        async recordAssessmentAttempt(userId, skillId) {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    skillId: skillId
                })
            };
            let url = '/user-skills/record-assessment-attempt/' + userId;
            await fetch(url, requestOptions);
        },
        async getMasteredSkills(userId) {
            const result = await fetch(
                '/student-analytics/mastered-skills/' + userId
            );
            this.masteredSkills = await result.json();
        }
    }
});
