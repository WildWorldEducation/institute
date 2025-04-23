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
        searchResultNodes: null,
        // Store oldest nodes for filter manipulation
        oldestNodes: []
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
        // Helper function for build skill tree based on filter method
        findSkillBaseOnName(skillName, treeObject) {
            let childSkill = treeObject.map(e => e);
            let stopFlag = false;
            let result = null;

            while (!stopFlag) {
                let currentNode = childSkill.pop();
                if (currentNode) {
                    if (currentNode.skill_name === skillName) {
                        result = currentNode;
                        stopFlag = true
                    };
                    childSkill = childSkill.concat(currentNode.children)
                } else {
                    stopFlag = true
                }
            }
            return result
        },
        // Helper function for build skill tree based on filter method
        findSkillBaseOnId(id, treeObject) {
            try {
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
            } catch (error) {
                return null
            }
        },
        // Helper function for build skill tree based on filter method
        findSkillDataOfFilterObject(filterObject, userSkills) {
            let resultArray = [];
            for (let index = 0; index < filterObject.length; index++) {
                const element = filterObject[index];

                const nodeData = this.findSkillBaseOnName(element.skillName, userSkills);
                const object = { node: nodeData, isLeaf: element.isLeaf }
                if (object.node) {
                    resultArray.push(object);
                }
            }

            return resultArray
        },
        // Helper function for build skill tree based on filter method
        FindChildrenOfParent(nodeArrays, parentId) {
            // handle case the oldest node is the leaf node
            if (parentId === 0) {
                return {
                    leafNodeSiblings: [], nodeToFilter: []
                }
            }
            let resultArray = nodeArrays.filter(node => {
                return node.node.parent === parentId
            })
            // Beauty result for building the skill tree 
            // Normal result for filter out the node
            const beautyResult = resultArray.map(node => node.node);
            return { leafNodeSiblings: beautyResult, nodeToFilter: resultArray };
        },

        // BUILD A NEW USER SKILL BASED ON FILTER PATHS
        buildUserSkillTreeBaseOnFilterObject(filterObject, userSkills) {
            const localFilterObject = filterObject.map(e => e);
            let nodesNeededToBuildTree = this.findSkillDataOfFilterObject(localFilterObject, userSkills)
            if (!nodesNeededToBuildTree?.length) {
                return []
            }
            let leafNodes = nodesNeededToBuildTree.filter(node => node.isLeaf);

            let resultObject = null;
            let resultArray = [];
            let stopFlag = false
            while (!stopFlag) {
                const leafNode = leafNodes.pop();
                // also remove the node from array of node
                nodesNeededToBuildTree = nodesNeededToBuildTree.filter(node => node.node.id !== leafNode.node.id);
                const { leafNodeSiblings, nodeToFilter } = this.FindChildrenOfParent(nodesNeededToBuildTree, leafNode.node.parent, leafNodes, nodesNeededToBuildTree)

                // remove sibling node from the leaf nodes stack and node need to build tree stack
                leafNodes = leafNodes.filter(node => !nodeToFilter.includes(node));
                //nodesNeededToBuildTree = nodesNeededToBuildTree.filter(node => !nodeToFilter.includes(node))

                if (leafNode.node.parent !== 0) {
                    const parentNode = this.findSkillBaseOnId(leafNode.node.parent, userSkills);
                    // current node is not the oldest one
                    const childOfParent = [...leafNodeSiblings, leafNode.node]
                    const parentIndex = nodesNeededToBuildTree.findIndex(node => node.node.id === parentNode.id);
                    resultObject = { ...parentNode, children: childOfParent }
                    nodesNeededToBuildTree[parentIndex] = { node: resultObject, isLeaf: false };
                    // Also push the parent node back to leafs stack
                    leafNodes.push({ node: resultObject, isLeaf: true });
                } else {
                    // Mean we found the oldest node because 0 is an illegal id for skill 
                    resultObject = { ...leafNode.node }

                    resultArray.push(resultObject);

                }
                if (!leafNodes.length) {
                    stopFlag = true
                }
            }
            return resultArray
        },
        // ----------------------------------------------------------------------------------------------------------------------------------------------------------
        // Because the skill tree for no-account users uses a different object format for nodes, we had to rewrite the buildTree function to accommodate the change
        buildGuestUserSkillTreeBaseOnFilterObject(filterObject, userSkills) {

            const localFilterObject = filterObject.map(e => e);
            let nodesNeededToBuildTree = this.findSkillDataOfGuestFilterObject(localFilterObject, userSkills)
            if (!nodesNeededToBuildTree?.length) {
                return []
            }
            let leafNodes = nodesNeededToBuildTree.filter(node => node.isLeaf);

            let resultObject = null;
            let resultArray = [];
            let stopFlag = false
            while (!stopFlag) {
                const leafNode = leafNodes.pop();
                // also remove the node from array of node
                nodesNeededToBuildTree = nodesNeededToBuildTree.filter(node => node.node.id !== leafNode.node.id);
                const { leafNodeSiblings, nodeToFilter } = this.FindChildrenOfParent(nodesNeededToBuildTree, leafNode.node.parent, leafNodes, nodesNeededToBuildTree)

                // remove sibling node from the leaf nodes stack and node need to build tree stack
                leafNodes = leafNodes.filter(node => !nodeToFilter.includes(node));
                //nodesNeededToBuildTree = nodesNeededToBuildTree.filter(node => !nodeToFilter.includes(node))

                if (leafNode.node.parent !== 0) {
                    const parentNode = this.findSkillBaseOnId(leafNode.node.parent, userSkills);
                    // current node is not the oldest one
                    const childOfParent = [...leafNodeSiblings, leafNode.node]
                    const parentIndex = nodesNeededToBuildTree.findIndex(node => node.node.id === parentNode.id);
                    resultObject = { ...parentNode, children: childOfParent }
                    nodesNeededToBuildTree[parentIndex] = { node: resultObject, isLeaf: false };
                    // Also push the parent node back to leafs stack
                    leafNodes.push({ node: resultObject, isLeaf: true });
                } else {
                    // Mean we found the oldest node because 0 is an illegal id for skill 
                    resultObject = { ...leafNode.node }

                    resultArray.push(resultObject);

                }
                if (!leafNodes.length) {
                    stopFlag = true
                }
            }
            return resultArray
        },



        // Helper function for build skill tree based on filter method
        findGuestSkillBaseOnName(skillName, treeObject) {
            let childSkill = treeObject.map(e => e);
            let stopFlag = false;
            let result = null;

            while (!stopFlag) {
                let currentNode = childSkill.pop();
                if (currentNode) {
                    if (currentNode.name === skillName) {
                        result = currentNode;
                        stopFlag = true
                    };
                    childSkill = childSkill.concat(currentNode.children)
                } else {
                    stopFlag = true
                }
            }
            return result
        },

        // Helper function for build skill tree based on filter method
        findSkillDataOfGuestFilterObject(filterObject, userSkills) {
            let resultArray = [];
            for (let index = 0; index < filterObject.length; index++) {
                const element = filterObject[index];

                const nodeData = this.findGuestSkillBaseOnName(element.skillName, userSkills);
                const object = { node: nodeData, isLeaf: element.isLeaf }
                if (object.node) {
                    resultArray.push(object);
                }
            }

            return resultArray
        },
    }
});
