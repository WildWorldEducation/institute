import { defineStore } from 'pinia';

// Import another store.
import { useUserDetailsStore } from './UserDetailsStore.js';

export const useSkillTreeStore = defineStore('skillTree', {
    state: () => ({
        userSkills: [],
        // For Full Vertical/Tidy Tree
        verticalTreeUserSkills: [],
        gradeSchoolVerticalTreeUserSkills: [],
        middleSchoolVerticalTreeUserSkills: [],
        highSchoolVerticalTreeUserSkills: [],
        collegeVerticalTreeUserSkills: [],
        // For My Vertical/Tidy Tree
        myVerticalTreeUserSkills: [],
        // --
        userSkillsNoSubSkills: [],
        // For Radial Tree
        userSkillsSubSkillsSeparate: [],
        studentSkills: [],
        // WE Save the node that can appear in result for later use
        searchResultNodes: null
    }),
    actions: {
        // API call for Collapsible Skill Tree.
        async getUserSkills() {
            const userDetailsStore = useUserDetailsStore();
            let level = userDetailsStore.gradeFilter;

            const result = await fetch(
                '/user-skills/filter-by-cohort/' +
                    userDetailsStore.userId +
                    '?level=' +
                    level
            );

            this.userSkills = await result.json();
        },
        // API call for Full Vertical skill tree.
        async getVerticalTreeUserSkills(level, subjects, isUnlockedOnly) {
            // To deal with the "&" sign in "Science & Invention".
            for (let i = 0; i < subjects.length; i++) {
                subjects[i] = subjects[i].replace(/&/g, '%26');
            }

            console.log(isUnlockedOnly);
            const userDetailsStore = useUserDetailsStore();

            const result = await fetch(
                '/user-skills/filter-by-cohort/full-vertical-tree/' +
                    userDetailsStore.userId +
                    '?level=' +
                    level +
                    '&subjects=' +
                    subjects +
                    '&isUnlockedOnly=' +
                    isUnlockedOnly
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
        // API call for Full Vertical skill tree.
        async getMyVerticalTreeUserSkills() {
            const userDetailsStore = useUserDetailsStore();
            const result = await fetch(
                '/user-skills/filter-by-cohort/my-vertical-tree/' +
                    userDetailsStore.userId
            );

            // Default is all levels.
            this.myVerticalTreeUserSkills = await result.json();
        },
        // API call for Radial skill tree.
        async getUserSkillsSubSkillsSeparate(level, subjects) {
            // To deal with the "&" sign in "Science & Invention".
            for (let i = 0; i < subjects.length; i++) {
                subjects[i] = subjects[i].replace(/&/g, '%26');
            }
            // API call for skill tree.
            const userDetailsStore = useUserDetailsStore();

            const result = await fetch(
                '/user-skills/separate-subskills/filter-by-cohort/' +
                    userDetailsStore.userId +
                    '?level=' +
                    level +
                    '&subjects=' +
                    subjects
            );
            this.userSkillsSubSkillsSeparate = await result.json();
        },
        async getStudentSkills(studentId) {
            // API call for skill tree.
            const result = await fetch(
                '/user-skills/filter-by-cohort/' + studentId
            );

            this.studentSkills = await result.json();
        },
        async findInStudentSkill(skillName) {
            const result = this.searchResultNodes.find(
                (result) => result.name === skillName
            );
            return result;
        },
        // Find the oldest ancestor of a node
        async findFatherSubject(node) {
            let parentId = node.parent;
            let parent = null;
            while (parentId !== 0) {
                parent = this.searchResultNodes.find(
                    (skill) => skill.id === parentId
                );
                parentId = parent.parent;
            }
            return parent;
        },

        convertNodesToArray(nodes) {
            let childNodes = nodes.children;
            let results = [];
            while (childNodes.length > 0) {
                let currentNode = childNodes.pop();
                results.push({ ...currentNode, name: currentNode.skill_name });
                if (currentNode.children.length > 0) {
                    childNodes = childNodes.concat(currentNode.children);
                }
            }
            return results;
        }
    }
});
