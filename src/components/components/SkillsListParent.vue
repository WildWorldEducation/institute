<script>
// Import the stores.
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useSkillTreeStore } from '../../stores/SkillTreeStore.js';
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';

// Nested components.
import SkillsListChildStudent from './SkillsListChildStudent.vue';
import SkillsListChildNonStudent from './SkillsListChildNonStudent.vue';

export default {
    setup() {
        const skillsStore = useSkillsStore();
        const userDetailsStore = useUserDetailsStore();
        const skillTreeStore = useSkillTreeStore();

        return {
            skillsStore,
            userDetailsStore,
            skillTreeStore
        };
    },
    data() {
        return {
            userSkills: []
        };
    },
    async created() {
        // Admins.
        if (this.userDetailsStore.role != 'student')
            await this.skillsStore.getNestedSkillsListWithFilters();
        // Students.
        else if (this.userDetailsStore.role == 'student') {
            if (this.skillTreeStore.nestedSkillsListWithFilters.length == 0) {
                await this.skillTreeStore.getUserSkillsListWithFilters();
            }
            this.userSkills = this.skillTreeStore.nestedSkillsListWithFilters;
        }
    },
    computed: {},
    methods: {
        async DeleteSkill(id) {
            await this.skillsStore.deleteSkill(id);
            await this.skillsStore.getNestedSkillsList();
        }
    },
    components: {
        SkillsListChildStudent,
        SkillsListChildNonStudent
    }
};
</script>

<template>
    <div class="container mt-3" style="overflow: auto">
        <div
            v-if="this.userDetailsStore.role == 'student'"
            v-for="skill in userSkills"
        >
            <SkillsListChildStudent
                :id="skill.id"
                :children="skill.children"
                :depth="1"
                :name="skill.skill_name"
                :isUnlocked="skill.is_accessible"
                :isMastered="skill.is_mastered"
                :type="skill.type"
                :level="skill.level"
                :isFiltered="skill.isFiltered"
                :role="userDetailsStore.role"
            >
            </SkillsListChildStudent>
        </div>
        <div v-else v-for="skill in skillsStore.nestedSkillsListWithFilters">
            <SkillsListChildNonStudent
                :id="skill.id"
                :children="skill.children"
                :depth="1"
                :name="skill.name"
                :type="skill.type"
                :level="skill.level"
                :isFiltered="skill.isFiltered"
                :role="userDetailsStore.role"
                :DeleteSkill="DeleteSkill"
            >
            </SkillsListChildNonStudent>
        </div>
    </div>
</template>

<style scoped></style>
