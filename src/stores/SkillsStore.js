import { defineStore } from 'pinia';
// Import another store.
import { useUserDetailsStore } from './UserDetailsStore.js';

export const useSkillsStore = defineStore('skills', {
    state: () => ({
        nestedSkillsList: [],
        filteredNestedSkillsList: [],
        skillsList: [],
        findNodeLoading: false
    }),
    actions: {
        // For 'Admin' role
        async getNestedSkillsList() {
            const result = await fetch('/skills/nested-list');
            const data = await result.json();
            this.nestedSkillsList = data;
        },
        // For 'Instructor' role of Collapsible Tree/ For guest mode of Vertical Tree
        async getFilteredNestedSkillsList() {
            // API call for skill tree.
            const userDetailsStore = useUserDetailsStore();
            let level = userDetailsStore.gradeFilter;

            const result = await fetch(
                '/skills/filtered-nested-list?level=' + level
            );
            const data = await result.json();

            // Default is all levels.
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
        async findSkillById(id) {
            if (this.skillsList.length < 1) {
                await this.getSkillsList();
            }
            const skill = this.skillsList.find((element) => {
                return element.id === id;
            });
            return skill;
        },

        async findSkill(url) {
            if (this.skillsList.length < 1) {
                await this.getSkillsList();
            }
            const skill = this.skillsList.find((element) => {
                return element.url === url;
            });
            return skill;
        },

        async findSkillWithName(name) {
            if (this.skillsList.length < 1) {
                await this.getSkillsList();
            }
            const skill = this.skillsList.find((element) => {
                return element.name === name;
            });
            return skill;
        },

        async getNameList() {
            if (this.skillsList.length < 1) {
                await this.getSkillsList();
            }
            const nameList = this.skillsList.map((skill) => {
                return { name: skill.name };
            });
            return nameList;
        }
    }
});
