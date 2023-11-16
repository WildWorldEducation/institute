import { defineStore } from 'pinia'

// Import another store.
import { useUserDetailsStore } from './UserDetailsStore.js'

export const useSkillTreeStore = defineStore("skillTree", {
    state: () => ({
        userSkills: []
    }),
    actions: {
        async getUserSkills() {
            // API call for skill tree.
            const userDetailsStore = useUserDetailsStore();
            const userDetails = await userDetailsStore.getUserDetails();

            const result = await fetch('/user-skills/' + userDetails.userId);
            this.userSkills = await result.json();
        },
    }
}); 