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
            showSubskills: false,
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
    methods: {
        toggleChildren() {
            this.showChildren = !this.showChildren;
        },
        toggleSubSkills() {
            this.showSubskills = !this.showSubskills;
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
        class="skill-button d-flex justify-content-between"
        @click="toggleChildren"
    >
        <!-- Emoticons -->
        <div v-if="level != 'domain'">
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
        <span style="text-align: left">{{ name }}</span>
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
            <button
                v-if="type != 'domain' || isMastered != 1"
                v-show="isUnlocked == 1"
                @click.stop="$router.push('/skills/' + id)"
                class="btn me-2 ci-btn"
            >
                <!-- Eye icon -->
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="25"
                    width="30"
                    viewBox="0 0 576 512"
                >
                    <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                    <path
                        d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"
                        fill="#9C7EEC"
                    />
                </svg>
            </button>
        </div>
        <button
            class="d-none btn"
            :class="{
                'top-level-skills-mobile-buttons': depth == 1,
                'mobile-buttons': depth > 1
            }"
            @click.stop="ShowMobileButtonsModal()"
        >
            <svg
                width=" 25"
                height="9"
                viewBox="0 0 25 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle
                    cx="3.09803"
                    cy="3.09803"
                    r="3.09803"
                    transform="matrix(0.653216 -0.757172 -0.757172 -0.653216 5.19141 8.73889)"
                    fill="#FFFFFF"
                />
                <circle
                    cx="3.09803"
                    cy="3.09803"
                    r="3.09803"
                    transform="matrix(0.653216 -0.757172 -0.757172 -0.653216 12.8223 8.73889)"
                    fill="#FFFFFF"
                />
                <circle
                    cx="3.09803"
                    cy="3.09803"
                    r="3.09803"
                    transform="matrix(0.653216 -0.757172 -0.757172 -0.653216 20.4531 8.73889)"
                    fill="#FFFFFF"
                />
            </svg>
        </button>
    </button>
    <!-- Modal for mobile ellipsis buttons -->
    <div
        v-if="showModal"
        id="button-modal"
        class="modal"
        @click="HideMobileButtonsModal()"
    >
        <!-- Modal content -->
        <div class="modal-content d-flex">
            <!-- Buttons -->
            <button
                v-if="type == 'sub'"
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
            <router-link :to="'/skills/' + id" class="btn me-2" role="button">
                <!-- Eye icon -->
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="25"
                    width="30"
                    viewBox="0 0 576 512"
                >
                    <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                    <path
                        d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"
                        fill="#9C7EEC"
                    />
                </svg>
            </router-link>
        </div>
    </div>

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
        :DeleteSkill="DeleteSkill"
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
        :DeleteSkill="DeleteSkill"
        :depth="depth + 1"
    >
    </SkillsListChildStudent>
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

/* For the top level skills */
.domains {
    color: black;
    font-size: 20px;
    font-weight: 400;
    border-color: black;
    background-position: right;
    flex-direction: row;
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

/* Images for the different top level domains (skills) */
.spoken-language-domain {
    background-image: url('/images/buttons/spoken-language.jpg');
}

.written-language-domain {
    background-image: url('/images/buttons/written-language.jpg');
}

.mathematics-domain {
    background-image: url('/images/buttons/mathematics.jpg');
}

.history-domain {
    background-image: url('/images/buttons/history.jpg');
}

.science-domain {
    background-image: url('/images/buttons/science.jpg');
}

.life-domain {
    background-image: url('/images/buttons/life.jpg');
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

/* Mobile */
/* The Modal for Mobile */
.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 1;
    /* Sit on top */
    left: 0;
    top: 0;
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    background-color: rgb(0, 0, 0);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
}

.modal-content {
    width: 30%;
    margin: auto;
    flex-direction: row;
    justify-content: center;
    margin-top: 100px;
}

@media (max-width: 480px) {
    .skill-button {
        font-size: 13px;
    }

    #buttons {
        display: none !important;
    }

    .mobile-buttons,
    .top-level-skills-mobile-buttons {
        display: flex !important;
        padding: none;
    }

    .mobile-buttons svg circle {
        fill: #9c7eec;
    }

    .top-level-skills-mobile-buttons svg circle {
        fill: #ffffff;
    }

    .skill-button {
        width: 293px;
        height: 70px;
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
