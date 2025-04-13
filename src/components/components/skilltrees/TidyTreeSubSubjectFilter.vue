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
        {{ JSON.stringify(userDetailsStore.subSubjectsFilters) }}
        <div v-for="node in showSkills">
            <button
                @click="updateSubjectFilter(node.data.skill_name)"
                class="btn mb-2"
                :class="{
                    'chosen-subject': userDetailsStore.subSubjectsFilters.find(
                        (skill) => skill.skillName === node.data.skill_name
                    ),
                    'hidden-subject': !userDetailsStore.subSubjectsFilters.find(
                        (skill) => skill.skillName === node.data.skill_name
                    )
                }"
            >
                {{ node.data.skill_name }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.submenuBase {
    position: absolute;
    top: v-bind(top);
    left: v-bind(left);

    border: 1px solid var(--primary-color);
    border-radius: 8px;
    padding: 5px 10px;
}

/* Root subject filters */
.chosen-subject,
.switch-btn {
    background-color: var(--primary-color) !important;
    color: var(--primary-contrast-color) !important;
    opacity: 1;
}

.chosen-subject:active,
.chosen-subject:focus,
.switch-btn:hover {
    color: var(--primary-contrast-color) !important;
    opacity: 1 !important;
}

.btn:active,
.btn:focus {
    color: var(--primary-contrast-color);
    border: 1px solid black;
}

.chosen-subject:hover {
    opacity: 0.5;
    color: var(--primary-contrast-color) !important;
    border: 1px solid black;
}

.hidden-subject {
    color: var(--primary-contrast-color);
    background-color: var(--primary-color) !important;
    opacity: 0.5;
}

.hidden-subject:hover {
    background-color: var(--primary-color) !important;
    color: var(--primary-contrast-color);
    border: 1px solid black;
    opacity: 1;
}

.hidden-subject:active,
.hidden-subject:focus {
    background-color: var(--primary-color) !important;
    color: var(--primary-contrast-color);
    border: 1px solid black;
    opacity: 0.5;
}
</style>
