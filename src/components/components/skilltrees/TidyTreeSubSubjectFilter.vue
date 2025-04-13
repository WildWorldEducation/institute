<script>
import { handleError } from 'vue';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore,
            top: '0px',
            left: '0px'
        };
    },
    props: [
        'parentSkill',
        'openSubFilterMenu',
        'filterSkillTree',
        'parents',

        'additionalFilterData'
    ],
    data() {
        return {
            showSkills: [],
            position: null,
            // string position with px suffix for css
            top: '0px',
            left: '0px'
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
        additionalFilterData: {
            handler(newItem, oldItem) {
                console.log(newItem);
                this.showSkills = newItem.activeFilteredSubject.children;
                this.position = newItem.additionalFilterPosition;
                if (this.position) {
                    this.top = this.position.top + 'px';
                    this.left = this.position.left + 'px';
                }
            },
            deep: true
        }
        // parentSkill: {
        //     handler(newItem, oldItem) {
        //         this.showSkills = newItem.children;
        //     }
        // },
        // position: {
        //     handlingPositionChange(newItem) {
        //         console.log('solland: ');
        //         console.log(newItem);
        //     },
        //     deep: true
        // }
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
    top: v-bind(top);
    left: v-bind(left);
    background-color: rgba(127, 255, 212, 0.501);
    border: 2px solid --primary-color;
}
</style>
