<script>
import { ref, computed } from 'vue';
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useResourcesStore } from '../../stores/ResourcesStore.js';
import { useMCQuestionsStore } from '../../stores/MCQuestionsStore.js';
import { useEssayQuestionsStore } from '../../stores/EssayQuestionsStore.js';
import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';

export default {
    setup() {
        const skillsStore = useSkillsStore();
        const resourcesStore = useResourcesStore();
        const mcQuestionsStore = useMCQuestionsStore();
        const essayQuestionsStore = useEssayQuestionsStore();

        return {
            skillsStore,
            resourcesStore,
            mcQuestionsStore,
            essayQuestionsStore
        };
    },
    data() {
        return {
            contentFlags: [],
            skillFlags: [],
            resourcesFlags: [],
            mcQuestionFlags: [],
            isContentFlagsLoaded: false,
            showDismissModal: false,
            flagId: '',
            headers: [
                { text: 'Name', value: 'name' },
                { text: 'User', value: 'user', width: 99 },
                { text: 'Type', value: 'type' },
                { text: 'Action', value: 'action' }
            ],
            rows: [],
            rowsLength: 10,
            // Filter option data for the table
            flagTypeCriteria: 'all',
            showFlagTypeFilter: false,
            userNameCriteria: '',
            showUserFilter: false,
            searchText: '',
            userRoleCriteria: 'all',
            // Custom drop down flag and state
            showFlagTypeDropDown: false,
            showUserRoleDropDown: false
        };
    },
    components: {
        Vue3EasyDataTable
    },
    async created() {},
    async mounted() {
        // call to content flags route
        await this.getContentFlags();
    },
    methods: {
        async getContentFlags() {
            fetch('/content-flags/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.contentFlags = data;
                })
                .then(() => {
                    for (let i = 0; i < this.contentFlags.length; i++) {
                        const flag = this.contentFlags[i];
                        // parse the content data because mysql library return it as a string
                        const contentObj = JSON.parse(flag.contentData);
                        switch (flag.content_type) {
                            // Handle for mc question flag
                            case 'mc_question':
                                const tableRowMC = {
                                    type: 'mc question',
                                    name:
                                        contentObj.name +
                                        ' ' +
                                        contentObj.question,
                                    nameUrl:
                                        'skills/' +
                                        contentObj.skillId +
                                        '/question-bank',
                                    flagId: flag.id,
                                    editUrl:
                                        '/mc-questions/edit/' + flag.content_id,
                                    expandContent: contentObj,
                                    user: {
                                        username: flag.username,
                                        id: flag.userId,
                                        avatar: flag.avatar,
                                        role: flag.userRole
                                    }
                                };
                                this.rows.push(tableRowMC);
                                break;
                            // Handle for mc question flag
                            case 'essay_question':
                                const tableRowEssay = {
                                    type: 'essay question',
                                    name:
                                        contentObj.name +
                                        ' ' +
                                        contentObj.question,
                                    nameUrl:
                                        'skills/' +
                                        contentObj.skillId +
                                        '/question-bank',
                                    flagId: flag.id,
                                    editUrl:
                                        '/essay-questions/edit/' +
                                        flag.content_id,
                                    expandContent: contentObj,
                                    user: {
                                        username: flag.username,
                                        id: flag.userId,
                                        avatar: flag.avatar,
                                        role: flag.userRole
                                    }
                                };
                                this.rows.push(tableRowEssay);
                                break;
                            // handle for skill flag
                            case 'skill':
                                const tableRowSkill = {
                                    type: 'skill',
                                    name: contentObj.name,
                                    nameUrl: 'skills/' + flag.content_id,

                                    flagId: flag.id,
                                    editUrl: '/skills/edit/' + flag.content_id,
                                    expandContent: contentObj,
                                    user: {
                                        username: flag.username,
                                        id: flag.userId,
                                        avatar: flag.avatar,
                                        role: flag.userRole
                                    }
                                };
                                this.rows.push(tableRowSkill);
                                break;
                            // handle for resource flag
                            case 'resource':
                                const tableRowResource = {
                                    type: 'resource',
                                    name:
                                        'Commented by user: ' +
                                        contentObj.user +
                                        ', in skill: ' +
                                        contentObj.skill +
                                        ' forum',
                                    nameUrl: 'skills/' + contentObj.skillId,

                                    flagId: flag.id,
                                    editUrl:
                                        '/resources/edit/' + flag.content_id,
                                    expandContent: contentObj,
                                    user: {
                                        username: flag.username,
                                        id: flag.userId,
                                        avatar: flag.avatar,
                                        role: flag.userRole
                                    }
                                };
                                this.rows.push(tableRowResource);
                                break;
                            default:
                                break;
                        }
                    }
                    this.rowsLength = this.rows.length;
                    this.isContentFlagsLoaded = true;
                });
        },
        dismissFlag(flagId) {
            const result = fetch('/content-flags/' + flagId, {
                method: 'DELETE'
            });

            if (result.error) {
                console.log(result.error);
            }

            /**
             * Filter The rows array instead of recall the sever for update flags
             */
            this.rows = this.rows.filter((e) => {
                return e.flagId !== flagId;
            });
            this.showDismissModal = false;
        },
        handleOpenDismissModal(flagId) {
            this.flagId = flagId;
            this.showDismissModal = true;
        },
        // THIS IS JUST A WARNING NOW THE FEATURE WILL BE IMPLEMENT LATER
        // TODO: ADD REWARD FEATURE
        handleRewardUser(userId) {
            alert(`user  with id: ${userId} will be rewarded`);
        },
        // We Define The Filter option for the table here
        filterOptions() {
            // The Array that hold all the option
            const filterOptionsArray = [];

            // *** Flag Type Filter Obj ***
            // Only filter type when user choose a type
            if (this.flagTypeCriteria !== 'all') {
                filterOptionsArray.push({
                    field: 'type',
                    comparison: '=',
                    criteria: this.flagTypeCriteria
                });
            }

            // *** User Role Filter Obj ***

            if (this.userRoleCriteria !== 'all') {
                filterOptionsArray.push({
                    field: 'user',
                    criteria: this.userRoleCriteria,
                    comparison: (value, criteria) => {
                        return value.role == criteria;
                    }
                });
            }

            // *** User Filter Obj ***
            if (this.userNameCriteria !== '') {
                filterOptionsArray.push({
                    field: 'user',
                    criteria: this.userNameCriteria,
                    comparison: (value, criteria) => {
                        return (
                            value != null &&
                            criteria != null &&
                            value.username.includes(`${criteria}`)
                        );
                    }
                });
            }

            return filterOptionsArray;
        },
        handleUserKeyUp(e) {
            if (e.key === 'Enter') {
                this.showUserFilter = false;
            }
        },
        clearFilter() {
            this.searchText = '';
            this.flagTypeCriteria = 'all';
            this.userNameCriteria = '';
            this.userRoleCriteria = 'all';
            this.showFlagTypeFilter = false;
            this.showUserFilter = false;
        }
    }
};
</script>

<template>
    <div id="banner">
        <img
            src="/images/banners/edit-mastery-skill-banner.png"
            class="img-fluid"
        />
    </div>
    <div class="container-md pb-5">
        <div class="mt-3">
            <h1>Content Flags</h1>
        </div>
        <hr />
        <!-- Search Table Section -->
        <div>
            <div class="expand-tile">Search:</div>
            <div class="d-flex search-bar">
                <input type="text" v-model="searchText" />
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    width="16"
                    height="14"
                    class=""
                    fill="white"
                >
                    <path
                        d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
                    />
                </svg>
            </div>
        </div>
        <!-- Vue Data Table Desktop  -->
        <div class="mt-5 pb-5 d-none d-md-block">
            <Vue3EasyDataTable
                :headers="headers"
                :items="rows"
                alternating
                show-index
                :loading="!isContentFlagsLoaded"
                table-class-name="customize-table"
                :filter-options="filterOptions()"
                :search-value="searchText"
                buttons-pagination
                theme-color="#a48be6"
            >
                <!-- --- Loading Part --- -->
                <template #loading>
                    <img src="/images/loading.gif" alt="loading data" />
                </template>

                <!-- --- Name Router Column --- -->
                <template #item-name="{ name, nameUrl }">
                    <RouterLink
                        class="flag-name"
                        :to="`/${nameUrl}`"
                        target="_blank"
                        >{{ name }}</RouterLink
                    >
                </template>

                <!-- --- Action Buttons Column --- -->
                <template #item-action="{ flagId, editUrl, type }">
                    <div
                        class="pb-2 pt-2 d-flex flex-column flex-lg-row gap-1 align-items-center"
                    >
                        <router-link
                            :to="editUrl"
                            class="btn purple-btn"
                            target="_blank"
                            b-tooltip.hover
                            :title="'Go To Edit Page For This ' + type"
                        >
                            <!-- Pencil icon -->
                            <svg
                                width="14"
                                height="16"
                                viewBox="0 0 19 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M0.75558 19.3181C0.77635 19.5132 0.87137 19.6928 1.02096 19.8198C1.17055 19.9468 1.36325 20.0114 1.55915 20.0002L5.27701 19.8288L0.398438 15.6145L0.75558 19.3181Z"
                                    fill="white"
                                />
                                <path
                                    d="M11.8467 2.24484L0.801758 15.0315L5.6802 19.2454L16.7251 6.45877L11.8467 2.24484Z"
                                    fill="white"
                                />
                                <path
                                    d="M18.2555 3.11796L14.934 0.260817C14.832 0.172259 14.7134 0.104756 14.5852 0.0621907C14.4569 0.0196256 14.3215 0.00283902 14.1868 0.0127967C14.052 0.0227543 13.9205 0.0592596 13.7999 0.120212C13.6793 0.181165 13.572 0.265362 13.484 0.36796L12.4805 1.50725L17.359 5.71439L18.3519 4.56082C18.5289 4.35602 18.6181 4.08969 18.6 3.81958C18.582 3.54948 18.4582 3.29738 18.2555 3.11796Z"
                                    fill="white"
                                />
                            </svg>
                        </router-link>
                        <button
                            b-tooltip.hover
                            :title="'Dismiss This Flag'"
                            class="btn red-btn h-100"
                            @click="handleOpenDismissModal(flagId)"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 576 512"
                                width="14"
                                height="16"
                                fill="white"
                            >
                                <path
                                    d="M290.7 57.4L57.4 290.7c-25 25-25 65.5 0 90.5l80 80c12 12 28.3 18.7 45.3 18.7H288h9.4H512c17.7 0 32-14.3 32-32s-14.3-32-32-32H387.9L518.6 285.3c25-25 25-65.5 0-90.5L381.3 57.4c-25-25-65.5-25-90.5 0zM297.4 416H288l-105.4 0-80-80L227.3 211.3 364.7 348.7 297.4 416z"
                                />
                            </svg>
                        </button>
                        <!---------------------------------------------------------->
                    </div>
                </template>

                <!-- ---  Expand Part --- -->
                <template #expand="{ expandContent, type }">
                    <div id="expand-div" style="padding: 15px">
                        <!-- _+_+_+_+_+_+_+_ MC Question Expand _+_+_+_+_+_+_+_  -->
                        <div v-if="type == 'mc question'">
                            <div class="d-flex mb-2">
                                <div class="expand-tile">Belong to skill:</div>
                                <div>
                                    <router-link
                                        :to="'skills/' + expandContent.skillId"
                                        target="_blank"
                                        b-tooltip.hover
                                        :style="{ color: '#8f7bd6' }"
                                        :title="'Go To Skill '"
                                        >{{
                                            expandContent.skillName
                                        }}</router-link
                                    >
                                </div>
                            </div>
                            <div class="d-flex mb-2">
                                <div class="expand-tile">Name:</div>
                                <div>
                                    {{ expandContent.name }}
                                </div>
                            </div>
                            <div class="d-flex mb-2">
                                <div class="expand-tile">Question:</div>
                                <div>
                                    {{ expandContent.question }}
                                </div>
                            </div>
                            <div
                                id="expand-mc-answer"
                                class="d-flex flex-column"
                            >
                                <div
                                    class="d-flex mb-2 border-bottom border-opacity-75 pb-2"
                                >
                                    <div class="expand-tile">
                                        Correct Answer:
                                    </div>
                                    {{ expandContent.correctAnswer }}
                                </div>
                                <div class="d-flex mb-2 border-bottom pb-2">
                                    <div class="expand-tile">
                                        Incorrect Answer 1:
                                    </div>
                                    {{ expandContent.incorrectAnswer1 }}
                                </div>
                                <div class="d-flex mb-2 border-bottom pb-2">
                                    <div class="expand-tile">
                                        Incorrect Answer 2:
                                    </div>
                                    {{ expandContent.incorrectAnswer2 }}
                                </div>
                                <div class="d-flex mb-2 border-bottom pb-2">
                                    <div class="expand-tile">
                                        Incorrect Answer 3:
                                    </div>
                                    {{ expandContent.incorrectAnswer3 }}
                                </div>
                                <div class="d-flex mb-2 border-bottom pb-2">
                                    <div class="expand-tile">
                                        Incorrect Answer 4:
                                    </div>
                                    {{ expandContent.incorrectAnswer4 }}
                                </div>
                            </div>

                            <div class="d-flex mb-2">
                                <div class="expand-tile">Explanation:</div>
                                {{ expandContent.explanation }}
                            </div>
                        </div>
                        <!-- _+_+_+_+_+_+_+_  Essay Expand content _+_+_+_+_+_+_+_  -->
                        <div v-if="type == 'essay question'">
                            <div class="d-flex mb-2">
                                <div class="expand-tile">Belong to skill:</div>
                                <div>
                                    <router-link
                                        :to="'skills/' + expandContent.skillId"
                                        target="_blank"
                                        b-tooltip.hover
                                        :style="{ color: '#8f7bd6' }"
                                        :title="'Go To Skill'"
                                        >{{
                                            expandContent.skillName
                                        }}</router-link
                                    >
                                </div>
                            </div>
                            <div class="d-flex mb-2">
                                <div class="expand-tile">Name:</div>
                                {{ expandContent.name }}
                            </div>
                            <div class="d-flex mb-2">
                                <div class="expand-tile">Question:</div>
                                {{ expandContent.question }}
                            </div>
                        </div>
                        <!-- _+_+_+_+_+_+_+_  Skill Expand content _+_+_+_+_+_+_+_  -->
                        <div v-if="type == 'skill'">
                            <div id="skill-expand-head">
                                <div class="d-flex mb-2">
                                    <div class="expand-tile">Skill:</div>
                                    {{ expandContent.name }}
                                </div>
                                <div class="mb-2 border-bottom pb-2">
                                    {{ expandContent.description }}
                                </div>
                            </div>
                            <div class="expand-tile">Mastery Requirements:</div>
                            <div
                                class="expand-skill-requirement"
                                v-html="expandContent.masteryRequirements"
                            ></div>
                        </div>
                        <!-- _+_+_+_+_+_+_+_  Resource Expand content _+_+_+_+_+_+_+_  -->
                        <div v-if="type == 'resource'">
                            <div class="d-flex mb-2">
                                <div class="expand-tile">Skill:</div>
                                <div>{{ expandContent.skill }}</div>
                            </div>
                            <div class="d-flex mb-2">
                                <div class="expand-tile">User:</div>
                                <div>{{ expandContent.user }}</div>
                            </div>
                            <div class="d-flex flex-column mb-2">
                                <div class="expand-tile">Content:</div>
                                <div
                                    class="expand-skill-requirement"
                                    v-html="expandContent.content"
                                ></div>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- --- User Column --- -->
                <template #item-user="{ user }">
                    <div class="user-cell">
                        <img
                            :src="user.avatar"
                            alt="user avatar"
                            class="user-avatar"
                        />
                        <div class="user-name">
                            {{ user.username }}
                        </div>
                        <div class="user-role">
                            {{ user.role }}
                        </div>
                    </div>
                </template>

                <!-- Flag Type Header Filtering -->
                <template #header-type="header">
                    <div class="filter-column">
                        <div
                            @click.stop="
                                showFlagTypeFilter = !showFlagTypeFilter
                            "
                            b-tooltip.hover
                            :title="'filter this column'"
                        >
                            <span id="type-head-tile" class="me-1">
                                {{ header.text }}
                            </span>
                            <svg
                                class="filter-icon mb-1"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                height="16"
                                width="14"
                                fill="#a48be6"
                            >
                                <path
                                    d="M3.9 54.9C10.5 40.9 24.5 32 40 32H472c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9V448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6V320.9L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z"
                                />
                            </svg>
                        </div>
                        <Transition name="dropdown">
                            <div
                                class="filter-menu flag-type-filter"
                                v-if="showFlagTypeFilter"
                            >
                                <!-- Custom Dropdown -->
                                <div class="d-flex flex-column">
                                    <div
                                        :class="[
                                            showFlagTypeDropDown
                                                ? 'custom-select-button-focus'
                                                : 'custom-select-button'
                                        ]"
                                        @click="
                                            showFlagTypeDropDown =
                                                !showFlagTypeDropDown
                                        "
                                    >
                                        {{ flagTypeCriteria }}
                                        <span>
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M14.2929 8.70711C14.9229 8.07714 14.4767 7 13.5858 7H6.41421C5.52331 7 5.07714 8.07714 5.70711 8.70711L9.29289 12.2929C9.68342 12.6834 10.3166 12.6834 10.7071 12.2929L14.2929 8.70711Z"
                                                    fill="#344054"
                                                />
                                            </svg>
                                        </span>
                                    </div>
                                    <Transition name="dropdownFilter">
                                        <div
                                            v-if="showFlagTypeDropDown"
                                            class="custom-dropdown-base"
                                        >
                                            <div
                                                class="custom-dropdown-option"
                                                @click="
                                                    flagTypeCriteria =
                                                        'essay question';
                                                    showFlagTypeDropDown = false;
                                                    showFlagTypeFilter = false;
                                                "
                                            >
                                                essay question
                                            </div>
                                            <div
                                                class="custom-dropdown-option"
                                                @click="
                                                    flagTypeCriteria =
                                                        'mc question';
                                                    showFlagTypeDropDown = false;
                                                    showFlagTypeFilter = false;
                                                "
                                            >
                                                mc question
                                            </div>
                                            <div
                                                class="custom-dropdown-option"
                                                @click="
                                                    flagTypeCriteria = 'skill';
                                                    showFlagTypeDropDown = false;
                                                    showFlagTypeFilter = false;
                                                "
                                            >
                                                skill
                                            </div>
                                            <div
                                                class="custom-dropdown-option"
                                                @click="
                                                    flagTypeCriteria =
                                                        'resource';
                                                    showFlagTypeDropDown = false;
                                                    showFlagTypeFilter = false;
                                                "
                                            >
                                                resource
                                            </div>
                                            <div
                                                class="custom-dropdown-option"
                                                @click="
                                                    flagTypeCriteria = 'all';
                                                    showFlagTypeDropDown = false;
                                                    showFlagTypeFilter;
                                                "
                                            >
                                                all
                                            </div>
                                        </div>
                                    </Transition>
                                </div>
                                <!-- End of custom dropdown -->
                            </div>
                        </Transition>
                    </div>
                </template>

                <!-- User Header (Name Searcher and Role filter) -->
                <template #header-user="header">
                    <div class="filter-column user-header">
                        <div
                            @click.stop="showUserFilter = !showUserFilter"
                            b-tooltip.hover
                            :title="'Search for user name'"
                        >
                            <span id="type-head-tile" class="me-1">
                                {{ header.text }}
                            </span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                width="16"
                                height="14"
                                class="mb-1 filter-icon"
                                fill="#8f7bd6"
                            >
                                <path
                                    d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
                                />
                            </svg>
                        </div>
                        <Transition name="dropdown">
                            <div class="filter-menu" v-if="showUserFilter">
                                <!-- User name search filter -->
                                <div class="d-flex user-filter">
                                    <input
                                        type="text"
                                        v-model="userNameCriteria"
                                        placeholder="type in user name"
                                        @keyup="(e) => handleUserKeyUp(e)"
                                    />
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 512 512"
                                        width="16"
                                        height="14"
                                        class=""
                                        fill="gray"
                                    >
                                        <path
                                            d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
                                        />
                                    </svg>
                                </div>
                                <!-- Role dropdown filter -->
                                <div class="mt-2 d-flex flex-column">
                                    <div id="role-filter-label">User Role:</div>
                                    <!-- Custom Dropdown -->
                                    <div class="d-flex flex-column">
                                        <div
                                            :class="[
                                                showUserRoleDropDown
                                                    ? 'custom-select-button-focus'
                                                    : 'custom-select-button'
                                            ]"
                                            @click="
                                                showUserRoleDropDown =
                                                    !showUserRoleDropDown
                                            "
                                        >
                                            {{ userRoleCriteria }}
                                            <span>
                                                <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 20 20"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M14.2929 8.70711C14.9229 8.07714 14.4767 7 13.5858 7H6.41421C5.52331 7 5.07714 8.07714 5.70711 8.70711L9.29289 12.2929C9.68342 12.6834 10.3166 12.6834 10.7071 12.2929L14.2929 8.70711Z"
                                                        fill="#344054"
                                                    />
                                                </svg>
                                            </span>
                                        </div>
                                        <Transition name="dropdownFilter">
                                            <div
                                                v-if="showUserRoleDropDown"
                                                class="custom-dropdown-base"
                                            >
                                                <div
                                                    class="custom-dropdown-option"
                                                    @click="
                                                        userRoleCriteria =
                                                            'all';
                                                        showUserRoleDropDown = false;
                                                    "
                                                >
                                                    All
                                                </div>
                                                <div
                                                    class="custom-dropdown-option"
                                                    @click="
                                                        userRoleCriteria =
                                                            'student';
                                                        showUserRoleDropDown = false;
                                                    "
                                                >
                                                    Student
                                                </div>
                                                <div
                                                    class="custom-dropdown-option"
                                                    @click="
                                                        userRoleCriteria =
                                                            'instructor';
                                                        showUserRoleDropDown = false;
                                                    "
                                                >
                                                    Instructor
                                                </div>
                                                <div
                                                    class="custom-dropdown-option"
                                                    @click="
                                                        userRoleCriteria =
                                                            'admin';
                                                        showUserRoleDropDown = false;
                                                    "
                                                >
                                                    Admin
                                                </div>
                                            </div>
                                        </Transition>
                                    </div>
                                    <!-- End of custom dropdown -->
                                </div>
                            </div>
                        </Transition>
                    </div>
                </template>
            </Vue3EasyDataTable>
        </div>
        <!-- ++++++++++++++++++++++++++++_______________________________ ++++++++++++++++++++++++++++ -->

        <!-- Vue Data Table Phone -->
        <div class="mt-5 pb-5 d-md-none">
            <Vue3EasyDataTable
                :headers="headers"
                :items="rows"
                alternating
                :loading="!isContentFlagsLoaded"
                table-class-name="customize-table"
                :filter-options="filterOptions()"
                :search-value="searchText"
                buttons-pagination
                theme-color="#a48be6"
            >
                <!-- --- Loading Part --- -->
                <template #loading>
                    <img src="/images/loading.gif" alt="loading data" />
                </template>
                <!-- --- Flag Name Column ---  -->
                <template #item-name="{ name, nameUrl }">
                    <RouterLink
                        class="flag-name"
                        :to="`/${nameUrl}`"
                        target="_blank"
                        >{{ name }}</RouterLink
                    >
                </template>
                <!-- --- Action Buttons Column -->
                <template #item-action="{ flagId, editUrl, type }">
                    <div
                        class="pb-2 pt-2 d-flex flex-column flex-lg-row gap-1 align-items-center"
                    >
                        <router-link
                            :to="editUrl"
                            class="btn purple-btn"
                            target="_blank"
                            b-tooltip.hover
                            :title="'Go To Edit Page For This ' + type"
                        >
                            <!-- Pencil icon -->
                            <svg
                                width="10"
                                height="12"
                                viewBox="0 0 19 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M0.75558 19.3181C0.77635 19.5132 0.87137 19.6928 1.02096 19.8198C1.17055 19.9468 1.36325 20.0114 1.55915 20.0002L5.27701 19.8288L0.398438 15.6145L0.75558 19.3181Z"
                                    fill="white"
                                />
                                <path
                                    d="M11.8467 2.24484L0.801758 15.0315L5.6802 19.2454L16.7251 6.45877L11.8467 2.24484Z"
                                    fill="white"
                                />
                                <path
                                    d="M18.2555 3.11796L14.934 0.260817C14.832 0.172259 14.7134 0.104756 14.5852 0.0621907C14.4569 0.0196256 14.3215 0.00283902 14.1868 0.0127967C14.052 0.0227543 13.9205 0.0592596 13.7999 0.120212C13.6793 0.181165 13.572 0.265362 13.484 0.36796L12.4805 1.50725L17.359 5.71439L18.3519 4.56082C18.5289 4.35602 18.6181 4.08969 18.6 3.81958C18.582 3.54948 18.4582 3.29738 18.2555 3.11796Z"
                                    fill="white"
                                />
                            </svg>
                        </router-link>
                        <button
                            b-tooltip.hover
                            :title="'Dismiss This Flag'"
                            class="btn red-btn h-100"
                            @click="handleOpenDismissModal(flagId)"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 576 512"
                                width="10"
                                height="12"
                                fill="white"
                            >
                                <path
                                    d="M290.7 57.4L57.4 290.7c-25 25-25 65.5 0 90.5l80 80c12 12 28.3 18.7 45.3 18.7H288h9.4H512c17.7 0 32-14.3 32-32s-14.3-32-32-32H387.9L518.6 285.3c25-25 25-65.5 0-90.5L381.3 57.4c-25-25-65.5-25-90.5 0zM297.4 416H288l-105.4 0-80-80L227.3 211.3 364.7 348.7 297.4 416z"
                                />
                            </svg>
                        </button>
                        <!---------------------------------------------------------->
                    </div>
                </template>
                <!-- --- Expand Part --- -->
                <template #expand="{ expandContent, type }">
                    <div id="expand-div" style="padding: 5px">
                        <!-- _+_+_+_+_+_+_+_ MC Question Expand _+_+_+_+_+_+_+_  -->
                        <div v-if="type == 'mc question'">
                            <div class="d-flex mb-2">
                                <div class="expand-tile">Belong to skill:</div>
                                <div>
                                    <router-link
                                        :to="'skills/' + expandContent.skillId"
                                        target="_blank"
                                        b-tooltip.hover
                                        :style="{ color: '#8f7bd6' }"
                                        :title="'Go To Skill '"
                                        >{{
                                            expandContent.skillName
                                        }}</router-link
                                    >
                                </div>
                            </div>
                            <div class="d-flex mb-2">
                                <div class="expand-tile">Name:</div>
                                <div>
                                    {{ expandContent.name }}
                                </div>
                            </div>
                            <div class="d-flex mb-2">
                                <div class="expand-tile">Question:</div>
                                <div>
                                    {{ expandContent.question }}
                                </div>
                            </div>
                            <div
                                id="expand-mc-answer"
                                class="d-flex flex-column"
                            >
                                <div
                                    class="d-flex mb-2 border-bottom border-opacity-75 pb-2"
                                >
                                    <div class="expand-tile">
                                        Correct Answer:
                                    </div>
                                    {{ expandContent.correctAnswer }}
                                </div>
                                <div class="d-flex mb-2 border-bottom pb-2">
                                    <div class="expand-tile">
                                        Incorrect Answer 1:
                                    </div>
                                    {{ expandContent.incorrectAnswer1 }}
                                </div>
                                <div class="d-flex mb-2 border-bottom pb-2">
                                    <div class="expand-tile">
                                        Incorrect Answer 2:
                                    </div>
                                    {{ expandContent.incorrectAnswer2 }}
                                </div>
                                <div class="d-flex mb-2 border-bottom pb-2">
                                    <div class="expand-tile">
                                        Incorrect Answer 3:
                                    </div>
                                    {{ expandContent.incorrectAnswer3 }}
                                </div>
                                <div class="d-flex mb-2 border-bottom pb-2">
                                    <div class="expand-tile">
                                        Incorrect Answer 4:
                                    </div>
                                    {{ expandContent.incorrectAnswer4 }}
                                </div>
                            </div>

                            <div class="d-flex mb-2">
                                <div class="expand-tile">Explanation:</div>
                                {{ expandContent.explanation }}
                            </div>
                        </div>
                        <!-- _+_+_+_+_+_+_+_  Essay Expand content _+_+_+_+_+_+_+_  -->
                        <div v-if="type == 'essay question'">
                            <div class="d-flex mb-2">
                                <div class="expand-tile">Belong to skill:</div>
                                <div>
                                    <router-link
                                        :to="'skills/' + expandContent.skillId"
                                        target="_blank"
                                        b-tooltip.hover
                                        :style="{ color: '#8f7bd6' }"
                                        :title="'Go To Skill '"
                                        >{{
                                            expandContent.skillName
                                        }}</router-link
                                    >
                                </div>
                            </div>
                            <div class="d-flex mb-2">
                                <div class="expand-tile">Name:</div>
                                {{ expandContent.name }}
                            </div>
                            <div class="d-flex mb-2">
                                <div class="expand-tile">Question:</div>
                                {{ expandContent.question }}
                            </div>
                        </div>
                        <!-- _+_+_+_+_+_+_+_  Skill Expand content _+_+_+_+_+_+_+_  -->
                        <div v-if="type == 'skill'">
                            <div id="skill-expand-head">
                                <div class="d-flex mb-2">
                                    <div class="expand-tile">Skill:</div>
                                    {{ expandContent.name }}
                                </div>
                                <div class="mb-2 border-bottom pb-2">
                                    {{ expandContent.description }}
                                </div>
                            </div>
                            <div class="expand-tile">Mastery Requirements:</div>
                            <div
                                class="expand-skill-requirement"
                                v-html="expandContent.masteryRequirements"
                            ></div>
                        </div>
                        <!-- _+_+_+_+_+_+_+_  Resource Expand content _+_+_+_+_+_+_+_  -->
                        <div v-if="type == 'resource'">
                            <div class="d-flex mb-2">
                                <div class="expand-tile">Skill:</div>
                                <div>{{ expandContent.skill }}</div>
                            </div>
                            <div class="d-flex mb-2">
                                <div class="expand-tile">User:</div>
                                <div>{{ expandContent.user }}</div>
                            </div>
                            <div class="d-flex flex-column mb-2">
                                <div class="expand-tile">Content:</div>
                                <div
                                    class="expand-skill-requirement"
                                    v-html="expandContent.content"
                                ></div>
                            </div>
                        </div>
                    </div>
                </template>
                <!-- --- User Column --- -->
                <template #item-user="{ user }">
                    <div class="user-cell">
                        <img
                            :src="user.avatar"
                            alt="user avatar"
                            class="user-avatar"
                        />
                        <div class="user-name">
                            {{ user.username }}
                        </div>

                        <div class="user-role">
                            {{ user.role }}
                        </div>
                    </div>
                </template>

                <!-- --- Flag Type Header Filtering --- -->
                <template #header-type="header">
                    <div class="filter-column">
                        <div
                            @click.stop="
                                showFlagTypeFilter = !showFlagTypeFilter
                            "
                            b-tooltip.hover
                            :title="'filter this column'"
                        >
                            <span id="type-head-tile" class="me-1">
                                {{ header.text }}
                            </span>
                        </div>
                        <Transition name="dropdown">
                            <div
                                class="filter-menu filter-flag-phone"
                                v-if="showFlagTypeFilter"
                            >
                                <!-- Custom Dropdown -->
                                <div class="d-flex flex-column">
                                    <div
                                        :class="[
                                            showFlagTypeDropDown
                                                ? 'custom-select-button-focus'
                                                : 'custom-select-button'
                                        ]"
                                        @click="
                                            showFlagTypeDropDown =
                                                !showFlagTypeDropDown
                                        "
                                    >
                                        {{ flagTypeCriteria }}
                                        <span>
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M14.2929 8.70711C14.9229 8.07714 14.4767 7 13.5858 7H6.41421C5.52331 7 5.07714 8.07714 5.70711 8.70711L9.29289 12.2929C9.68342 12.6834 10.3166 12.6834 10.7071 12.2929L14.2929 8.70711Z"
                                                    fill="#344054"
                                                />
                                            </svg>
                                        </span>
                                    </div>
                                    <Transition name="dropdownFilter">
                                        <div
                                            v-if="showFlagTypeDropDown"
                                            class="custom-dropdown-base"
                                        >
                                            <div
                                                class="custom-dropdown-option"
                                                @click="
                                                    flagTypeCriteria =
                                                        'essay question';
                                                    showFlagTypeFilter = false;
                                                    showFlagTypeDropDown = false;
                                                "
                                            >
                                                essay question
                                            </div>
                                            <div
                                                class="custom-dropdown-option"
                                                @click="
                                                    flagTypeCriteria =
                                                        'mc question';
                                                    showFlagTypeFilter = false;
                                                    showFlagTypeDropDown = false;
                                                "
                                            >
                                                mc question
                                            </div>
                                            <div
                                                class="custom-dropdown-option"
                                                @click="
                                                    flagTypeCriteria = 'skill';
                                                    showFlagTypeFilter = false;
                                                    showFlagTypeDropDown = false;
                                                "
                                            >
                                                skill
                                            </div>
                                            <div
                                                class="custom-dropdown-option"
                                                @click="
                                                    flagTypeCriteria =
                                                        'resource';
                                                    showFlagTypeFilter = false;
                                                    showFlagTypeDropDown = false;
                                                "
                                            >
                                                resource
                                            </div>
                                            <div
                                                class="custom-dropdown-option"
                                                @click="
                                                    flagTypeCriteria = 'all';
                                                    showFlagTypeFilter = false;
                                                    showFlagTypeDropDown = false;
                                                "
                                            >
                                                all
                                            </div>
                                        </div>
                                    </Transition>
                                </div>
                                <!-- End of custom dropdown -->
                            </div>
                        </Transition>
                    </div>
                </template>

                <!-- --- User Header Filtering --- -->
                <template #header-user="header">
                    <div class="filter-column user-header">
                        <div
                            @click.stop="showUserFilter = !showUserFilter"
                            b-tooltip.hover
                            :title="'Search for user name'"
                        >
                            <span id="type-head-tile" class="me-1">
                                {{ header.text }}
                            </span>
                        </div>
                        <Transition name="dropdown">
                            <div
                                class="filter-menu user-phone-filter-menu"
                                v-if="showUserFilter"
                            >
                                <!-- User Name Searcher -->
                                <div class="d-flex user-filter">
                                    <input
                                        type="text"
                                        v-model="userNameCriteria"
                                        placeholder="type in user name"
                                        @keyup="(e) => handleUserKeyUp(e)"
                                    />
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 512 512"
                                        width="16"
                                        height="14"
                                        class=""
                                        fill="gray"
                                    >
                                        <path
                                            d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
                                        />
                                    </svg>
                                </div>
                                <!-- Role dropdown filter -->
                                <div class="mt-2 d-flex flex-column">
                                    <div id="role-filter-label">User Role:</div>
                                    <!-- Custom Dropdown -->
                                    <div class="d-flex flex-column">
                                        <div
                                            :class="[
                                                showUserRoleDropDown
                                                    ? 'custom-select-button-focus'
                                                    : 'custom-select-button'
                                            ]"
                                            @click="
                                                showUserRoleDropDown =
                                                    !showUserRoleDropDown
                                            "
                                        >
                                            {{ userRoleCriteria }}
                                            <span>
                                                <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 20 20"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M14.2929 8.70711C14.9229 8.07714 14.4767 7 13.5858 7H6.41421C5.52331 7 5.07714 8.07714 5.70711 8.70711L9.29289 12.2929C9.68342 12.6834 10.3166 12.6834 10.7071 12.2929L14.2929 8.70711Z"
                                                        fill="#344054"
                                                    />
                                                </svg>
                                            </span>
                                        </div>
                                        <Transition name="dropdownFilter">
                                            <div
                                                v-if="showUserRoleDropDown"
                                                class="custom-dropdown-base"
                                            >
                                                <div
                                                    class="custom-dropdown-option"
                                                    @click="
                                                        userRoleCriteria =
                                                            'all';
                                                        showUserRoleDropDown = false;
                                                    "
                                                >
                                                    All
                                                </div>
                                                <div
                                                    class="custom-dropdown-option"
                                                    @click="
                                                        userRoleCriteria =
                                                            'student';
                                                        showUserRoleDropDown = false;
                                                    "
                                                >
                                                    Student
                                                </div>
                                                <div
                                                    class="custom-dropdown-option"
                                                    @click="
                                                        userRoleCriteria =
                                                            'instructor';
                                                        showUserRoleDropDown = false;
                                                    "
                                                >
                                                    Instructor
                                                </div>
                                                <div
                                                    class="custom-dropdown-option"
                                                    @click="
                                                        userRoleCriteria =
                                                            'admin';
                                                        showUserRoleDropDown = false;
                                                    "
                                                >
                                                    Admin
                                                </div>
                                            </div>
                                        </Transition>
                                    </div>
                                    <!-- End of custom dropdown -->
                                </div>
                            </div>
                        </Transition>
                    </div>
                </template>
            </Vue3EasyDataTable>
        </div>

        <!-- Clear Filter Criteria Button -->
        <div class="d-flex flex-row-reverse">
            <div
                class="btn red-btn"
                @click="clearFilter"
                b-tooltip.hover
                :title="'clear all table filter'"
            >
                <span>Clear Filter </span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 576 512"
                    width="16"
                    height="14"
                    class="ms-1"
                    fill="white"
                >
                    <path
                        d="M566.6 54.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192-34.7-34.7c-4.2-4.2-10-6.6-16-6.6c-12.5 0-22.6 10.1-22.6 22.6v29.1L364.3 320h29.1c12.5 0 22.6-10.1 22.6-22.6c0-6-2.4-11.8-6.6-16l-34.7-34.7 192-192zM341.1 353.4L222.6 234.9c-42.7-3.7-85.2 11.7-115.8 42.3l-8 8C76.5 307.5 64 337.7 64 369.2c0 6.8 7.1 11.2 13.2 8.2l51.1-25.5c5-2.5 9.5 4.1 5.4 7.9L7.3 473.4C2.7 477.6 0 483.6 0 489.9C0 502.1 9.9 512 22.1 512l173.3 0c38.8 0 75.9-15.4 103.4-42.8c30.6-30.6 45.9-73.1 42.3-115.8z"
                    />
                </svg>
            </div>
        </div>
    </div>

    <!-- Modal of dismiss flagging content -->
    <div v-if="showDismissModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
                <p>Are you sure you want to dismiss this flag?</p>
                <div class="d-flex justify-content-between">
                    <button
                        type="button"
                        class="btn red-btn"
                        @click="showDismissModal = false"
                    >
                        <span class="me-2 d-none d-md-block"> No </span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            width="18"
                            height="18"
                            fill="white"
                        >
                            <path
                                d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"
                            />
                        </svg>
                    </button>
                    <button
                        type="button"
                        class="btn green-btn"
                        @click="dismissFlag(flagId)"
                    >
                        <span class="me-2 d-none d-md-block"> Yes </span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            width="18"
                            height="18"
                            fill="white"
                        >
                            <path
                                d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
div {
    font-family: 'Poppins', sans-serif !important;
}

h1 {
    color: #8f7bd6;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
}

h2 {
    color: #8f7bd6;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
}

.flag-container {
    background-color: #f2edff;
    border-radius: 12px;
    padding: 5px;
    padding-top: 25px;
    padding-bottom: 30px;
}

#banner {
    width: 100%;
    height: fit-content;
}

.image-fluid {
    width: 100%;
    height: auto;
}

.search-bar {
    background-color: #a48be6;
    border-radius: 5px;
    width: fit-content;
    padding-right: 8px;
    padding-top: 2px;
    padding-bottom: 2px;
    padding-left: 2px;
    align-items: center;
    gap: 5px;
}

.search-bar input {
    outline: none;
}

.purple-btn {
    background-color: #a48be6 !important;
    color: white;
    border: 1px solid #7f56d9;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 12px;
    line-height: 24px;
    display: flex;
    align-items: center;
}

.purple-btn:hover {
    background-color: #7e59cf !important;
    color: white;
}

.red-btn {
    background-color: #e24d4d;
    color: white;
    border: 1px solid #d33622;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 12px;
    display: flex;
    align-items: center;
}

.red-btn:hover {
    background-color: #cc3535;
    color: white;
}

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 12px;
    display: flex;
    align-items: center;
}

.green-btn:hover {
    background-color: #3eb3a3;
    color: white;
}

.flag-name {
    text-decoration: none;
    font-family: 'Poppins';
    color: #8f7bd6;
}

.flag-name:hover {
    color: #7e59cf;
    text-decoration: underline;
}

.expand-tile {
    font-size: 16px;
    color: #a48be6;
    font-weight: 550;
    margin-right: 5px;
}

/* The Warning Modal */
.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 30;
    /* Sit on top */
    left: 0;
    top: 0;
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    overflow: auto;
    /* Enable scroll if needed */
    background-color: rgb(0, 0, 0);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
}

.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 250px;
    /* Could be more or less, depending on screen size */
}
/* End of Modal Styling */

/* Dropdown Animation */

@keyframes slide {
    0% {
        opacity: 0;
        transform: scaleY(0);
    }

    100% {
        opacity: 1;
        transform: scaleY(1);
    }
}
.dropdown-enter-active {
    transform-origin: top center;
    animation: slide 0.2s;
}
.dropdown-leave-active {
    transform-origin: top center;
    animation: slide 0.2s reverse;
}

/* Delay The button transition */
.dropdown-enter-active .btn,
.dropdown-leave-active .btn {
    transition-delay: 0.2s;
}

/* -- Another transition for filter-dropdown -- */
.dropdownFilter-enter-active {
    transform-origin: top center;
    animation: slide 0.4s;
}
.dropdownFilter-leave-active {
    transform-origin: top center;
    animation: slide 0.4s reverse;
}

/* Delay The button transition */
.dropdownFilter-enter-active .btn,
.dropdownFilter-leave-active .btn {
    transition-delay: 0.5s;
}

/* ** End Of Dropdown Animation ** */

/* +-+-+ Vue Easy Table Custom CSS +-+-+  */
.customize-table {
    --easy-table-body-row-font-size: 16px;

    --easy-table-header-font-size: 16px;
    --easy-table-header-font-color: #8f7bd6;
    --easy-table-header-background-color: #fefefe;
    --easy-table-header-height: 50px;

    --easy-table-header-item-padding: 15px 5px;
}

/* Expand components CSS */
#expand-div div {
    font-family: 'Poppins' sans-serif;
}

#expand-mc-answer {
    width: fit-content;
}

.expand-skill-requirement {
    margin-top: 10px;
    padding: 15px 20px;
    border-radius: 5px;
    background-color: #f2edffcc;
}

#skill-expand-head {
    width: 50%;
}

.user-header {
    padding-left: 10px;
}

.user-cell {
    display: flex;
    flex-direction: column;
    padding: 10px 0px;
    width: 60px;
    margin-left: 0px;
}

.user-avatar {
    width: 50px;
    height: 50px;
    border-radius: 5px;
    margin-left: auto;
    margin-right: auto;
}

.user-name {
    text-align: center;
    color: #a48be6;
    /* text-decoration: underline; */
    /* cursor: pointer; */
    width: 100%;
}

.user-role {
    color: #888;
    font-size: 15px;
    text-align: center;
}

.filter-icon {
    cursor: pointer;
}

/* Filter Header Styling */
.filter-menu {
    padding: 15px 30px;
    z-index: 20;
    position: absolute;
    top: 40px;
    width: fit-content;
    background-color: #fff;
    border: 1px solid #e0e0e0;
}

.filter-column {
    display: flex;
    align-items: center;
    justify-items: center;
    position: relative;
}

.user-filter {
    border: #a48be6 1px solid;
    border-radius: 5px;
    display: flex;
    align-items: center;
    padding: 2px;
}

.user-filter input {
    outline: none;
    border: 0px;
}

.flag-type-filter {
    left: -50px;
}

/* Style For The Custom Select */
.custom-select-button {
    width: 200px;
    height: auto;
    padding: 6px 14px 6px 14px;
    border-radius: 8px;
    gap: 8px;
    background: linear-gradient(0deg, #ffffff, #ffffff),
        linear-gradient(0deg, #f2f4f7, #f2f4f7);
    border: 1px solid #f2f4f7;
    box-shadow: 0px 1px 2px 0px #1018280d;
    font-family: 'Poppins' sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0.03em;
    text-align: left;
    display: flex;
}

.custom-select-button-focus {
    width: 200px;
    height: auto;
    padding: 6px 14px 6px 14px;
    border-radius: 8px;
    gap: 8px;
    background: linear-gradient(0deg, #ffffff, #ffffff),
        linear-gradient(0deg, #f2f4f7, #f2f4f7);
    border: 1px solid #9c7eec;
    box-shadow: 0px 0px 0px 4px #bca3ff4d;
    font-family: 'Poppins' sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0.03em;
    text-align: left;
    display: flex;
}

.custom-select-button:hover {
    cursor: pointer;
    border: 1px solid #9c7eec;
}

.custom-select-button > span {
    margin-right: 2px;
    margin-left: auto;
    animation: rotationBack 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

.custom-select-button-focus > span {
    margin-right: 2px;
    margin-left: auto;
    animation: rotation 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

.form-validate {
    font-size: 0.75rem;
    color: red;
    font-weight: 300;
}

#role-filter-label {
    color: #888;
    font-size: 16px;
    font-weight: 400;
    margin-top: 15px;
}

/* The animation key frame */
@keyframes rotation {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(180deg);
    }
}

@keyframes rotationBack {
    from {
        transform: rotate(180deg);
    }

    to {
        transform: rotate(0deg);
    }
}

.custom-select-button-focus:hover {
    cursor: pointer;
}

.custom-dropdown-base {
    border-radius: 8px;
    border: 1px;
    background: linear-gradient(0deg, #ffffff, #ffffff);
    border: 1px solid #9c7eec;
    box-shadow: 0px 4px 6px -2px #10182808;
    box-shadow: 0px 12px 16px -4px #10182814;
    width: 200px;
}

.custom-dropdown-option {
    padding: 10px 14px 10px 14px;
    gap: 8px;
    color: #344054;
    font-size: 14px;
    font-weight: 400;
}

.custom-dropdown-option:hover {
    cursor: pointer;
    background: #bca3ff1a;
}

/* End of CSS style for Custom Select */

/* View Specific On Phone */
@media (min-width: 0px) and (max-width: 576px) {
    .user-avatar {
        display: none;
    }

    /* +-+-+ Vue Easy Table Custom CSS +-+-+  */
    .customize-table {
        --easy-table-body-row-font-size: 13px;

        --easy-table-header-font-size: 13px;

        --easy-table-header-item-padding: 5px 5px;
    }

    .expand-skill-requirement {
        margin-top: 4px;
        padding: 5px;
        border-radius: 5px;
        background-color: #f2edffcc;
    }

    .expand-tile {
        font-size: 13px;
    }

    .filter-flag-phone {
        left: -140px;
        top: 45px;
    }

    .user-phone-filter-menu {
        left: -25px;
        top: 45px;
    }

    .user-role {
        font-size: 10px;
    }

    .modal-content {
        margin: 75% auto;
        width: 80%;
    }
}
</style>
