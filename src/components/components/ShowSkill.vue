<script>
// Import the store.
import { useTagsStore } from '../../stores/TagsStore.js';
import { useSkillTagsStore } from '../../stores/SkillTagsStore.js';
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useSkillTreeStore } from '../../stores/SkillTreeStore.js';
import { useUserSkillsStore } from '../../stores/UserSkillsStore.js';
import { useSessionDetailsStore } from '../../stores/SessionDetailsStore.js';

// Import Custom Components
import FlagModals from './FlagModals.vue';

// Nested component.
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
            sessionDetailsStore
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
            // accessible List that will use to find nearest un-lockable node
            accessibleSkills: [],
            showAncestorLink: false,
            isMobileCheck: window.innerWidth,
            showConfirmModal: false,
            isSkillLoaded: false
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
    },
    methods: {
        async getSkill() {
            // Load the skill data
            const res = await fetch('/skills/url/' + this.skillUrl);
            this.skill = await res.json();
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
                <div class="d-flex justify-content-between">
                    <h1 class="skill-name">{{ skill.name }}</h1>
                    <!-- Take assessment btn-->
                    <!-- If this skill is not unlocked yet, and user is student, instead show link to its closest unlocked ancestor -->
                    <router-link
                        :to="'/skills/' + ancestor"
                        v-if="
                            userDetailsStore.role == 'student' &&
                            !isUnlocked &&
                            !isMastered &&
                            showAncestorLink
                        "
                        class="btn purple-btn assessment-btn text-capitalize me-1"
                    >
                        <span v-if="isMobileCheck > 576"
                            >go to nearest unlockable skill&nbsp;</span
                        >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            width="18"
                            height="20"
                            fill="white"
                        >
                            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                            <path
                                d="M512 96c0 50.2-59.1 125.1-84.6 155c-3.8 4.4-9.4 6.1-14.5 5L320 256c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c53 0 96 43 96 96s-43 96-96 96l-276.4 0c8.7-9.9 19.3-22.6 30-36.8c6.3-8.4 12.8-17.6 19-27.2L416 448c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0c-53 0-96-43-96-96s43-96 96-96l39.8 0c-21-31.5-39.8-67.7-39.8-96c0-53 43-96 96-96s96 43 96 96zM117.1 489.1c-3.8 4.3-7.2 8.1-10.1 11.3l-1.8 2-.2-.2c-6 4.6-14.6 4-20-1.8C59.8 473 0 402.5 0 352c0-53 43-96 96-96s96 43 96 96c0 30-21.1 67-43.5 97.9c-10.7 14.7-21.7 28-30.8 38.5l-.6 .7zM128 352a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM416 128a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"
                            />
                        </svg>
                    </router-link>
                    <router-link
                        v-else-if="
                            userDetailsStore.role == 'student' &&
                            isUnlocked &&
                            !isMastered
                        "
                        class="btn purple-btn me-1 assessment-btn"
                        :to="skill.id + '/assessment'"
                    >
                        <svg
                            fill="#ffffff"
                            height="30"
                            width="30"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 512"
                        >
                            <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                            <path
                                d="M320 32c-8.1 0-16.1 1.4-23.7 4.1L15.8 137.4C6.3 140.9 0 149.9 0 160s6.3 19.1 15.8 22.6l57.9 20.9C57.3 229.3 48 259.8 48 291.9v28.1c0 28.4-10.8 57.7-22.3 80.8c-6.5 13-13.9 25.8-22.5 37.6C0 442.7-.9 448.3 .9 453.4s6 8.9 11.2 10.2l64 16c4.2 1.1 8.7 .3 12.4-2s6.3-6.1 7.1-10.4c8.6-42.8 4.3-81.2-2.1-108.7C90.3 344.3 86 329.8 80 316.5V291.9c0-30.2 10.2-58.7 27.9-81.5c12.9-15.5 29.6-28 49.2-35.7l157-61.7c8.2-3.2 17.5 .8 20.7 9s-.8 17.5-9 20.7l-157 61.7c-12.4 4.9-23.3 12.4-32.2 21.6l159.6 57.6c7.6 2.7 15.6 4.1 23.7 4.1s16.1-1.4 23.7-4.1L624.2 182.6c9.5-3.4 15.8-12.5 15.8-22.6s-6.3-19.1-15.8-22.6L343.7 36.1C336.1 33.4 328.1 32 320 32zM128 408c0 35.3 86 72 192 72s192-36.7 192-72L496.7 262.6 354.5 314c-11.1 4-22.8 6-34.5 6s-23.5-2-34.5-6L143.3 262.6 128 408z"
                            />
                        </svg>
                    </router-link>
                    <router-link
                        v-else-if="!sessionDetailsStore.isLoggedIn"
                        class="btn purple-btn me-1 assessment-btn"
                        to="/login"
                    >
                        <svg
                            fill="#ffffff"
                            height="30"
                            width="30"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 512"
                        >
                            <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                            <path
                                d="M320 32c-8.1 0-16.1 1.4-23.7 4.1L15.8 137.4C6.3 140.9 0 149.9 0 160s6.3 19.1 15.8 22.6l57.9 20.9C57.3 229.3 48 259.8 48 291.9v28.1c0 28.4-10.8 57.7-22.3 80.8c-6.5 13-13.9 25.8-22.5 37.6C0 442.7-.9 448.3 .9 453.4s6 8.9 11.2 10.2l64 16c4.2 1.1 8.7 .3 12.4-2s6.3-6.1 7.1-10.4c8.6-42.8 4.3-81.2-2.1-108.7C90.3 344.3 86 329.8 80 316.5V291.9c0-30.2 10.2-58.7 27.9-81.5c12.9-15.5 29.6-28 49.2-35.7l157-61.7c8.2-3.2 17.5 .8 20.7 9s-.8 17.5-9 20.7l-157 61.7c-12.4 4.9-23.3 12.4-32.2 21.6l159.6 57.6c7.6 2.7 15.6 4.1 23.7 4.1s16.1-1.4 23.7-4.1L624.2 182.6c9.5-3.4 15.8-12.5 15.8-22.6s-6.3-19.1-15.8-22.6L343.7 36.1C336.1 33.4 328.1 32 320 32zM128 408c0 35.3 86 72 192 72s192-36.7 192-72L496.7 262.6 354.5 314c-11.1 4-22.8 6-34.5 6s-23.5-2-34.5-6L143.3 262.6 128 408z"
                            />
                        </svg>
                    </router-link>
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
                            class="btn green-btn me-1"
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
                            class="btn purple-btn me-1"
                            ><span v-if="isMobileCheck > 576">History</span>
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
                        <!-- Question Bank -->
                        <router-link
                            v-if="
                                skill.type != 'domain' &&
                                skill.type != 'super' &&
                                sessionDetailsStore.isLoggedIn
                            "
                            class="btn purple-btn me-3"
                            :to="skillUrl + '/question-bank'"
                            ><span v-if="isMobileCheck > 576"
                                >Question Bank&nbsp;</span
                            >
                            <!-- Question icon -->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 384 512"
                                width="18"
                                height="20"
                                fill="white"
                            >
                                <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                <path
                                    d="M192 0c-41.8 0-77.4 26.7-90.5 64L64 64C28.7 64 0 92.7 0 128L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64l-37.5 0C269.4 26.7 233.8 0 192 0zm0 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM105.8 229.3c7.9-22.3 29.1-37.3 52.8-37.3l58.3 0c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L216 328.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24l0-13.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1l-58.3 0c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM160 416a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"
                                />
                            </svg>
                        </router-link>
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
                                <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                <path
                                    fill="#a48be6"
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
                                    fill="#a48be6"
                                    d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32V64 368 480c0 17.7 14.3 32 32 32s32-14.3 32-32V352l64.3-16.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30V66.1c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L64 48V32z"
                                />
                            </svg>
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
                                <div v-html="skill.mastery_requirements"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Infobox -->
                <div class="col-md-4 order-1 order-md-2">
                    <div class="info-box p-2 mb-2">
                        <!-- AWS S3 hosted feature image -->
                        <!-- Show a default skill avatar if skill not have image yet -->
                        <a
                            :href="
                                'https://institute-skill-infobox-images.s3.amazonaws.com/' +
                                skillUrl
                            "
                        >
                            <img
                                :src="
                                    'https://institute-skill-infobox-image-thumbnails.s3.amazonaws.com/' +
                                    skillUrl
                                "
                                @error="imageUrlAlternative"
                                class="rounded img-fluid"
                            />
                        </a>
                        <!-- Grade level -->
                        <div class="mt-3" style="color: #a48be6">
                            Level:
                            <strong>
                                <!-- <div class="h1-title">Level</div> -->
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
                                <span v-else-if="skill.level == 'phd'"
                                    >PHD</span
                                >
                            </strong>
                        </div>
                        <span v-if="skill.type == 'super'"
                            >This assessment will draw questions from its
                            cluster nodes' question banks.</span
                        >
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
            <div class="d-flex gap-4">
                <!-- Warn Triangle Icon -->
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    fill="grey"
                    width="45"
                    height="45"
                >
                    <path
                        d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
                    />
                </svg>
                <p>URL copied to clipboard</p>
            </div>
            <!-- Buttons row -->
            <div class="d-flex justify-content-end gap-2">
                <button
                    type="button"
                    class="btn green-btn modal-btn"
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
</template>

<style scoped>
.info-box {
    border: 1px solid #a2a9b1;
    color: black;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.skill-name {
    font-family: 'Poppins', sans-serif;
    font-size: 40px;
    color: #a48be6;
    font-weight: 800;
    margin-bottom: 0px;
    text-align: start;
}

.skill-description {
    font-family: 'Poppins', sans-serif;
    color: #888;
}

.h1-title {
    color: #a48be6;
    font-size: 30px;
    font-weight: 700;
    margin-bottom: 5px;
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
    border-color: #aea3ce !important;
}

#skill-info-container {
    background-color: #f2edff;
    border-radius: 12px;
    padding: 30px;
}

.domain {
    border-width: 4px;
    border-color: black;
    border-style: solid;
}

.purple-btn {
    background-color: #a48be6;
    color: white;
    border: 1px solid #7f56d9;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    max-width: fit-content;
    display: flex;
    align-items: center;
    height: 44px;
    text-wrap: nowrap;
}

.purple-btn:hover {
    background-color: #8f7bd6;
}

.assessment-btn {
    height: auto;
    max-height: 48px;
    margin-left: 10px;
}

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 44px;
}

.green-btn {
    background-color: #36c1af;
    color: white;

    display: flex;
    align-items: center;

    max-width: fit-content;
}

.green-btn:hover {
    background-color: #3eb3a3;
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

    h1 {
        font-size: 2.5rem;
    }

    #skill-info-container {
        background-color: #f2edffcc;
        border-radius: 12px;
        padding: 20px;
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
}

/* ************************* */
/* Tablet Styling */
@media (min-width: 577px) and (max-width: 1023px) {
    .modal-content {
        margin-top: 60%;
        width: 70%;
    }

    #skill-info-container {
        padding: 15px;
    }

    .modal-btn {
        width: fit-content;
    }
}

/* h2 {
    color: #8f7bd6;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
    font-size: 1.75rem;
} */
</style>
