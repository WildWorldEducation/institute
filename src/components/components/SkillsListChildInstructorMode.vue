<script>
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useUserSkillsStore } from '../../stores/UserSkillsStore.js';
import { useSkillTreeStore } from '../../stores/SkillTreeStore.js';

export default {
    setup() {
        const skillsStore = useSkillsStore();
        const userSkillsStore = useUserSkillsStore();
        const skillTreeStore = useSkillTreeStore();
        return {
            skillsStore,
            userSkillsStore,
            skillTreeStore
        };
    },
    data() {
        return {
            showChildren: false,
            showSubskills: true,
            showModal: false,
            childrenNotSubskills: [],
            subSkills: [],
            isResult: false,
            // Used for goals feature.
            skill: {},
            accessibleSkills: [],
            goalSteps: [],
            // To allow for making the button grey without needing refresh, after goal created
            isPseudoGoal: false
        };
    },
    props: [
        'id',
        'children',
        'name',
        'isUnlocked',
        'isMastered',
        'isGoal',
        'type',
        'level',
        'depth',
        'role',
        'isFiltered',
        'DeleteSkill',
        'path',
        'studentId',
        'parent',
        'isStudentSkillsLocked'
    ],
    computed: {
        indent() {
            var amount = 0;
            if (this.depth == 1) {
                amount = 25;
            } else {
                amount = 20;
            }

            // For regular skills.
            if (this.type != 'sub') {
                return {
                    transform: `translate(${this.depth * amount}px)`
                };
            }
            // For subskills. They should be indented to the same amount as their main skill.
            else {
                return {
                    transform: `translate(${(this.depth - 1) * amount}px)`
                };
            }
        },
        countMastered() {
            let masteredCount = 0;

            // Iterate through each object in the array
            for (let obj of this.subSkills) {
                // Check if the object has the attribute "is_mastered" set to true
                if (obj.is_mastered == true) {
                    // Increment the counter if the object is mastered
                    masteredCount++;
                }
            }
            return masteredCount;
        }
    },
    async created() {
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].type == 'sub') {
                this.subSkills.push(this.children[i]);
            } else {
                this.childrenNotSubskills.push(this.children[i]);
            }
        }

        // Created skill object, for goal creation methods.
        this.skill.id = this.id;
        this.skill.name = this.name;
        this.skill.type = this.type;
        this.skill.parent = this.parent;
        this.skill.is_mastered = this.isMastered;
        this.skill.is_accessible = this.isUnlocked;
        this.skill.is_goal = this.isGoal;

        // Will need this list to create the goal steps.
        await this.userSkillsStore.getFilteredUnnestedList(this.studentId);
        for (
            let i = 0;
            i < this.userSkillsStore.filteredUnnestedList.length;
            i++
        ) {
            // Get the accessible skill list of this student
            if (
                this.userSkillsStore.filteredUnnestedList[i].is_accessible == 1
            ) {
                if (
                    this.userSkillsStore.filteredUnnestedList[i].type !=
                    'domain'
                ) {
                    this.accessibleSkills.push(
                        this.userSkillsStore.filteredUnnestedList[i]
                    );
                }
            }
        }
    },
    mounted() {
        // This is to load the state of the nested skills list (which child skills are currently showing).
        if (localStorage.getItem(this.id + 'children') == 'true') {
            this.showChildren = true;
        } else {
            this.showChildren = false;
        }

        if (localStorage.getItem(this.id + 'sub') == 'false') {
            this.showSubskills = false;
        } else {
            this.showSubskills = true;
        }

        /*
         * Give longer domain names smaller font, otherwise they look bad.
         * Do this by checking how many lines they span (by checking height.)
         */
        if (this.type == 'domain') {
            if (this.$refs.name.offsetHeight > 120)
                this.$refs.name.classList.add('five-row-domain-name');
            else if (this.$refs.name.offsetHeight > 90)
                this.$refs.name.classList.add('four-row-domain-name');
            else if (this.$refs.name.offsetHeight > 60)
                this.$refs.name.classList.add('three-row-domain-name');
            else if (this.$refs.name.offsetHeight > 30)
                this.$refs.name.classList.add('two-row-domain-name');
        }

        // We only check path to show child if the node depth is 2 or greater
        if (this.depth >= 2) {
            const inPath = this.path.find((node) => node.id === this.id);
            if (inPath) {
                this.showChildren = true;
            }
        }

        // if we are the last node to appear when user choose a path we scroll to here
        const lastNode = this.path[this.path.length - 1];
        if (lastNode && this.id === lastNode.id) {
            this.isResult = true;
            document.getElementById(`skill${this.id}`).scrollIntoView({
                behavior: 'smooth'
            });
        }
    },
    methods: {
        mainButtonPress() {
            this.toggleChildren();
        },
        // Save the state of the skills list to browser storage.
        toggleChildren() {
            if (this.showChildren == false) {
                localStorage.setItem(this.id + 'children', true);
                this.showChildren = true;
            } else {
                localStorage.setItem(this.id + 'children', false);
                this.showChildren = false;
            }
        },
        // Save the state of the skills list to browser storage.
        toggleSubSkills() {
            if (this.showSubskills == false) {
                localStorage.setItem(this.id + 'sub', true);
                this.showSubskills = true;
            } else {
                localStorage.setItem(this.id + 'sub', false);
                this.showSubskills = false;
            }
        },
        ShowMobileButtonsModal() {
            this.showModal = true;
        },
        HideMobileButtonsModal() {
            this.showModal = false;
        },
        recursivelySetState(items, state) {
            items.forEach((element) => {
                if (
                    element.type == 'domain' ||
                    element.type == 'super' ||
                    element.type == 'regular'
                ) {
                    localStorage.setItem(element.id + 'children', state);
                }

                this.recursivelySetState(element.children, state);
            });
        },
        // Expand/Collapse All Domain Descendants.
        toggleExpandAll() {
            this.recursivelySetState(this.children, !this.showChildren);
            localStorage.setItem(this.id + 'children', !this.showChildren);
            this.showChildren = !this.showChildren;
        },
        async confirmCreateGoal() {
            let text = `Are you sure you want to assign a goal for ${this.name}?`;
            if (confirm(text) == true) {
                this.createGoal(this.skill);
            }
        },
        async createGoal(skill) {
            if (skill.type != 'domain') {
                // Add ancestor skill to array.
                this.goalSteps.push(skill);
            }

            // Add ancestor subskills to array.
            let isSubSkillUnlocked = false;
            if (skill.type == 'super') {
                for (
                    let i = 0;
                    i < this.userSkillsStore.filteredUnnestedList.length;
                    i++
                ) {
                    if (
                        this.userSkillsStore.filteredUnnestedList[i].type ==
                            'sub' &&
                        this.userSkillsStore.filteredUnnestedList[i].parent ==
                            skill.id &&
                        this.userSkillsStore.filteredUnnestedList[i]
                            .is_mastered != 1
                    ) {
                        this.goalSteps.push(
                            this.userSkillsStore.filteredUnnestedList[i]
                        );
                        // Check if sub skill is unlocked.
                        if (
                            this.userSkillsStore.filteredUnnestedList[i]
                                .is_accessible
                        ) {
                            isSubSkillUnlocked = true;
                        }
                    }
                }
            }

            // Check if current skill is unlocked.
            const inAccessibleList = this.accessibleSkills.find(
                (as) => as.id == skill.id
            );

            // Stop when the first ancestor node that is unlocked for the student is found
            // or if its sub skill is unlocked
            if (inAccessibleList || isSubSkillUnlocked) {
                this.populateGoalSteps();
                this.isPseudoGoal = true;
                return;
            }

            fetch('/skills/show/' + skill.parent)
                .then((response) => {
                    return response.json();
                })
                .then((skill) => {
                    // Recursively call the function with parent skill data.
                    return this.createGoal(skill);
                });
        },
        populateGoalSteps() {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    goalSteps: this.goalSteps
                })
            };
            const url =
                '/user-skills/set-goal/' + this.studentId + '/' + this.skill.id;
            fetch(url, requestOptions).then(() => {
                alert('Goal assigned.');
            });
        }
    },
    watch: {
        path: {
            handler(newVal) {
                const inPath = newVal.find((node) => node.id === this.id);
                if (inPath) {
                    this.showChildren = true;
                }
                if (newVal.length === 0 && this.isResult === true) {
                    this.isResult = false;
                }
                // if we are the last node to appear when user choose a path we scroll to the node
                const lastNode = this.path[this.path.length - 1];
                if (lastNode && this.id === lastNode.id) {
                    this.isResult = true;
                    document.getElementById(`skill${this.id}`).scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        }
    }
};
</script>

<template>
    <button
        :style="indent"
        :class="{
            domains: type == 'domain',
            // Colors and background images for top level skills.
            unlocked: isUnlocked == 1 || isStudentSkillsLocked != 1,
            locked: isUnlocked != 1 && isStudentSkillsLocked == 1,
            mastered: isMastered == 1,
            'sub-skill-button': type == 'sub',
            'grade-school-level': level == 'grade_school',
            'middle-school-level': level == 'middle_school',
            'high-school-level': level == 'high_school',
            'college-level': level == 'college',
            'phd-level': level == 'phd',
            'has-children': children.length > 0,
            'result-button': isResult === true
        }"
        class="skill-button secondary-text d-flex justify-content-between"
        @click.stop="mainButtonPress()"
        :id="`skill${this.id}`"
    >
        <!-- Emoticons -->
        <div v-if="type != 'domain'">
            <!-- Choose one of 5 emoticon colours based on skill level -->
            <!-- check if mastered or unlocked -->
            <!-- and, if locked, apply grayscale. -->
            <!-- Grade School level -->
            <img
                v-if="level == 'grade_school' && isMastered == 1"
                src="/images/skill-emoticons/grade-school-mastered.png"
            />
            <img
                v-else-if="level == 'grade_school'"
                src="/images/skill-emoticons/grade-school-unlocked.png"
            />
            <!-- Middle School level -->
            <img
                v-else-if="level == 'middle_school' && isMastered == 1"
                src="/images/skill-emoticons/middle-school-mastered.png"
            />
            <img
                v-else-if="level == 'middle_school'"
                src="/images/skill-emoticons/middle-school-unlocked.png"
            />
            <!-- High School level -->
            <img
                v-else-if="level == 'high_school' && isMastered == 1"
                src="/images/skill-emoticons/high-school-mastered.png"
            />
            <img
                v-else-if="level == 'high_school'"
                src="/images/skill-emoticons/high-school-unlocked.png"
            />
            <!-- College level -->
            <img
                v-else-if="level == 'college' && isMastered == 1"
                src="/images/skill-emoticons/college-mastered.png"
            />
            <img
                v-else-if="level == 'college'"
                src="/images/skill-emoticons/college-unlocked.png"
            />
            <!-- PHD level -->
            <img
                v-else-if="level == 'phd' && isMastered == 1"
                src="/images/skill-emoticons/phd-mastered.png"
            />
            <img
                v-else-if="level == 'phd'"
                src="/images/skill-emoticons/phd-unlocked.png"
            />
            <!-- If skill is locked -->
            <img
                v-else
                src="/images/skill-emoticons/middle-school-unlocked.png"
            />
        </div>
        <!-- Skill name. Ref added for dynamic class based on name length, see above. -->
        <div>
            <div ref="name" style="text-align: left">
                {{ name }}
            </div>
            <div
                v-if="type == 'super'"
                class="d-none d-sm-block text-start pt-1 mastered-skills-count"
            >
                {{ countMastered }} out of {{ subSkills.length }} subskills
                mastered
            </div>
        </div>

        <!-- Buttons -->
        <div id="buttons" class="d-flex">
            <button
                v-if="type != 'domain'"
                class="btn"
                title="create a goal"
                @click.stop="
                    isMastered == 1 || isUnlocked == 1 || isGoal || isPseudoGoal
                        ? $event.preventDefault()
                        : confirmCreateGoal()
                "
            >
                <!-- Create goal button-->
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    class="primary-icon"
                    width="20"
                    heigth="20"
                >
                    <!--!Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                    <path
                        :style="{
                            fill:
                                isMastered == 1 ||
                                isUnlocked == 1 ||
                                isGoal ||
                                isPseudoGoal
                                    ? '#d3d3d3'
                                    : 'primary-icon'
                        }"
                        d="M448 256A192 192 0 1 0 64 256a192 192 0 1 0 384 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 80a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm0-224a144 144 0 1 1 0 288 144 144 0 1 1 0-288zM224 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"
                    />
                </svg>
            </button>
            <!-- Expand/collapse subskills button-->
            <button
                v-if="type == 'super'"
                type="button"
                @click.stop="toggleSubSkills"
                class="btn me-2 ci-btn"
            >
                <!-- Plus sign -->
                <svg
                    v-if="!showSubskills"
                    width="18"
                    height="18"
                    class="primary-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                >
                    <!-- !Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                    <path
                        d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                    />
                </svg>
                <!-- Minus sign -->
                <svg
                    v-else
                    width="18"
                    height="18"
                    class="primary-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                >
                    <!-- !Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                    <path
                        d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                    />
                </svg>
            </button>
            <!-- Expand/collapse all domain descendants button-->
            <button
                class="btn me-2 ci-btn"
                v-if="type == 'domain'"
                @click.stop="toggleExpandAll"
            >
                <svg
                    v-if="showChildren"
                    height="18"
                    width="18"
                    class="primary-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                >
                    <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                    <path
                        d="M246.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L224 109.3 361.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160zm160 352l-160-160c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L224 301.3 361.4 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3z"
                    />
                </svg>
                <svg
                    v-else
                    height="18"
                    width="18"
                    class="primary-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                >
                    <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.
                    -->
                    <path
                        d="M246.6 470.6c-12.5 12.5-32.8 12.5-45.3 0l-160-160c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L224 402.7 361.4 265.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-160 160zm160-352l-160 160c-12.5 12.5-32.8 12.5-45.3 0l-160-160c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L224 210.7 361.4 73.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3z"
                    />
                </svg>
            </button>
            <!-- Expand/collapse child skills button-->
            <button
                v-if="childrenNotSubskills.length != 0"
                @click.stop="toggleChildren"
                class="btn me-2 ci-btn"
            >
                <!-- Collapse icon -->
                <svg
                    v-if="!showChildren"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                    width="18"
                    height="18"
                    class="primary-icon"
                >
                    <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                    <path
                        d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
                    />
                </svg>
                <svg
                    v-else
                    xmlns="http://www.w3.org/20da00/svg"
                    viewBox="0 0 512 512"
                    width="18"
                    height="18"
                    class="primary-icon"
                >
                    <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                    <path
                        d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
                    />
                </svg>
            </button>
        </div>
    </button>

    <!-- Sub skills -->
    <SkillsListChildInstructorMode
        v-if="showSubskills"
        v-for="subSkill in subSkills"
        :id="subSkill.id"
        :children="subSkill.children"
        :isUnlocked="subSkill.is_accessible"
        :isMastered="subSkill.is_mastered"
        :isGoal="subSkill.is_goal"
        :type="subSkill.type"
        :level="subSkill.level"
        :name="subSkill.skill_name"
        :isFiltered="subSkill.isFiltered"
        :role="role"
        :depth="depth + 1"
        :path="path"
        :studentId="studentId"
        :parent="subSkill.parent"
        :isStudentSkillsLocked="isStudentSkillsLocked"
    >
    </SkillsListChildInstructorMode>

    <!-- Recursive nesting of component -->
    <SkillsListChildInstructorMode
        v-if="showChildren"
        v-for="child in childrenNotSubskills"
        :id="child.id"
        :children="child.children"
        :isUnlocked="child.is_accessible"
        :isMastered="child.is_mastered"
        :isGoal="child.is_goal"
        :type="child.type"
        :level="child.level"
        :name="child.skill_name"
        :isFiltered="child.isFiltered"
        :role="role"
        :depth="depth + 1"
        :path="path"
        :studentId="studentId"
        :parent="child.parent"
        :isStudentSkillsLocked="isStudentSkillsLocked"
    >
    </SkillsListChildInstructorMode>
</template>

<style scoped>
/* The skill buttons */
.skill-button {
    padding: 10px;
    margin-bottom: 10px;
    border-style: solid;
    border-width: 2px;
    border-radius: 8px;
    width: 545px;
    height: 84px;
    font-size: 16px;
    font-weight: 500;
    background-color: #f2edff;
    scroll-margin-top: 35vh;
}

.has-children {
    border-bottom-width: thick;
}

.skill-button:hover {
    background-color: #e4def0;
}

.skill-button:active {
    border-width: 4px;
}

.skill-button img {
    height: 68px;
}

/* Sub skill buttons */
.sub-skill-button {
    width: 490px;
    height: 71px;
}

.sub-skill-button img {
    height: 58px;
}

/* Domain */
.domains {
    width: 360px;
    height: 71px;
    color: black;
    font-size: 20px;
    font-weight: 400;
    border-color: black;
    background-position: right;
    flex-direction: row;
    color: black !important;
}

.mastered-skills-count {
    font-size: 14px;
}
.two-row-domain-name {
    font-size: 17px;
}

.three-row-domain-name {
    font-size: 14px;
}

.four-row-domain-name {
    font-size: 13px;
}

.four-row-domain-name {
    font-size: 12px;
}

/* Border */
.grade-school-level {
    border-color: #33b3a6;
}

/* Background when mastered */
.grade-school-level.mastered {
    background-color: #b3f9eb;
}

/* Border */
.middle-school-level {
    border-color: #008000;
}

/* Background when mastered */
.middle-school-level.mastered {
    background-color: #99d899;
}

/* Border */
.high-school-level {
    border-color: #ccac00;
}

/* Background when mastered */
.high-school-level.mastered {
    background-color: #ffe34c;
}

/* Border */
.college-level {
    border-color: #ffa500;
}

/* Background when mastered */
.college-level.mastered {
    background-color: #ffd999;
}

/* Border */
.phd-level {
    border-color: #cc0000;
}

/* Background when mastered */
.phd-level.mastered {
    background-color: #ff9999;
}

.top-level-skills svg path {
    fill: black;
}

.user-name {
    background-color: white;
}

/* Locked, unlocked and mastered styling */
.locked {
    border-color: #c8d7da;
    background-color: #f3f2f5;
    -webkit-filter: grayscale(100%);
    filter: grayscale(100%);
}

.mastered {
    background-color: #e4daff;
}

/* Mobile view style */
@media (max-width: 480px) {
    .skill-button {
        width: 293px;
        height: 70px;
        font-size: 13px;
    }

    .domains {
        height: 55px;
    }

    .domains .btn {
        padding-top: 0px;
        padding-bottom: 0px;
    }

    .skill-button img {
        height: 48px;
    }

    /* Sub skill buttons */
    .sub-skill-button {
        width: 250px;
        height: 60px;
    }

    .top-level-skills {
        width: 328px;
        height: 80px;
    }
}
</style>
