<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    props: ['parentSkill', 'openSubFilterMenu', 'filterSkillTree', 'parents'],
    data() {
        return {
            showSkills: []
        };
    },
    computed: {},
    async mounted() {},
    methods: {
        updateSubjectFilter(skillName) {
            const subSubjectFilterObject = {
                skillName: skillName,
                parent: this.parentSkill.data.skill_name
            };
            // update the sub-subject filter array in userDetailsStore
            this.$parent.subSubjectFilterObject =
                this.userDetailsStore.updateSubSubjectFilter(
                    subSubjectFilterObject,
                    this.$parent.subSubjectsFilters
                );

            this.$parent.filterSkillTree();
        }
    },
    watch: {
        parentSkill: {
            handler(newItem, oldItem) {
                this.showSkills = newItem.children;
            }
        }
    }
};
</script>

<template>
    <div v-if="openSubFilterMenu" class="submenuBase">
        <div>Show all</div>
        <div
            v-for="node in showSkills"
            @click="updateSubjectFilter(node.data.skill_name)"
        >
            {{ node.data.skill_name }}
        </div>
    </div>
</template>

<style scoped>
.submenuBase {
    position: absolute;
    top: 50%;
    left: 15%;
    background-color: rgba(127, 255, 212, 0.501);
    border: 2px solid --primary-color;
}
</style>
