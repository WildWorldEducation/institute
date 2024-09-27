import { defineStore } from 'pinia';

// Import another store.
import { useUserDetailsStore } from './UserDetailsStore.js';

export const useSkillTreeStore = defineStore('skillTree', {
    state: () => ({
        userSkills: [],
        userSkillsNoSubSkills: [],
        userSkillsSubSkillsSeparate: [],
        studentSkills: []
    }),
    actions: {
        async getUserSkills() {
            // API call for skill tree.
            const userDetailsStore = useUserDetailsStore();
            const userDetails = await userDetailsStore.getUserDetails();

            const result = await fetch(
                '/user-skills/filter-by-cohort/' + userDetails.userId
            );

            this.userSkills = await result.json();
        },
        async getUserSkillsSubSkillsSeparate() {
            // API call for skill tree.
            const userDetailsStore = useUserDetailsStore();
            const userDetails = await userDetailsStore.getUserDetails();

            const result = await fetch(
                '/user-skills/separate-subskills/' + userDetails.userId
            );
            this.userSkillsSubSkillsSeparate = await result.json();
        },
        async getStudentSkills(studentId) {
            // API call for skill tree.
            const result = await fetch('/user-skills/' + studentId);
            this.studentSkills = await result.json();
        }
    }
});
