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
    computed: {
        // Order the skills, based on the "order" field in the DB.
        // If no difference between these, will default to ordering by "id" field.
        // For students.
        orderedStudentSkills() {
            let orderedStudentSkills = this.userSkills.sort(
                ({ order: a }, { order: b }) => a - b
            );
            return orderedStudentSkills;
        },
        // For instructors and editors.
        orderedInstructorAndEditorSkills() {
            let orderedInstructorSkills =
                this.skillsStore.filteredNestedSkillsList.sort(
                    ({ order: a }, { order: b }) => a - b
                );
            return orderedInstructorSkills;
        },
        // For admins.
        orderedAdminSkills() {
            let orderedAdminSkills = this.skillsStore.nestedSkillsList.sort(
                ({ order: a }, { order: b }) => a - b
            );
            return orderedAdminSkills;
        }
    },
    async created() {
        // Admins.
        if (this.userDetailsStore.role == 'admin')
            await this.skillsStore.getNestedSkillsList();
        // Instructors and Editors.
        else if (
            this.userDetailsStore.role == 'instructor' ||
            this.userDetailsStore.role == 'editor'
        )
            await this.skillsStore.getFilteredNestedSkillsList();
        // Students.
        else if (this.userDetailsStore.role == 'student') {
            if (this.skillTreeStore.userSkills.length == 0) {
                await this.skillTreeStore.getUserSkills();
            }
            this.userSkills = this.skillTreeStore.userSkills;
        }
    },
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
        <!-- Students -->
        <div
            v-if="this.userDetailsStore.role == 'student'"
            v-for="skill in orderedStudentSkills"
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
                :role="userDetailsStore.role"
            >
            </SkillsListChildStudent>
        </div>
        <!-- Instructors and Editors -->
        <div
            v-else-if="
                this.userDetailsStore.role == 'instructor' ||
                this.userDetailsStore.role == 'editor'
            "
            v-for="skill in orderedInstructorAndEditorSkills"
        >
            <SkillsListChildNonStudent
                :id="skill.id"
                :children="skill.children"
                :depth="1"
                :name="skill.name"
                :type="skill.type"
                :level="skill.level"
                :role="userDetailsStore.role"
            >
            </SkillsListChildNonStudent>
        </div>
        <!-- Admins -->
        <div v-else v-for="skill in orderedAdminSkills">
            <SkillsListChildNonStudent
                :id="skill.id"
                :children="skill.children"
                :depth="1"
                :name="skill.name"
                :type="skill.type"
                :level="skill.level"
                :isFiltered="skill.is_filtered"
                :role="userDetailsStore.role"
                :DeleteSkill="DeleteSkill"
            >
            </SkillsListChildNonStudent>
        </div>
    </div>
</template>

<style scoped></style>
