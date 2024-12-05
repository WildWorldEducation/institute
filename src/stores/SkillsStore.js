import { defineStore } from 'pinia';

export const useSkillsStore = defineStore('skills', {
    state: () => ({
        nestedSkillsList: [],
        filteredNestedSkillsList: [],
        // -- for grade level filter on Vertical Tree
        gradeSchoolFilteredNestedSkillsList: [],
        middleSchoolFilteredNestedSkillsList: [],
        highSchoolFilteredNestedSkillsList: [],
        collegeFilteredNestedSkillsList: [],
        // ---
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
        // For 'Instructor' role / For guest mode of Vertical Tree
        async getFilteredNestedSkillsList(level) {
            const result = await fetch(
                '/skills/filtered-nested-list?level=' + level
            );
            const data = await result.json();

            // If the student clicks a button on the grade level key,
            // this will truncate the tree to that level.
            if (level == 'grade_school') {
                this.gradeSchoolFilteredNestedSkillsList = data;
            } else if (level == 'middle_school') {
                this.middleSchoolFilteredNestedSkillsList = data;
            } else if (level == 'high_school') {
                this.highSchoolFilteredNestedSkillsList = data;
            } else if (level == 'college') {
                this.collegeFilteredNestedSkillsList = data;
            }
            // Default is all levels.
            else this.filteredNestedSkillsList = data;
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
