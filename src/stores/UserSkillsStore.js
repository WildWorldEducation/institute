import { defineStore } from 'pinia'

// Import another store.
import { useSkillsStore } from './SkillsStore.js'

export const useUserSkillsStore = defineStore("userSkills", {
    state: () => ({
        unnestedList: [],
    }),
    actions: {
        async getUnnestedList(userId) {
            const result = await fetch('/user-skills/unnested-list/' + userId);
            this.unnestedList = await result.json();
        },
        async MakeMastered(userId, skillId) {
            // API call for skill tree.
            const skillsStore = useSkillsStore();
            // Load the skills if havent been yet.
            if (skillsStore.skillsList.length == 0) {
                await skillsStore.getSkillsList()
            }
            // Update user skills if havent been yet.           
            await this.getUnnestedList(userId)

            let url = "/user-skills/mastered/" + userId + "/" + skillId;

            fetch(url)
                .then(() => {
                    let skill = {}
                    // Check if is a sub skill.                    
                    for (let i = 0; i < skillsStore.skillsList.length; i++) {
                        if (skillsStore.skillsList[i].id == skillId) {
                            skill = skillsStore.skillsList[i]
                        }
                    }
                    // If not ...
                    if (skill.type != 'sub') {
                        // Get all the child skills.
                        const childSkills = []
                        for (let i = 0; i < skillsStore.skillsList.length; i++) {
                            if (skillsStore.skillsList[i].parent == skillId) {
                                childSkills.push(skillsStore.skillsList[i])
                            }
                        }
                        let subSkills = []
                        // Make them accessible/unlocked if regular type skills.
                        for (let i = 0; i < childSkills.length; i++) {
                            if (childSkills[i].type == 'regular') {
                                this.MakeAccessible(userId, childSkills[i].id)
                            }
                            // If super type skills, make their subskills accessible.
                            else if (childSkills[i].type == 'super') {
                                for (let j = 0; j < skillsStore.skillsList.length; j++) {
                                    if (skillsStore.skillsList[j].parent == childSkills[i].id
                                        && skillsStore.skillsList[j].type == 'sub') {
                                        subSkills.push(skillsStore.skillsList[j].id)
                                    }
                                }
                            }
                        }
                        for (let i = 0; i < subSkills.length; i++) {
                            this.MakeAccessible(userId, subSkills[i])
                        }
                    }
                    // If this skill is a sub skill.
                    else {
                        // Get its sibling skills.
                        let siblingSkills = []
                        for (let i = 0; i < skillsStore.skillsList.length; i++) {
                            if (skillsStore.skillsList[i].parent == skill.parent
                                && skillsStore.skillsList[i].id != skill.id) {
                                if (skillsStore.skillsList[i].type == 'sub') {
                                    siblingSkills.push(skillsStore.skillsList[i])
                                }
                            }
                        }

                        //Check if all the siblings are mastered.
                        let allMastered = true
                        for (let i = 0; i < this.unnestedList.length; i++) {
                            for (let j = 0; j < siblingSkills.length; j++) {
                                if (siblingSkills[j].id == this.unnestedList[i].id) {
                                    if (this.unnestedList[i].is_mastered != 1) {
                                        allMastered = false
                                    }
                                }
                            }
                        }

                        // If the others are, and now this one is, so unlock the super skill.
                        if (allMastered) {
                            this.MakeAccessible(userId, skill.parent)
                        }
                    }
                });
        },
        async MakeAccessible(userId, skillId) {
            var url = "/user-skills/accessible/" + userId + "/" + skillId;
            fetch(url)

            // Update user skills if havent been yet.           
            await this.getUnnestedList(userId)
        },
    }
});