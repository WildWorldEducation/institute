<script>
import { useSkillsStore } from '../../stores/SkillsStore.js';

export default {
    setup() {
        const skillsStore = useSkillsStore();
        return {
            skillsStore
        };
    },
    data() {
        return {
            showChildren: false,
            showSubskills: true,
            showModal: false,
            childrenNotSubskills: [],
            subSkills: []
        };
    },
    props: [
        'id',
        'children',
        'name',
        'isUnlocked',
        'isMastered',
        'type',
        'level',
        'depth',
        'role',
        'isFiltered',
        'DeleteSkill'
    ],
    computed: {
        indent() {
            var amount = 0;
            if (screen.width <= 480) {
                if (this.depth == 1) {
                    amount = 25;
                } else {
                    amount = 20;
                }
            } else {
                amount = 50;
            }

            // For regular skills.
            if (this.type != 'sub') {
                return {
                    transform: `translate(${this.depth * amount - 35.2}px)`
                };
            }
            // For subskills. They should be indented to the same amount as their main skill.
            else {
                return {
                    transform: `translate(${
                        (this.depth - 1) * amount - 35.2
                    }px)`
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
         * Give longer node names smaller font, otherwise they look bad.
         * Do this by checking how many lines they span (by checking height.)
         */
        if (this.$refs.name.offsetHeight > 120)
            this.$refs.name.classList.add('five-row-domain-name');
        else if (this.$refs.name.offsetHeight > 90)
            this.$refs.name.classList.add('four-row-domain-name');
        else if (this.$refs.name.offsetHeight > 60)
            this.$refs.name.classList.add('three-row-domain-name');
        else if (this.$refs.name.offsetHeight > 30)
            this.$refs.name.classList.add('two-row-domain-name');
        
    },
    methods: {
        mainButtonPress() {
            if (this.type != 'domain') {
                window.open('/skills/' + this.id, '_blank');
            } else this.toggleChildren();
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
            locked: isUnlocked != 1,
            unlocked: isUnlocked == 1,
            mastered: isMastered == 1,
            'sub-skill-button': type == 'sub',
            'grade-school-level': level == 'grade_school',
            'middle-school-level': level == 'middle_school',
            'high-school-level': level == 'high_school',
            'college-level': level == 'college',
            'phd-level': level == 'phd',
            'has-children': children.length > 0
        }"
        class="skill-button d-flex justify-content-between align-items-center"
        @click.stop="mainButtonPress()"
    >
        <!-- Emoticons -->
        <div v-if="level != 'domain'" class="align-self-end">
            <!-- Choose one of 5 emoticon colours based on skill level -->
            <!-- check if mastered or unlocked -->
            <!-- and, if locked, apply grayscale. -->
            <!-- Grade School level -->
            <img
                v-if="level == 'grade_school' && isMastered == 1"
                src="/images/skill-emoticons/grade-school-mastered.png"
            />
            <img
                v-else-if="level == 'grade_school' && isUnlocked == 1"
                src="/images/skill-emoticons/grade-school-unlocked.png"
            />
            <!-- Middle School level -->
            <img
                v-else-if="level == 'middle_school' && isMastered == 1"
                src="/images/skill-emoticons/middle-school-mastered.png"
            />
            <img
                v-else-if="level == 'middle_school' && isUnlocked == 1"
                src="/images/skill-emoticons/middle-school-unlocked.png"
            />
            <!-- High School level -->
            <img
                v-else-if="level == 'high_school' && isMastered == 1"
                src="/images/skill-emoticons/high-school-mastered.png"
            />
            <img
                v-else-if="level == 'high_school' && isUnlocked == 1"
                src="/images/skill-emoticons/high-school-unlocked.png"
            />
            <!-- College level -->
            <img
                v-else-if="level == 'college' && isMastered == 1"
                src="/images/skill-emoticons/college-mastered.png"
            />
            <img
                v-else-if="level == 'college' && isUnlocked == 1"
                src="/images/skill-emoticons/college-unlocked.png"
            />
            <!-- PHD level -->
            <img
                v-else-if="level == 'phd' && isMastered == 1"
                src="/images/skill-emoticons/phd-mastered.png"
            />
            <img
                v-else-if="level == 'phd' && isUnlocked == 1"
                src="/images/skill-emoticons/phd-unlocked.png"
            />
            <!-- If skill is locked -->
            <img
                v-else
                src="/images/skill-emoticons/middle-school-unlocked.png"
                class="locked-skill-styling"
            />
        </div>
        <!-- Skill name. Ref added for dynamic class based on name length, see above. -->
        <div>
            <div ref="name" style="text-align: left">{{ name }}</div>
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
                    fill="#9C7EEC"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                >
                    <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                    <path
                        d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                    />
                </svg>
                <!-- Minus sign -->
                <svg
                    v-else
                    width="18"
                    height="18"
                    fill="#9C7EEC"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                >
                    <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                    <path
                        d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                    />
                </svg>
            </button>
            <button
                v-if="childrenNotSubskills.length != 0"
                @click.stop="toggleChildren"
                class="btn ci-btn"
            >
                <!-- Collapse icon -->
                <svg
                    v-if="!showChildren"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                    width="18"
                    height="18"
                >
                    <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                    <path
                        d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
                        fill="#9C7EEC"
                    />
                </svg>
                <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    width="18"
                    height="18"
                >
                    <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                    <path
                        d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
                        fill="#9C7EEC"
                    />
                </svg>
            </button>
            <!-- Expand/collapse all domain descendants button-->
            <button
                class="btn me-2 ci-btn"
                v-if="level == 'domain'"
                @click.stop="toggleExpandAll"
            >
                <!-- collapse icon from svgrepo.com -->
                <svg
                    v-if="showChildren"
                    width="16px"
                    height="16px"
                    viewBox="0 0 16 16"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                >
                    <rect width="16" height="16" id="icon-bound" fill="none" />
                    <path
                        fill="#9C7EEC"
                        d="M4.414,15.414L8,11.828L11.586,15.414L13,14L8,9L3,14L4.414,15.414ZM11.586,0.586L8,4.172L4.414,0.586L3,2L8,7L13,2L11.586,0.586Z"
                        style="fill-rule: nonzero"
                    />
                </svg>
                <!-- Expand icon from svgrepo.com -->
                <svg
                    v-else
                    width="16px"
                    height="16px"
                    viewBox="0 0 16 16"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                >
                    <rect width="16" height="16" id="icon-bound" fill="none" />
                    <path
                        fill="#9C7EEC"
                        d="M8,11.5L4.706,8.878l-1.416,1.416L8,14l4.706-3.706l-1.416-1.416L8,11.5z M8,4.5l3.294,2.622l1.416-1.416L8,2L3.294,5.706 l1.416,1.416L8,4.5z"
                    />
                </svg>
            </button>
        </div>
    </button>

    <!-- Sub skills -->
    <SkillsListChildStudent
        v-if="showSubskills"
        v-for="subSkill in subSkills"
        :id="subSkill.id"
        :children="subSkill.children"
        :isUnlocked="subSkill.is_accessible"
        :isMastered="subSkill.is_mastered"
        :type="subSkill.type"
        :level="subSkill.level"
        :name="subSkill.skill_name"
        :isFiltered="subSkill.isFiltered"
        :role="role"
        :depth="depth + 1"
    >
    </SkillsListChildStudent>

    <!-- Recursive nesting of component -->
    <SkillsListChildStudent
        v-if="showChildren"
        v-for="child in childrenNotSubskills"
        :id="child.id"
        :children="child.children"
        :isUnlocked="child.is_accessible"
        :isMastered="child.is_mastered"
        :type="child.type"
        :level="child.level"
        :name="child.skill_name"
        :isFiltered="child.isFiltered"
        :role="role"
        :depth="depth + 1"
    >
    </SkillsListChildStudent>
</template>

<style scoped>
/* The skill buttons */
.skill-button {
    padding: 0px 10px;
    margin-bottom: 10px;
    border-style: solid;
    border-width: 2px;
    border-radius: 8px;
    width: 545px;
    height: 84px;
    color: #53389e;
    font-size: 20px;
    font-weight: 500;
    background-color: #f2edff;
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
}

.mastered-skills-count {
    font-size: 14px;
}
.two-row-domain-name {
    font-size: 17px;
}

.three-row-domain-name {
    font-size: 15px;
}

.four-row-domain-name {
    font-size: 13px;
}
.grade-school-level {
    border-color: #40b9a9;
}

.middle-school-level {
    border-color: #6eb3f5;
}

.high-school-level {
    border-color: #3983dd;
}

.college-level {
    border-color: #baa9e1;
}

.phd-level {
    border-color: #9c7eec;
}

.top-level-skills svg path {
    fill: black;
}

.user-name {
    background-color: white;
}

/* Locked, unlocked and mastered styling */
.locked-skill-styling {
    -webkit-filter: grayscale(100%);
    filter: grayscale(100%);
}

.locked {
    border-color: #c8d7da;
    background-color: #f3f2f5;
    color: #c8d7da;
}

.locked svg path {
    fill: #c8d7da;
}

.mastered {
    background-color: #e4daff;
}

@media (max-width: 480px) {
    /* Fix style for mobile */
    .skill-button {
        width: 293px;
        height: 70px;
        font-size: 15px;
    }

    .two-row-domain-name {
        font-size: 13px;
    }

    .three-row-domain-name {
        font-size: 11px;
    }

    .four-row-domain-name {
        font-size: 9px;
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
