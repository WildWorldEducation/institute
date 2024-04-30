<script>
export default {
    setup() {
        return {};
    },
    data() {
        return {
            showChildren: null,
            showSubskills: null,
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

        if (localStorage.getItem(this.id + 'sub') == 'true') {
            this.showSubskills = true;
        } else {
            this.showSubskills = false;
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
        class="skill-button d-flex justify-content-between"
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
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M6.34811 20.0423L6.34811 13.6494L-0.0358702 13.6583C-0.320945 13.6579 -0.594203 13.5444 -0.795782 13.3428C-0.997361 13.1412 -1.11082 12.868 -1.11132 12.5829L-1.11729 7.41477C-1.1168 7.1297 -1.00334 6.85644 -0.801757 6.65486C-0.600179 6.45328 -0.326921 6.33982 -0.0418461 6.33933L6.3481 6.34231L6.3481 -0.0506238C6.34659 -0.193451 6.3736 -0.335145 6.42756 -0.467396C6.48152 -0.599646 6.56134 -0.719794 6.66234 -0.820794C6.76334 -0.921794 6.88349 -1.00161 7.01574 -1.05557C7.14799 -1.10953 7.28969 -1.13655 7.43251 -1.13503L12.5827 -1.12308C12.8678 -1.12259 13.141 -1.00913 13.3426 -0.807549C13.5442 -0.60597 13.6577 -0.332713 13.6582 -0.047637L13.6552 6.34231L20.0481 6.34231C20.3325 6.34248 20.6052 6.45552 20.8063 6.65661C21.0074 6.8577 21.1204 7.13039 21.1206 7.41477L21.1325 12.565C21.1324 12.8494 21.0193 13.122 20.8182 13.3231C20.6171 13.5242 20.3444 13.6373 20.0601 13.6374L13.6552 13.6494L13.6641 20.0334C13.6636 20.3184 13.5502 20.5917 13.3486 20.7933C13.147 20.9948 12.8738 21.1083 12.5887 21.1088L7.43252 21.1267C7.28969 21.1282 7.148 21.1012 7.01575 21.0473C6.88349 20.9933 6.76335 20.9135 6.66235 20.8125C6.56135 20.7115 6.48153 20.5913 6.42757 20.4591C6.37361 20.3268 6.34659 20.1851 6.34811 20.0423Z"
                        fill="#9C7EEC"
                    />
                </svg>
            </button>
            <RouterLink
                :to="'/skills/edit/' + id"
                v-if="role == 'admin'"
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
            </RouterLink>

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
                >
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
                    <path
                        d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
                        fill="#9C7EEC"
                    />
                </svg>
            </button>
        </div>
    </button>

    <!-- Sub skills -->
    <!-- Instructor Role -->
    <SkillsListChildNonStudent
        v-if="showSubskills && role == 'instructor'"
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
        v-if="showChildren && role == 'instructor'"
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
    font-size: 14px;
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
