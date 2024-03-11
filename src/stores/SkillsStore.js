import { defineStore } from 'pinia';

export const useSkillsStore = defineStore('skills', {
    state: () => ({
        nestedSkillsList: [],     
        skillsList: []
    }),
    actions: {
        async getNestedSkillsList() {
            const result = await fetch('/skills/nested-list');
            const data = await result.json();
            this.nestedSkillsList = data;
        },
        async getSkillsList() {
            const result = await fetch('/skills/list');
            const data = await result.json();
            this.skillsList = data;
        },
        async deleteSkill(id) {
            // Warning popup.
            var answer = window.confirm('Delete skill?');
            if (answer) {
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
            }
        }
    }
});
