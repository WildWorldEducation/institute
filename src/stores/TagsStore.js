import { defineStore } from 'pinia';

// Import other stores.
import { useSkillTagsStore } from './SkillTagsStore.js';
import { useSkillsStore } from './SkillsStore.js';

export const useTagsStore = defineStore('tags', {
    state: () => ({
        tagsList: []
    }),
    actions: {
        async getTagsList() {
            const result = await fetch('/tags/list');
            const data = await result.json();
            this.tagsList = data;
        },
        async deleteTag(id) {
            const result = fetch('/tags/' + id, {
                method: 'DELETE'
            });

            if (result.error) {
                console.log(result.error);
            }

            this.getTagsList();
        },
        async tagCheck(id) {
            // Get the skill filter tags.
            const skillTagsStore = useSkillTagsStore();
            if (skillTagsStore.skillTagsList.length == 0)
                await skillTagsStore.getSkillTagsList();
            let skillTags = skillTagsStore.skillTagsList;

            let affectedSkillIDs = [];
            let affectedSkillNames = [];
            for (let i = 0; i < skillTagsStore.skillTagsList.length; i++) {
                if (id == skillTagsStore.skillTagsList[i].tag_id) {
                    affectedSkillIDs.push(
                        skillTagsStore.skillTagsList[i].skill_id
                    );
                }
            }

            // Get the skills.
            const skillsStore = useSkillsStore();
            if (skillsStore.skillsList.length == 0)
                await skillsStore.getSkillsList();
            let skills = skillsStore.skillsList;

            for (let i = 0; i < affectedSkillIDs.length; i++) {
                for (let j = 0; j < skillsStore.skillsList.length; j++) {
                    if (affectedSkillIDs[i] == skillsStore.skillsList[j].id) {
                        affectedSkillNames.push(skillsStore.skillsList[j].name);
                    }
                }
            }

            // Let the user know which skills ahve the filter applied.
            // Filter cannot be deleted until it is deactivated there.
            if (affectedSkillIDs.length > 0) {
                alert(
                    'the following skills have this filter activated: ' +
                        affectedSkillNames +
                        '. Please deactivate it on these skills before deleting it.'
                );
                return;
            } else if (
                // Otehrwise make sure they want to.
                window.confirm('Are you sure you want to delete this filter?')
            ) {
                this.deleteTag(id);
            }
        }
    }
});
