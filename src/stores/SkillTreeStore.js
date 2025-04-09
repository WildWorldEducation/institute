import { defineStore } from 'pinia';

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
        studentSkillTree: [],
        // WE Save the node that can appear in result for later use
        searchResultNodes: null
    }),
    actions: {
        // API call for Collapsible Skill Tree.
        async getUserSkills() {
            const userDetailsStore = useUserDetailsStore();

            const result = await fetch(
                '/user-skills/filter-by-cohort/' + userDetailsStore.userId
            );

            this.userSkills = await result.json();
        },
        // API call for Full skill tree.
        async getVerticalTreeUserSkills(level, subjects, isUnlockedOnly) {
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
        // API call for Custom skill tree.
        async getCustomLearningTrackSkills() {
            const userDetailsStore = useUserDetailsStore();
            const result = await fetch(
                '/user-skills/filter-by-cohort/custom-learning-track-skills/' +
                userDetailsStore.userId
            );
            return await result.json();
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
        // API call for student and instructor/student Collapsible Tree
        async getStudentSkills(studentId) {
            const result = await fetch(
                '/user-skills/filter-by-cohort/' + studentId
            );

            this.studentSkills = await result.json();
        },
        // API call for student tree that instructor uses to monitor progress.
        async getStudentSkillTree(studentId, level, subjects, isUnlockedOnly) {
            // API call for skill tree.
            const result = await fetch(
                '/user-skills/filter-by-cohort/instructor-student-vertical-tree/' +
                studentId +
                '?level=' +
                level +
                '&subjects=' +
                subjects +
                '&isUnlockedOnly=' +
                isUnlockedOnly
            );

            this.studentSkillTree = await result.json();
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
        },
        findSkillBaseOnName(skillName, treeObject) {
            let childSkill = treeObject.map(e => e);
            let stopFlag = false;
            let result = null;

            while (childSkill.length > 0 || !stopFlag) {
                let currentNode = childSkill.pop();
                if (currentNode.skill_name === skillName) {
                    result = currentNode;
                    stopFlag = true
                };
                childSkill = childSkill.concat(currentNode.children)
            }
            return result
        },

        findSkillBaseOnId(id, treeObject) {
            let childSkill = treeObject.map(e => e);
            let stopFlag = false;
            let result = null;
            while (childSkill.length > 0 || !stopFlag) {
                let currentNode = childSkill.pop();
                if (currentNode.id == id) {
                    result = currentNode;
                    stopFlag = true
                };
                childSkill = childSkill.concat(currentNode.children)
            }
            return result
        },

        findSkillDataOfFilterObject(filterObject, userSkills) {
            const baseSkillLists = userSkills;
            let newUserSkill = filterObject;
            let childNodes = newUserSkill;
            let stopFlag = false;
            const resultsArray = [];
            if (childNodes.length === 0) {
                return
            }
            while (!stopFlag) {
                let currentNode = childNodes.pop();
                if (currentNode.children) {
                    childNodes = childNodes.concat(currentNode.children)
                }
                const nodeData = this.findSkillBaseOnName(currentNode.skillName, baseSkillLists);
                const resultObject = {
                    node: nodeData,
                    // Leaf is the deepest node in a tree mean it will have no children
                    isLeaf: !currentNode.children
                }
                resultsArray.push(resultObject);
                if (!childNodes.length) {
                    stopFlag = true
                }
            }
            return resultsArray;
        },
        FindChildrenOfParent(nodeArrays, parentId) {
            const resultArray = nodeArrays.filter(node => {
                console.log('====')
                console.log(node.node.parent === parentId)
                console.log(typeof (node.node.parent))
                console.log(typeof (parentId))
                return node.node.parent === parentId
            })
            return resultArray
        },

        // BUILD A NEW USER SKILL BASED ON FILTER PATHS
        buildUserSkillTreeBaseOnFilterObject(filterObject, userSkills) {
            let nodesNeededToBuildTree = this.findSkillDataOfFilterObject(filterObject, userSkills)
            if (!nodesNeededToBuildTree?.length) {
                return
            }

            const leafNodes = nodesNeededToBuildTree.filter(node => node.isLeaf);
            let resultObject = null;
            // CONTINUE TO IMPLEMENT THIS
            let stopFlag = false
            while (!stopFlag) {
                const leafNode = leafNodes.pop();
                // also remove the node from array of node
                nodesNeededToBuildTree = nodesNeededToBuildTree.filter(node => node.node.id !== leafNode.node.id);
                const leafNodeSiblings = this.FindChildrenOfParent(nodesNeededToBuildTree, leafNode.node.parent)
                console.log('leaf node sibling: ')
                console.log(leafNodeSiblings);
                const parentNode = this.findSkillBaseOnId(leafNode.node.parent, userSkills);
                // CONTINUE DEVELOPMENT HERE
                if (!parentNode) {
                    stopFlag = true
                } else {
                    const childOfParent = [...leafNodeSiblings, leafNode.node]
                    resultObject = { ...parentNode, children: childOfParent }
                }
                if (!leafNodes.length) {
                    stopFlag = true
                }
            }
            console.log('Final result: ');
            console.log(resultObject);
            return [resultObject]
        }

    }
});
