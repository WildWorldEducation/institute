<script>
import router from '../../router';

export default {
    setup() {
        return {};
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
        skillURL() {
            // Format the skill name as a URL, based on the Wikipedia style.
            let urlFormattedSkillName = this.name?.replace(/ /g, '_');
            return urlFormattedSkillName;
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
         * Give longer domain names smaller font, otherwise they look bad.
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
                window.open('/skills/' + this.skillURL, '_blank');
            } else this.toggleChildren();
        },
        openEdit(id) {
            this.$router.push(`/skills/edit/${id}`);
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
            'is-filtered': isFiltered == 'filtered',
            // Colors and background images for top level skills.
            'sub-skill-button': type == 'sub',
            'grade-school-level': level == 'grade_school',
            'middle-school-level': level == 'middle_school',
            'high-school-level': level == 'high_school',
            'college-level': level == 'college',
            'phd-level': level == 'phd',
            'has-children': childrenNotSubskills.length > 0
        }"
        class="skill-button d-flex justify-content-between align-items-center"
        @click="mainButtonPress()"
    >
        <!-- Skill name. Ref added for dynamic class based on name length, see above. -->
        <span ref="name" style="text-align: left">{{ name }}</span>
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
                @click.stop="openEdit(id)"
                v-if="role == 'admin' || role == 'editor'"
                class="btn me-2 ci-btn"
            >
                <!-- Pencil icon -->
                <svg
                    width="19"
                    height="20"
                    viewBox="0 0 19 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0.75558 19.3181C0.77635 19.5132 0.87137 19.6928 1.02096 19.8198C1.17055 19.9468 1.36325 20.0114 1.55915 20.0002L5.27701 19.8288L0.398438 15.6145L0.75558 19.3181Z"
                        fill="#9C7EEC"
                    />
                    <path
                        d="M11.8467 2.24484L0.801758 15.0315L5.6802 19.2454L16.7251 6.45877L11.8467 2.24484Z"
                        fill="#9C7EEC"
                    />
                    <path
                        d="M18.2555 3.11796L14.934 0.260817C14.832 0.172259 14.7134 0.104756 14.5852 0.0621907C14.4569 0.0196256 14.3215 0.00283902 14.1868 0.0127967C14.052 0.0227543 13.9205 0.0592596 13.7999 0.120212C13.6793 0.181165 13.572 0.265362 13.484 0.36796L12.4805 1.50725L17.359 5.71439L18.3519 4.56082C18.5289 4.35602 18.6181 4.08969 18.6 3.81958C18.582 3.54948 18.4582 3.29738 18.2555 3.11796Z"
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
                <svg
                    v-if="showChildren"
                    height="18"
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                >
                    <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                    <path
                        fill="#9C7EEC"
                        d="M246.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L224 109.3 361.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160zm160 352l-160-160c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L224 301.3 361.4 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3z"
                    />
                </svg>
                <svg
                    v-else
                    height="18"
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                >
                    <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.
                    -->
                    <path
                        fill="#9C7EEC"
                        d="M246.6 470.6c-12.5 12.5-32.8 12.5-45.3 0l-160-160c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L224 402.7 361.4 265.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-160 160zm160-352l-160 160c-12.5 12.5-32.8 12.5-45.3 0l-160-160c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L224 210.7 361.4 73.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3z"
                    />
                </svg>
            </button>
            <button
                v-if="childrenNotSubskills.length != 0"
                @click.stop="toggleChildren"
                class="btn me-2 ci-btn"
            >
                <!-- Collapse icon -->
                <svg
                    v-if="!showChildren"
                    height="18"
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                >
                    <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                    <path
                        fill="#9C7EEC"
                        d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"
                    />
                </svg>
                <svg
                    v-else
                    height="18"
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                >
                    <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.
                    -->
                    <path
                        fill="#9C7EEC"
                        d="M201.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 205.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z"
                    />
                </svg>
            </button>
        </div>
    </button>

    <!-- Sub skills -->
    <!-- Instructor Role -->
    <SkillsListChildNonStudent
        v-if="
            (showSubskills && role == 'instructor') ||
            (showSubskills && role == 'editor')
        "
        v-for="subSkill in subSkills"
        :id="subSkill.id"
        :children="subSkill.children"
        :type="subSkill.type"
        :level="subSkill.level"
        :name="subSkill.name"
        :role="role"
        :depth="depth + 1"
    >
    </SkillsListChildNonStudent>
    <!-- Admin Role -->
    <SkillsListChildNonStudent
        v-else-if="showSubskills && isFiltered == 'filtered'"
        v-for="subSkill in subSkills"
        :id="subSkill.id"
        :children="subSkill.children"
        :type="subSkill.type"
        :level="subSkill.level"
        :name="subSkill.name"
        :role="role"
        :isFiltered="isFiltered"
        :DeleteSkill="DeleteSkill"
        :depth="depth + 1"
    >
    </SkillsListChildNonStudent>
    <SkillsListChildNonStudent
        v-else-if="showSubskills && isFiltered == 'available'"
        v-for="subSkill in subSkills"
        :id="subSkill.id"
        :children="subSkill.children"
        :type="subSkill.type"
        :level="subSkill.level"
        :name="subSkill.name"
        :role="role"
        :isFiltered="subSkill.is_filtered"
        :DeleteSkill="DeleteSkill"
        :depth="depth + 1"
    >
    </SkillsListChildNonStudent>

    <!-- Recursive nesting of component -->
    <!-- if parent is filtered, show children as filtered also -->
    <!-- Instructor Role -->
    <SkillsListChildNonStudent
        v-if="
            (showChildren && role == 'instructor') ||
            (showChildren && role == 'editor')
        "
        v-for="child in childrenNotSubskills"
        :id="child.id"
        :children="child.children"
        :type="child.type"
        :level="child.level"
        :name="child.name"
        :role="role"
        :depth="depth + 1"
    >
    </SkillsListChildNonStudent>
    <!-- Admin Role -->
    <SkillsListChildNonStudent
        v-else-if="showChildren && isFiltered == 'filtered'"
        v-for="child in childrenNotSubskills"
        :id="child.id"
        :children="child.children"
        :type="child.type"
        :level="child.level"
        :name="child.name"
        :role="role"
        :isFiltered="isFiltered"
        :DeleteSkill="DeleteSkill"
        :depth="depth + 1"
    >
    </SkillsListChildNonStudent>
    <SkillsListChildNonStudent
        v-else-if="showChildren && isFiltered == 'available'"
        v-for="child in childrenNotSubskills"
        :id="child.id"
        :children="child.children"
        :type="child.type"
        :level="child.level"
        :name="child.name"
        :role="role"
        :isFiltered="child.is_filtered"
        :DeleteSkill="DeleteSkill"
        :depth="depth + 1"
    >
    </SkillsListChildNonStudent>
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
    color: #53389e;
    font-size: 16px;
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

/* Domains */
.domains {
    width: 360px;
    height: 71px;
    color: black;
    font-size: 20px;
    font-weight: 400;
    border-color: black;
    /* flex-direction: column; */
    background-position: right;
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

.four-row-domain-name {
    font-size: 12px;
}

.is-filtered {
    background-color: lightsalmon;
}

.is-filtered:hover {
    background-color: darksalmon;
}

.grade-school-level {
    border-color: #33b3a6;
}

.middle-school-level {
    border-color: #008000;
}

.high-school-level {
    border-color: #ccac00;
}

.college-level {
    border-color: #ffa500;
}

.phd-level {
    border-color: #cc0000;
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
    .skill-button {
        width: 293px;
        height: 70px;
        font-size: 14px;
    }

    .two-row-domain-name {
        font-size: 12px;
    }

    .three-row-domain-name {
        font-size: 10px;
    }

    .four-row-domain-name {
        font-size: 8px;
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
