<script>
// Import the store.
import { useTagsStore } from '../../stores/TagsStore.js';
import { useSkillTagsStore } from '../../stores/SkillTagsStore.js';
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useSkillTreeStore } from '../../stores/SkillTreeStore.js';
import { useUserSkillsStore } from '../../stores/UserSkillsStore.js';
import { useSessionDetailsStore } from '../../stores/SessionDetailsStore.js';
import { useShowSkillStore } from '../../stores/ShowSkillStore.js';

// Import components
import FlagModals from './FlagModals.vue';
import Forum from './forum/Forum.vue';

export default {
    setup() {
        const tagsStore = useTagsStore();
        const skillTagsStore = useSkillTagsStore();
        const userDetailsStore = useUserDetailsStore();
        const skillsStore = useSkillsStore();
        const skillTreeStore = useSkillTreeStore();
        const userSkillsStore = useUserSkillsStore();
        const sessionDetailsStore = useSessionDetailsStore();
        const showSkillStore = useShowSkillStore();

        // If method hasnt been run before.
        if (tagsStore.tagsList.length == 0) {
            // Run the GET request.
            tagsStore.getTagsList();
        }

        return {
            tagsStore,
            skillTagsStore,
            userDetailsStore,
            skillsStore,
            skillTreeStore,
            userSkillsStore,
            sessionDetailsStore,
            showSkillStore
        };
    },
    data() {
        return {
            skillUrl: this.$route.params.skillUrl,
            skillId: null,
            skill: {},
            userSkills: [],
            isMastered: false,
            isUnlocked: false,
            filters: [],
            showFlaggingModal: false,
            ancestor: this.$route.params.id,
            // Accessible list used to find nearest un-lockable node.
            accessibleSkills: [],
            showAncestorLink: false,
            isMobileCheck: window.innerWidth,
            showConfirmModal: false,
            isSkillLoaded: false,
            randomNum: 0,
            goalSteps: [],
            goalExists: false,
            showTutorialTip1: true,
            showTutorialTip2: false,
            showTutorialTip3: false,
            showTutorialTip4: false,
            showTutorialTip5: false,
            showTutorialTip6: false
        };
    },
    components: {
        Forum,
        FlagModals
    },

    async created() {
        await this.getSkill();
        this.isSkillLoaded = true;
        if (this.sessionDetailsStore.isLoggedIn) {
            await this.getUserSkills();
        }

        if (!this.isUnlocked) this.nearestAccessibleAncestor(this.skill);
        await this.checkIfGoalExists();
    },
    methods: {
        async getSkill() {
            // solution for image to be changed when we change it from AWS
            this.randomNum = Math.random();
            // // Load the skill data
            await this.showSkillStore.findSkill(this.skillUrl);
            this.skill = this.showSkillStore.skill;
            this.skillId = this.skill.id;

            // Meta title for SEO
            document.title = this.skill.name + ' - The Collins Institute';

            //Load skill filters
            this.getSkillFilters();

            const icon = document.getElementsByTagName('svg');
            if (icon.length > 0) {
                icon[0].style.height = '50px';
            }

            // Record that the user visited this skill.
            if (this.userDetailsStore.role == 'student')
                this.recordSkillVisit(this.skillId);
        },
        recordSkillVisit(skillId) {
            fetch('/skills/record-visit/' + skillId);
        },
        async getSkillFilters() {
            // Run the GET request.
            if (this.skillTagsStore.skillTagsList.length == 0)
                await this.skillTagsStore.getSkillTagsList();

            for (let i = 0; i < this.skillTagsStore.skillTagsList.length; i++) {
                if (
                    this.skillTagsStore.skillTagsList[i].skill_id ==
                    this.skillId
                ) {
                    this.filters.push(
                        this.skillTagsStore.skillTagsList[i].tag_id
                    );
                }
            }
        },
        async getUserSkills() {
            const res = await fetch(
                '/user-skills/filtered-unnested-list/' +
                    this.userDetailsStore.userId
            );
            const data = await res.json();
            this.userSkills = data;
            for (let i = 0; i < this.userSkills.length; i++) {
                if (this.userSkills[i].id == this.skill.id) {
                    if (this.userSkills[i].is_mastered == 1) {
                        this.isMastered = true;
                    }
                    if (this.userSkills[i].is_accessible == 1)
                        this.isUnlocked = true;
                }
                // also get the accessible skill list of this user for the find nearest accessible ancestor method
                if (this.userSkills[i].is_accessible == 1) {
                    if (this.userSkills[i].type != 'domain') {
                        this.accessibleSkills.push(this.userSkills[i]);
                    }
                }
            }
        },
        async MakeMastered() {
            await this.userSkillsStore.MakeMastered(
                this.userDetailsStore.userId,
                this.skillId
            );
            this.getUserSkills();
        },

        closeFlagModal() {
            this.showModal = false;
        },
        /**
         * Find the closest ancestor of this skill node that is not mastered, but is unlocked
         * For now I am using recursive method to traverse the tree nodes. This might be costly and need to test more when the skills number expand
         */
        nearestAccessibleAncestor(node) {
            const inAccessibleList = this.accessibleSkills.find(
                (as) => as.id == node.id
            );

            // stop when the first ancestor node that is unlocked for the student
            if (inAccessibleList) {
                this.ancestor = node.url;
                // show the button to go to the skill when the link is ready
                this.showAncestorLink = true;
                return;
            }

            // if node is a super skill, check its subskills.
            let subskills = [];
            if (node.type == 'super') {
                for (let i = 0; i < this.accessibleSkills.length; i++) {
                    if (
                        this.accessibleSkills[i].type == 'sub' &&
                        this.accessibleSkills[i].parent == node.id &&
                        this.accessibleSkills[i].is_mastered != 1
                    ) {
                        subskills.push(this.accessibleSkills[i]);
                    }
                }
            }
            if (subskills.length > 0) {
                this.ancestor = subskills[0].url;
                // show the button to go to the skill when the link is ready
                this.showAncestorLink = true;
                return;
            }

            fetch('/skills/show/' + node.parent)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    // recursively call the function with parent node data
                    return this.nearestAccessibleAncestor(data);
                });
        },
        copyShareableURLToClipBoard() {
            navigator.clipboard.writeText(window.location.href);
            this.showConfirmModal = true;
        },
        imageUrlAlternative(event) {
            event.target.src = '/images/skill-avatar/recurso.png';
        },
        /*
         * Goals: this feature allows students to choose a skill to be a goal,
         * to create a pathway for them to get to that goal.
         */
        async checkIfGoalExists() {
            const result = await fetch(
                '/goals/' + this.userDetailsStore.userId + '/' + this.skillId
            );
            const data = await result.json();
            this.goalExists = data.goalExists;
        },

        async confirmCreateGoal(skill) {
            let text = `Are you sure you want to create a goal for ${skill.name}?`;
            if (confirm(text) == true) {
                // Will need this list to create the goal steps.
                await this.userSkillsStore.getFilteredUnnestedList(
                    this.userDetailsStore.userId
                );
                this.createGoal(skill);
            }
        },
        createGoal(skill) {
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
                    skillId: this.skillId,
                    goalSteps: this.goalSteps
                })
            };
            const url = '/goals/' + this.userDetailsStore.userId + '/add';
            fetch(url, requestOptions).then(() => {
                alert('A goal for this skill has been added on the Hub page.');
            });
        },
        progressTutorial(step) {
            if (step == 1) {
                this.showTutorialTip1 = false;
                this.showTutorialTip2 = true;
            } else if (step == 2) {
                this.showTutorialTip2 = false;
                this.showTutorialTip3 = true;
            } else if (step == 3) {
                this.showTutorialTip3 = false;
                this.showTutorialTip4 = true;
            } else if (step == 4) {
                this.showTutorialTip4 = false;
                this.showTutorialTip5 = true;
            } else if (step == 5) {
                this.showTutorialTip5 = false;
                this.showTutorialTip6 = true;
            } else if (step == 6) {
                this.showTutorialTip6 = false;
            }
        }
    },
    /**
     * Because in Vue when only the params change the component instance will NOT be load
     * so we have to watch for the $route and re fetch data our self
     */
    watch: {
        async $route(to, from) {
            // react to route changes...
            this.skillUrl = to.params.skillUrl;
            await this.getSkill();
            await this.getUserSkills();
        }
    }
};
</script>

<template>
    <div class="container mt-3">
        <div
            id="skill-info-container"
            :class="{ domain: skill.type == 'domain' }"
        >
            <!-- Name and description -->
            <div>
                <div class="d-flex justify-content-between top-row">
                    <h1 class="heading">{{ skill.name }}</h1>
                    <!-- Take assessment btn-->
                    <!-- If this skill is not unlocked yet, and user is student, instead show link to its closest unlocked ancestor -->
                    <router-link
                        v-if="
                            userDetailsStore.role == 'student' &&
                            !isUnlocked &&
                            !isMastered &&
                            showAncestorLink
                        "
                        :to="'/skills/' + ancestor"
                        class="btn assessment-btn secondary-btn me-1"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 448 512"
                            width="20"
                            class="primary-icon"
                        >
                            <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                            <path
                                d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"
                            />
                        </svg>
                        &nbsp; Go to Nearest Unlocked Skill
                    </router-link>
                    <!-- Assessment -->
                    <router-link
                        v-else-if="
                            userDetailsStore.role == 'student' &&
                            isUnlocked &&
                            !isMastered
                        "
                        class="btn me-1 assessment-btn secondary-btn"
                        :to="skill.id + '/assessment'"
                    >
                        <!-- Half star icon -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 576 512"
                            width="22"
                            class="primary-icon"
                        >
                            <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                            <path
                                d="M288 0c-12.2 .1-23.3 7-28.6 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3L288 439.8 288 0zM429.9 512c1.1 .1 2.1 .1 3.2 0l-3.2 0z"
                            />
                        </svg>
                        Take the Test
                        <!-- Half star icon -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 576 512"
                            width="22"
                            class="primary-icon"
                        >
                            <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                            <path
                                d="m 169.24356,0 c 12.2,0.1 23.3,7 28.6,18 l 64.4,132.3 143.6,21.2 c 12,1.8 22,10.2 25.7,21.7 3.7,11.5 0.7,24.2 -7.9,32.7 l -104.2,103.1 24.6,145.7 c 2,12 -3,24.2 -12.9,31.3 -9.9,7.1 -23,8 -33.8,2.3 l -128.1,-68.5 z M 27.343555,512 c -1.1,0.1 -2.1,0.1 -3.2,0 z"
                                id="path17"
                            />
                        </svg>
                    </router-link>
                    <!-- If not logged in, go to Login page -->
                    <router-link
                        v-else-if="!sessionDetailsStore.isLoggedIn"
                        class="btn me-1 assessment-btn secondary-btn"
                        to="/login"
                    >
                        <!-- Half star icon -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 576 512"
                            width="22"
                            class="primary-icon"
                        >
                            <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                            <path
                                d="M288 0c-12.2 .1-23.3 7-28.6 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3L288 439.8 288 0zM429.9 512c1.1 .1 2.1 .1 3.2 0l-3.2 0z"
                            />
                        </svg>
                        Take the Test
                        <!-- Half star icon -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 576 512"
                            width="22"
                            class="primary-icon"
                        >
                            <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                            <path
                                d="m 169.24356,0 c 12.2,0.1 23.3,7 28.6,18 l 64.4,132.3 143.6,21.2 c 12,1.8 22,10.2 25.7,21.7 3.7,11.5 0.7,24.2 -7.9,32.7 l -104.2,103.1 24.6,145.7 c 2,12 -3,24.2 -12.9,31.3 -9.9,7.1 -23,8 -33.8,2.3 l -128.1,-68.5 z M 27.343555,512 c -1.1,0.1 -2.1,0.1 -3.2,0 z"
                                id="path17"
                            />
                        </svg>
                    </router-link>
                </div>
                <!-- Tooltip -->
                <div v-if="showTutorialTip2" class="d-flex justify-content-end">
                    <div class="info-panel bg-light rounded p-2 mb-2">
                        <p>
                            This is where you can take the assessment for the
                            skill.
                        </p>
                        <button
                            class="btn primary-btn"
                            @click="progressTutorial(2)"
                        >
                            next
                        </button>
                    </div>
                </div>
                <!-- Description only seen by admins -->
                <div
                    v-if="userDetailsStore.role == 'admin'"
                    class="row pe-4 ps-4 ps-md-0 skill-description"
                >
                    <p>{{ skill.description }}</p>
                </div>
                <!-- A line divide -->
                <hr class="border border-2 opacity-100 hr" />
            </div>
            <!-- Buttons -->
            <div class="row mb-2">
                <div class="col d-flex justify-content-between">
                    <div
                        class="d-flex"
                        :class="{
                            'justify-content-center': isMobileCheck < 576
                        }"
                    >
                        <!-- Edit skill btn-->
                        <router-link
                            v-if="sessionDetailsStore.isLoggedIn"
                            :to="'/skills/edit/' + skillUrl"
                            class="edit-btn btn primary-btn me-1"
                            ><span v-if="isMobileCheck > 576">Edit &nbsp;</span>
                            <!-- Pencil icon -->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                width="20"
                                height="20"
                                fill="white"
                            >
                                <path
                                    d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z"
                                />
                            </svg>
                        </router-link>
                        <!-- Show version history -->
                        <router-link
                            v-if="
                                userDetailsStore.role == 'admin' ||
                                userDetailsStore.role == 'editor'
                            "
                            :to="'/skills/history/' + this.skillUrl"
                            class="btn primary-btn me-1"
                            ><span v-if="isMobileCheck > 576"
                                >History&nbsp;</span
                            >
                            <!-- History icon -->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                width="18"
                                height="20"
                                fill="white"
                            >
                                <path
                                    d="M75 75L41 41C25.9 25.9 0 36.6 0 57.9L0 168c0 13.3 10.7 24 24 24l110.1 0c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24l0 104c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65 0-94.1c0-13.3-10.7-24-24-24z"
                                />
                            </svg>
                        </router-link>
                        <!-- Create goal button -->
                        <button
                            v-if="
                                skill.type != 'domain' &&
                                sessionDetailsStore.isLoggedIn &&
                                isMastered == false &&
                                goalExists == false &&
                                userDetailsStore.role == 'student'
                            "
                            class="btn primary-btn"
                            @click="confirmCreateGoal(this.skill)"
                        >
                            Create goal&nbsp;
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                fill="white"
                                width="20"
                                heigth="20"
                            >
                                <!-- !Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                                <path
                                    d="M448 256A192 192 0 1 0 64 256a192 192 0 1 0 384 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 80a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm0-224a144 144 0 1 1 0 288 144 144 0 1 1 0-288zM224 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"
                                />
                            </svg>
                        </button>
                    </div>
                    <div class="d-flex justify-content-end">
                        <!-- Sharable URL -->
                        <button
                            @click="copyShareableURLToClipBoard"
                            class="btn me-1"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                                width="20"
                                heigth="20"
                            >
                                <path
                                    class="primary-icon"
                                    d="M352 224c53 0 96-43 96-96s-43-96-96-96s-96 43-96 96c0 4 .2 8 .7 11.9l-94.1 47C145.4 170.2 121.9 160 96 160c-53 0-96 43-96 96s43 96 96 96c25.9 0 49.4-10.2 66.6-26.9l94.1 47c-.5 3.9-.7 7.8-.7 11.9c0 53 43 96 96 96s96-43 96-96s-43-96-96-96c-25.9 0-49.4 10.2-66.6 26.9l-94.1-47c.5-3.9 .7-7.8 .7-11.9s-.2-8-.7-11.9l94.1-47C302.6 213.8 326.1 224 352 224z"
                                />
                            </svg>
                        </button>
                        <!-- Flag button -->
                        <button
                            v-if="sessionDetailsStore.isLoggedIn"
                            @click="showFlaggingModal = true"
                            class="btn"
                            b-tooltip.hover
                            title="Report this skill to the admin if it has errors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                                class="flag-icon"
                            >
                                <path
                                    class="primary-icon"
                                    d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32V64 368 480c0 17.7 14.3 32 32 32s32-14.3 32-32V352l64.3-16.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30V66.1c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L64 48V32z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
                <!-- Tooltip -->
                <div v-if="showTutorialTip3" class="mt-2">
                    <div
                        class="info-panel bg-light rounded p-2 mb-2 narrow-info-panel"
                    >
                        <p>
                            Here you can suggest an edit to this skill page or
                            quiz, or create a goal for this skill, so you can
                            work your way towards it.
                        </p>
                        <button
                            class="btn primary-btn"
                            @click="progressTutorial(3)"
                        >
                            next
                        </button>
                    </div>
                </div>
                <div
                    v-if="showTutorialTip4"
                    class="mt-2 d-flex justify-content-end"
                >
                    <div
                        class="info-panel bg-light rounded p-2 mb-2 narrow-info-panel"
                    >
                        <p>
                            Here you can share a link to this skill with a
                            friend, or flag this page as problematic.
                        </p>
                        <button
                            class="btn primary-btn"
                            @click="progressTutorial(4)"
                        >
                            next
                        </button>
                    </div>
                </div>

                <!-- A line divide -->
                <hr class="border border-1 opacity-100 hr mt-2" />
            </div>
            <!-- Content -->
            <div class="row">
                <!-- Mastery Requirements -->
                <div class="col-md-8 order-2 order-md-1">
                    <div v-if="skill.type != 'domain'">
                        <div class="d-flex flex-column">
                            <div class="mastery-requirements">
                                <h2 class="h4 secondary-heading">
                                    Requirements for mastery
                                </h2>
                                <div v-html="skill.mastery_requirements"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Infobox -->
                <div class="col-md-4 order-1 order-md-2">
                    <div class="info-box p-2 mb-2">
                        <!-- AWS S3 hosted feature image -->
                        <!-- Using random number otherwise url doesnt change (cache)-->
                        <a
                            :href="
                                'https://institute-skill-infobox-images.s3.amazonaws.com/' +
                                skillUrl +
                                '?' +
                                randomNum
                            "
                        >
                            <img
                                :src="
                                    'https://institute-skill-infobox-image-thumbnails.s3.amazonaws.com/' +
                                    skillUrl +
                                    '?' +
                                    randomNum
                                "
                                @error="imageUrlAlternative"
                                class="rounded img-fluid"
                            />
                        </a>
                        <!-- Grade level -->
                        <div class="mt-2">
                            <h2 class="h4 secondary-heading">Level</h2>
                            <span v-if="skill.level == 'grade_school'"
                                >Grade School</span
                            >
                            <span v-else-if="skill.level == 'middle_school'"
                                >Middle School</span
                            >
                            <span v-else-if="skill.level == 'high_school'"
                                >High School</span
                            >
                            <span v-else-if="skill.level == 'college'"
                                >College</span
                            >
                            <span v-else-if="skill.level == 'phd'">PHD</span>
                        </div>
                        <span v-if="skill.type == 'super'"
                            >This assessment will draw questions from its
                            cluster nodes' question banks.</span
                        >
                        <div class="mt-2">
                            <h2 class="h4 secondary-heading">Author</h2>
                            <!-- Author Icon -->
                            <div
                                v-if="skill.is_human_edited"
                                b-tooltip.hover
                                title="This page was written or edited by a human"
                                style="height: 50px"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 320 512"
                                    height="22"
                                >
                                    <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                                    <path
                                        d="M112 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm40 304l0 128c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-223.1L59.4 304.5c-9.1 15.1-28.8 20-43.9 10.9s-20-28.8-10.9-43.9l58.3-97c17.4-28.9 48.6-46.6 82.3-46.6l29.7 0c33.7 0 64.9 17.7 82.3 46.6l58.3 97c9.1 15.1 4.2 34.8-10.9 43.9s-34.8 4.2-43.9-10.9L232 256.9 232 480c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-128-16 0z"
                                        fill="black"
                                    />
                                </svg>
                            </div>
                            <div
                                v-else
                                b-tooltip.hover
                                title="This page was written by an AI"
                                style="height: 50px"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 640 512"
                                    height="22"
                                >
                                    <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                                    <path
                                        d="M320 0c17.7 0 32 14.3 32 32l0 64 120 0c39.8 0 72 32.2 72 72l0 272c0 39.8-32.2 72-72 72l-304 0c-39.8 0-72-32.2-72-72l0-272c0-39.8 32.2-72 72-72l120 0 0-64c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224l16 0 0 192-16 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-16 0 0-192 16 0z"
                                        fill="black"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- A line divide -->
            <div v-if="userDetailsStore.role == 'admin'">
                <div class="row">
                    <div class="col col-md-8 p-4 p-md-0">
                        <hr class="border border-2 opacity-100 hr" />
                    </div>
                </div>
                <!-- Filters -->
                <div class="row mt-3">
                    <div class="h1-title">Filter</div>
                    <label
                        v-for="tag in tagsStore.tagsList"
                        class="control control-checkbox"
                    >
                        <span class="my-auto mx-2 me-4"> {{ tag.name }}</span>
                        <input
                            type="checkbox"
                            :value="tag.id"
                            v-model="filters"
                            disabled
                        />
                        <div class="control_indicator"></div>
                    </label>
                </div>
            </div>
        </div>
        <!-- Posts -->
        <div v-if="skill.type != 'domain'">
            <div class="row mt-3 mb-3">
                <Forum v-if="isSkillLoaded" :skillId="skill.id" />
            </div>
        </div>
        <p>&nbsp;</p>
    </div>
    <div
        v-if="showConfirmModal"
        @click="showConfirmModal = false"
        class="modal"
    >
        <!-- Confirm Modal -->
        <div class="modal-content asking-modal">
            <p>URL copied to clipboard</p>

            <!-- Buttons row -->
            <div class="d-flex justify-content-end gap-2">
                <button
                    type="button"
                    class="btn primary-btn modal-btn"
                    @click="showConfirmModal = false"
                >
                    <span class="d-none d-md-block"> OK </span>
                    <!-- X icon Only show when in Phone View -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="18"
                        height="18"
                        fill="white"
                        class="d-md-none"
                    >
                        <path
                            d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
                        />
                    </svg>
                </button>
            </div>
        </div>
    </div>
    <!-- flag modals component -->
    <FlagModals
        v-if="showFlaggingModal"
        :userId="userDetailsStore.userId"
        contentType="skill"
        :contentId="skillId"
    />

    <!-- Tooltip modal -->
    <div
        v-if="showTutorialTip1 || showTutorialTip5 || showTutorialTip6"
        class="modal"
    >
        <div class="modal-content">
            <div v-if="showTutorialTip1">
                <p>
                    This page is where you can learn about, and take a test to
                    try to master, this skill.
                </p>
                <button class="btn primary-btn" @click="progressTutorial(1)">
                    next
                </button>
            </div>
            <div v-else-if="showTutorialTip5">
                <p>
                    The "Requirements for mastery" section explains everything
                    one needs to learn to master the skill.
                </p>
                <button class="btn primary-btn" @click="progressTutorial(5)">
                    next
                </button>
            </div>
            <div v-else-if="showTutorialTip6">
                <p>
                    At the bottom of the page, in the "Best Places To Learn
                    This" section, you can find various sites and resources to
                    learn about this topic.
                </p>
                <button class="btn primary-btn" @click="progressTutorial(6)">
                    close
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Tooltips */
.info-panel {
    border-color: var(--primary-color);
    border-width: 2px;
    border-style: solid;
    width: fit-content;
}

.narrow-info-panel {
    max-width: 300px;
}

.edit-btn {
    display: flex;
}

.assessment-btn {
    height: auto;
    max-height: 48px;
    border: 3px solid var(--secondary-contrast-color);
    font-weight: 500;
    padding: 5px;
}

.info-box {
    border: 1px solid #a2a9b1;
    color: black;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.skill-description {
    font-family: 'Poppins', sans-serif;
    color: #888;
}

.mastery-requirements {
    padding-left: 30px;
    padding-right: 30px;
    padding-top: 10px;
    padding-bottom: 10px;
    background-color: rgba(255, 255, 255, 0.692);
    border-radius: 5px;
    width: 98%;
}

.hr {
    border-color: var(--dark-color) !important;
}

#skill-info-container {
    background-color: #f2edff;
    border-radius: 12px;
    padding: 10px 30px;
}

.domain {
    border-width: 4px;
    border-color: black;
    border-style: solid;
}

.red-btn {
    background-color: #e24d4d;
    color: white;
    border: 1px solid #d33622;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.red-btn:hover {
    background-color: #cc3535;
    color: white;
}

.flag-icon {
    height: 20px !important;
}

.modal-btn {
    width: 25%;
}

/* Specific phone view css */
@media (max-width: 576px) {
    h2 {
        text-align: center;
    }

    #skill-info-container {
        background-color: #f2edffcc;
        border-radius: 12px;
        padding: 10px 20px;
    }

    .mastery-requirements {
        width: 100%;
        margin-left: 0px;
        padding-left: 0px;
        padding-right: 0px;
    }

    .skill-name {
        margin-top: 5px;
        font-size: 25px;
        margin: 0px 5px;
    }

    .modal-content {
        margin-top: 100%;
        width: 90%;
    }

    .skill-description {
        font-size: 16px;
        text-align: center;
        margin-top: 5px;
    }

    .h1-title {
        font-size: 20px;
        margin-left: 4px;
    }

    .modal-btn {
        width: fit-content;
    }

    .reason-popup {
        width: 100%;
        top: 25%;
    }

    .top-row {
        flex-direction: column;
    }
}

/* ************************* */
/* Tablet Styling */
@media (min-width: 577px) and (max-width: 1023px) {
    .modal-content {
        margin-top: 60%;
        width: 70%;
    }

    #skill-info-container {
        padding: 5px 15px;
    }

    .modal-btn {
        width: fit-content;
    }
}

/* Small devices (portrait phones) */
@media (max-width: 480px) {
    /* Modal Content/Box */
    .modal-content {
        width: 90% !important;

        margin: auto;
        margin-top: 30%;
    }
}
</style>
