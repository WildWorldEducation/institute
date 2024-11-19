import { defineStore } from 'pinia';

// Import another store.
import { useUserDetailsStore } from './UserDetailsStore.js';

export const useSkillTreeStore = defineStore('skillTree', {
    state: () => ({
        userSkills: [],
        verticalTreeUserSkills: [],
        userSkillsNoSubSkills: [],
        userSkillsSubSkillsSeparate: [],
        studentSkills: []
    }),
    actions: {
        // API call for Collapsible Skill Tree.
        async getUserSkills() {
            const userDetailsStore = useUserDetailsStore();
            const userDetails = await userDetailsStore.getUserDetails();

            const result = await fetch(
                '/user-skills/filter-by-cohort/' + userDetails.userId
            );

            this.userSkills = await result.json();
        },
        // API call for Vertical skill tree.
        async getVerticalTreeUserSkills() {
            const userDetailsStore = useUserDetailsStore();
            const userDetails = await userDetailsStore.getUserDetails();
            const result = await fetch(
                '/user-skills/filter-by-cohort/vertical-tree/' +
                    userDetails.userId
            );

            this.verticalTreeUserSkills = await result.json();
        },
        // API call for Radial skill tree.
        async getUserSkillsSubSkillsSeparate() {
            // API call for skill tree.
            const userDetailsStore = useUserDetailsStore();
            const userDetails = await userDetailsStore.getUserDetails();

            const result = await fetch(
                '/user-skills/separate-subskills/filter-by-cohort/' +
                    userDetails.userId
            );
            this.userSkillsSubSkillsSeparate = await result.json();
        },
        async getStudentSkills(studentId) {
            // API call for skill tree.
            const result = await fetch('/user-skills/' + studentId);
            this.studentSkills = await result.json();
        },
        truncateVerticalTree(level) {
            console.log(level);
            console.log(this.verticalTreeUserSkills);

            // Need to go through nested list of user skills and
            // filter them by grade level.
            function truncateUserSkills(parentChildren) {
                var i = parentChildren.length;
                while (i--) {
                    count++;

                    if (typeof parentChildren[i] !== 'undefined') {
                        /*
                         * Run the above function again recursively.
                         */
                        if (
                            parentChildren[i].children &&
                            Array.isArray(parentChildren[i].children) &&
                            parentChildren[i].children.length > 0
                        )
                            truncateUserSkills(parentChildren[i].children);
                    }
                }
            }

            //truncateUserSkills(userSkills);
        }
    }
});
