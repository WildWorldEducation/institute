<script>
import { handleError } from 'vue';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useSkillTreeStore } from '../../../stores/SkillTreeStore';
import { useSessionDetailsStore } from '../../../stores/SessionDetailsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const skillTreeStore = useSkillTreeStore();
        const sessionDetailsStore = useSessionDetailsStore();
        return {
            sessionDetailsStore,
            userDetailsStore,
            skillTreeStore,
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
            left: '0px',
            openNestedSubFilterMenu: false,

            additionalFilterPosition: {
                top: 0,
                left: 0
            },
            nestedFilterData: null,
            activeFilteredSubject: null
        };
    },
    computed: {},
    async mounted() {},
    methods: {
        updateSubjectFilter(skillName) {
            // flag to determine the state of ours show skill in filter object
            let state = 'no skill';
            const subSubjectFilterObject = {
                skillName: skillName,
                parent: this.activeFilteredSubject.skill_name
            };
            // Handle the case when all skill is in filter objects and user click a skill => we remove other skill from filter object
            // and only keep the one get clicked
            const skillsInSubjectFilter = [];
            for (let index = 0; index < this.showSkills.length; index++) {
                const element = this.showSkills[index];
                const filterSkill =
                    this.userDetailsStore.subSubjectsFilters.find(
                        (node) => node.skillName === element.skill_name
                    );
                if (filterSkill) {
                    skillsInSubjectFilter.push(filterSkill);
                }
            }

            if (skillsInSubjectFilter.length === this.showSkills.length) {
                // find other skill that need to remove from filter object
                const skillsNeedRemove = this.showSkills.filter(
                    (skill) => skill.skill_name !== skillName
                );
                skillsNeedRemove.forEach((skill) => {
                    const filterObject = {
                        skillName: skill.skill_name,
                        parent: this.activeFilteredSubject.skill_name
                    };
                    this.userDetailsStore.updateSubSubjectFilter(filterObject);
                });
                state = 'Show a skill';
            } else {
                // update the sub-subject filter array in userDetailsStore
                this.userDetailsStore.updateSubSubjectFilter(
                    subSubjectFilterObject
                );
            }

            if (state === 'no skill') {
                // Handle the case where there are no skill of this sub-menu in the objects filter => add all skill back
                let oneSkillInFilterList = false;

                // We find out if a skill in showskills is in filter obj. We only need one so using some and break
                for (let index = 0; index < this.showSkills.length; index++) {
                    const element = this.showSkills[index];
                    oneSkillInFilterList =
                        this.userDetailsStore.subSubjectsFilters.some(
                            (skill) => skill.skillName === element.skill_name
                        );
                    if (oneSkillInFilterList) {
                        break;
                    }
                }

                if (!oneSkillInFilterList) {
                    // if no skill in showskills is in filter list we re-add all of them
                    this.showSkills.forEach((element) => {
                        const subSubjectFilterObject = {
                            skillName: element.skill_name,
                            parent: this.activeFilteredSubject.skill_name
                        };

                        // update the sub-subject filter array in userDetailsStore
                        this.userDetailsStore.updateSubSubjectFilter(
                            subSubjectFilterObject
                        );
                    });
                }
            }

            this.$parent.filterSkillTree();
        },
        // handel Science and Invention skill name case
        getFilterButtonPosition(subjectName) {
            let resultObj = { top: 0, right: 0 };
            switch (subjectName) {
                case 'History':
                    resultObj.right =
                        this.$refs.HistoryFilterBtn.getBoundingClientRect().right;
                    resultObj.top =
                        this.$refs.HistoryFilterBtn.getBoundingClientRect().top;
                    break;
                case 'Language':
                    resultObj.right =
                        this.$refs.LanguageFilterBtn.getBoundingClientRect().right;
                    resultObj.top =
                        this.$refs.LanguageFilterBtn.getBoundingClientRect().top;
                    break;
                case 'Science and Invention':
                    resultObj.right =
                        this.$refs.ScienceAndInventionFilterBtn.getBoundingClientRect().right;
                    resultObj.top =
                        this.$refs.ScienceAndInventionFilterBtn.getBoundingClientRect().top;
                    break;
                default:
                    break;
            }
            return resultObj;
        }
    },
    watch: {
        additionalFilterData: {
            handler(newItem, oldItem) {
                this.showSkills = newItem?.activeFilteredSubject?.children;
                this.position = newItem?.additionalFilterPosition;
                if (this.position) {
                    this.top = this.position.top + 'px';
                    this.left = this.position.left + 'px';
                }
                const activeFilteredSubject = newItem.activeFilteredSubject;
                this.activeFilteredSubject = activeFilteredSubject;

                // handle the case when there is only one child in the subject
                if (activeFilteredSubject.children.length === 1) {
                    this.showSkills =
                        activeFilteredSubject.children[0].children;
                    this.activeFilteredSubject =
                        activeFilteredSubject.children[0];
                }

                // check if one of the showSkills is in the filter list
                let oneSkillInFilterList = false;
                for (let index = 0; index < this.showSkills.length; index++) {
                    const element = this.showSkills[index];
                    oneSkillInFilterList =
                        this.userDetailsStore.subSubjectsFilters.some(
                            (skill) => skill.skillName === element.skill_name
                        );
                    if (oneSkillInFilterList) {
                        break;
                    }
                }
                // if no skill in showskills is in filter list we re-add all of them
                if (!oneSkillInFilterList) {
                    this.showSkills.forEach((element) => {
                        const subSubjectFilterObject = {
                            skillName: element.skill_name,
                            parent: this.activeFilteredSubject.skill_name
                        };
                        // update the sub-subject filter array in userDetailsStore
                        this.userDetailsStore.updateSubSubjectFilter(
                            subSubjectFilterObject
                        );
                    });
                }
            },
            deep: true
        }
    }
};
</script>

<template>
    <div>
        <Transition name="slide-fade">
            <div v-if="openSubFilterMenu" class="submenuBase">
                <div v-for="node in showSkills">
                    <button
                        @click="updateSubjectFilter(node.skill_name)"
                        class="btn mb-2"
                        :class="{
                            'chosen-subject':
                                userDetailsStore.subSubjectsFilters.find(
                                    (skill) =>
                                        skill.skillName === node.skill_name
                                ),
                            'hidden-subject':
                                !userDetailsStore.subSubjectsFilters.find(
                                    (skill) =>
                                        skill.skillName === node.skill_name
                                )
                        }"
                    >
                        {{ node.skill_name }}
                    </button>
                </div>
            </div>
        </Transition>
        <!-- Nested additional filter -->
        <!-- Sub subject filters only appear when a root subject is choose and user is logged in-->
        <!-- <TidyTreeSubSubjectFilter
            :parentSkill="activeFilteredSubject"
            :openSubFilterMenu="openNestedSubFilterMenu"
            :parents="[activeFilteredSubject?.skill_name]"
            :position="additionalFilterPosition"
            :additionalFilterData="nestedFilterData"
        /> -->
    </div>
</template>

<style scoped>
.submenuBase {
    position: absolute;
    top: v-bind(top);
    left: v-bind(left);
    background-color: rgba(255, 255, 255, 0.778);
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

/* Animation for sub menu  */
.slide-fade-enter-active {
    transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.3s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateX(-26px);
    opacity: 0;
}
</style>
