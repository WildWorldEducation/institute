import { defineStore } from 'pinia';

export const useSkillsStore = defineStore('skills', {
    state: () => ({
        nestedSkillsList: [],
        filteredNestedSkillsList: [],
        skillsList: []
    }),
    actions: {
        // For 'Admin' role
        async getNestedSkillsList() {
            const result = await fetch('/skills/nested-list');
            const data = await result.json();
            this.nestedSkillsList = data;
        },
        // For 'Instructor' role
        async getFilteredNestedSkillsList() {
            const result = await fetch('/skills/filtered-nested-list');
            const data = await result.json();
            this.filteredNestedSkillsList = data;
        },
        async getSkillsList() {
            const result = await fetch('/skills/list');
            const data = await result.json();
            this.skillsList = data;
        },
        async deleteSkill(id) {
            // Deal with all descendants ----------------
            function renderDescendantNodes(id, context) {
                // Check if any child skills. If so, delete them.
                for (let i = 0; i < context.skillsList.length; i++) {
                    if (context.skillsList[i].parent == id) {
                        let childId = context.skillsList[i].id;
                        // Remove direct children from the store.
                        context.nestedSkillsList =
                            context.nestedSkillsList.filter((s) => {
                                return s.childId !== childId;
                            });
                        // Remove direct children from the DB.
                        const result = fetch('/skills/' + childId, {
                            method: 'DELETE'
                        });
                        if (result.error) {
                            console.log(result.error);
                        }
                        // Run the above function again recursively.
                        renderDescendantNodes(childId, context);
                    }
                }
            }

            renderDescendantNodes(id, this);
            // ------------------------

            // Remove this skill from the store.
            this.nestedSkillsList = this.nestedSkillsList.filter((s) => {
                return s.id !== id;
            });
            // Remove this skill from the DB.
            const result = fetch('/skills/' + id, {
                method: 'DELETE'
            });
            if (result.error) {
                console.log(result.error);
            }

            // Update the store.
            this.getNestedSkillsList();
        },
        // for finding the path to a specific node in nested skill list
        // Implement of DFS algorithm for tree searching
        findPathInNestedSkillTree(name) {
            // the return array that contains path to desire node
            let path = [];
            // stop condition when the node is found
            let finish = false;
            // stack contain node that need to check. Initial data is child of root node
            let serveStack = [...this.nestedSkillsList];
            // stack contain node that we have visited
            let visited = [];
            while (!finish) {
                const currentNode = serveStack.pop();
                if (currentNode) {
                    // check if current node is already visited 
                    const visitedNode = visited.some(node => node.id === currentNode.id);

                    // skip the visited node
                    if (!visitedNode) {
                        // add current node children to serveStack
                        currentNode.children?.forEach(childNode => {
                            serveStack.push(childNode)
                        });
                        // also add the current node to visited node
                        visited.push(currentNode);
                        if (currentNode.name === name) {
                            // we find the path that lead to the found node
                            let parentId = currentNode.parent;
                            // add the node to the head of the array for easier read
                            path = [currentNode, ...path];
                            let pathNode = currentNode;
                            while (parentId !== 0) {
                                // Find parent in visit stack
                                pathNode = visited.find(node => node.id === pathNode.parent);
                                // add the node to the head of the array for easier read
                                path = [pathNode, ...path];
                                parentId = pathNode.parent
                            }
                            // stop the search loop
                            finish = true;
                        }
                    }
                } else {
                    // if the serve stack is empty that mean we search for the whole tree
                    finish = true;
                }
                if (serveStack.length === 0) {
                    finish
                }
            }

            return path;
        }
    }
});
