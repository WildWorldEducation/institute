import { defineStore } from 'pinia';

// Import another store.
import { useUserDetailsStore } from './UserDetailsStore.js';

export const useSkillTreeStore = defineStore('skillTree', {
    state: () => ({
        userSkills: [],
        // For Vertical Tree
        verticalTreeUserSkills: [],
        gradeSchoolVerticalTreeUserSkills: [],
        middleSchoolVerticalTreeUserSkills: [],
        highSchoolVerticalTreeUserSkills: [],
        collegeVerticalTreeUserSkills: [],
        // --
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
        async getVerticalTreeUserSkills(level, subjects) {
            console.log(subjects);
            
            //subject = subject.replace(/&/g, '%26');
            let subject = 'Life';
            const userDetailsStore = useUserDetailsStore();
            const userDetails = await userDetailsStore.getUserDetails();
            const result = await fetch(
                '/user-skills/filter-by-cohort/vertical-tree/' +
                    userDetails.userId +
                    '?level=' +
                    level +
                    '&subjects=' +
                    subjects
            );

            // If the student clicks a button on the grade level key,
            // this will truncate the tree to that level.
            if (level == 'grade_school') {
                this.gradeSchoolVerticalTreeUserSkills = await result.json();
            } else if (level == 'middle_school') {
                this.middleSchoolVerticalTreeUserSkills = await result.json();
            } else if (level == 'high_school') {
                this.highSchoolVerticalTreeUserSkills = await result.json();
            } else if (level == 'college') {
                this.collegeVerticalTreeUserSkills = await result.json();
            }
            // Default is all levels.
            else this.verticalTreeUserSkills = await result.json();
        },
        // API call for Radial skill tree.
        async getUserSkillsSubSkillsSeparate(level) {
            // API call for skill tree.
            const userDetailsStore = useUserDetailsStore();
            const userDetails = await userDetailsStore.getUserDetails();

            const result = await fetch(
                '/user-skills/separate-subskills/filter-by-cohort/' +
                    userDetails.userId +
                    '?level=' +
                    level
            );
            this.userSkillsSubSkillsSeparate = await result.json();
        },
        async getStudentSkills(studentId) {
            // API call for skill tree.
            const result = await fetch(
                '/user-skills/filter-by-cohort/' + studentId
            );
            this.studentSkills = await result.json();
        }
    }
});
