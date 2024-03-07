import { defineStore } from 'pinia';

// Import another store.
import { useUserDetailsStore } from './UserDetailsStore.js';

export const useSkillTreeStore = defineStore('skillTree', {
    state: () => ({
        userSkills: [],
        userSkillsNoSubSkills: [],
        userSkillsSubSkillsSeparate: [],
        nestedSkillsListWithFilters: []
    }),
    actions: {
        async getUserSkills() {
            // API call for skill tree.
            const userDetailsStore = useUserDetailsStore();
            const userDetails = await userDetailsStore.getUserDetails();

            const result = await fetch('/user-skills/' + userDetails.userId);
            this.userSkills = await result.json();
        },
        async getUserSkillsNoSubSkills() {
            // API call for skill tree.
            const userDetailsStore = useUserDetailsStore();
            const userDetails = await userDetailsStore.getUserDetails();

            const result = await fetch(
                '/user-skills/no-sub-skills/' + userDetails.userId
            );
            this.userSkillsNoSubSkills = await result.json();
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
        async getUserSkillsListWithFilters() {
            const userDetailsStore = useUserDetailsStore();
            const userDetails = await userDetailsStore.getUserDetails();
            const result = await fetch(
                '/user-skills/filtered/' + userDetails.userId
            );
            const data = await result.json();
            this.nestedSkillsListWithFilters = data;
        }
    }
});
