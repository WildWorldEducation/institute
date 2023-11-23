<script>
// Import the stores.
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useSkillTreeStore } from '../../stores/SkillTreeStore.js';
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';

// Nested component.
import SkillsListChild from './SkillsListChild.vue';

export default {
    setup() {
        const skillsStore = useSkillsStore();
        // Run the GET request.
        const userDetailsStore = useUserDetailsStore();
        const skillTreeStore = useSkillTreeStore();
        return {
            skillsStore, userDetailsStore, skillTreeStore
        }
    },
    data() {
        return {
            userSkills: []
        }
    },
    async created() {
        if (this.skillTreeStore.userSkills.length == 0) {
            await this.skillTreeStore.getUserSkills();
        }

        this.userSkills = this.skillTreeStore.userSkills
    },
    computed: {},
    methods: {},
    components: {
        SkillsListChild
    }
}
</script>

<template>
    <div class="container mt-3" style="overflow: auto">
        <div v-for="skill in userSkills">
            <SkillsListChild :id="skill.id" :children="skill.children" :depth="1" :name="skill.skill_name"
                :firstAncestor="skill.first_ancestor" :isUnlocked="skill.is_accessible" :isMastered="skill.is_mastered"
                :type="skill.type" :role="userDetailsStore.role" :DeleteSkill="skillsStore.deleteSkill">
            </SkillsListChild>
        </div>
    </div>
</template>  

<style scoped></style> 