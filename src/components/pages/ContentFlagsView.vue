<script>
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useResourcesStore } from '../../stores/ResourcesStore.js';
import { useMCQuestionsStore } from '../../stores/MCQuestionsStore.js';
import { useEssayQuestionsStore } from '../../stores/EssayQuestionsStore.js';
import { useSettingsStore } from '../../stores/SettingsStore';
import { useUserDetailsStore } from '../../stores/UserDetailsStore';

import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';

export default {
    setup() {
        const skillsStore = useSkillsStore();
        const resourcesStore = useResourcesStore();
        const mcQuestionsStore = useMCQuestionsStore();
        const essayQuestionsStore = useEssayQuestionsStore();
        const settingStore = useSettingsStore();
        const userDetailsStore = useUserDetailsStore();
        return {
            skillsStore,
            resourcesStore,
            mcQuestionsStore,
            essayQuestionsStore,
            settingStore,
            userDetailsStore
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
                { text: 'Type', value: 'type' },
                { text: 'Flagged item', value: 'name' },
                { text: 'User', value: 'user' },
                { text: 'Date', value: 'date' },
                { text: '', value: 'action' }
            ],
            // In phone version we dont show some column
            headersPhone: [
                { text: 'Type', value: 'type' },
                { text: 'Flagged item', value: 'name' },
                { text: 'User', value: 'user' },
                { text: '', value: 'action' }
            ],

            rows: [],
            rowsLength: 10,
            // Filter option data for the table
            flagTypeCriteria: 'all',
            dateFilterCriteria: 'all',
            showFlagTypeFilter: false,
            userNameCriteria: '',
            showUserFilter: false,
            showDateFilter: false,
            dateOrder: 'desc',
            searchText: '',
            userRoleCriteria: 'all',
            // Custom drop down flag and state
            showFlagTypeDropDown: false,
            showUserRoleDropDown: false,
            source: null,
            showModal: false,
            showDateFilterDropDown: false,
            dateMonthCriteria: '',
            dateYearCriteria: '',
            dateDayCriteria: '',
            dataTableRef: null,
            dataTableRefM: null,
            isLoading: true,
            // make sure the table is mounted so we can compute the rows per page in peace
            isMounted: false,
            // we need this to determine if the web is in mobile mode
            windowWidth: Infinity
        };
    },
    components: {
        Vue3EasyDataTable
    },
    async mounted() {
        // fetch data from sever
        await this.getContentFlags();

        this.dataTableRef = this.$refs.dataTable;
        this.dataTableRefM = this.$refs.dataTableM;
        this.isLoading = true;
        // fetch setting data if we dont have pagination data yet
        if (
            this.settingStore.todoContentFlagTableRows === 0 ||
            this.settingStore.todoEssayQuestionTableRows === 0 ||
            this.settingStore.todoImageQuestionTableRows === 0 ||
            this.settingStore.todoStudentQuestionTableRows === 0 ||
            this.settingStore.todoMcQuestionTableRows === 0 ||
            this.settingStore.todoSkillTableRows === 0
        ) {
            await this.settingStore.getSettings();
            this.isLoading = false;
        } else {
            this.isLoading = false;
        }
        this.dataTableRef.updateRowsPerPageActiveOption(
            parseInt(this.settingStore.todoContentFlagTableRows)
        );
        this.dataTableRefM.updateRowsPerPageActiveOption(
            parseInt(this.settingStore.todoContentFlagTableRows)
        );
        // tell the compute function that we are ready to listen to rows per page change
        this.isMounted = true;
        this.windowWidth = window.innerWidth;
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
                        const contentObj = JSON.parse(flag.contentData);

                        /**
                         * flagRow is prepared data that we will use in vue-data-table below
                         */
                        const flagRow = {};

                        flagRow.dateString = flag.create_date;
                        flagRow.reason = flag.reason;
                        // Prepare data differently for each type of content
                        switch (flag.content_type) {
                            // Handle for mc question flag
                            case 'mc_question':
                                flagRow.contentId = flag.content_id;
                                // Nicer level names.
                                if (contentObj.level == 'grade_school') {
                                    contentObj.level = 'grade school';
                                } else if (
                                    contentObj.level == 'middle_school'
                                ) {
                                    contentObj.level = 'middle school';
                                } else if (contentObj.level == 'high_school') {
                                    contentObj.level = 'high school';
                                }
                                flagRow.type = 'mc question';
                                flagRow.name = `${contentObj.name} ${contentObj.question}`;
                                flagRow.nameUrl = `skills/${contentObj.url}/question-bank`;
                                flagRow.flagId = flag.id;
                                flagRow.editUrl = `/mc-questions/edit/${flag.content_id}?dismissFlagId=${flagRow.flagId}`;
                                flagRow.expandContent = contentObj;
                                flagRow.user = {
                                    username: flag.username,
                                    id: flag.userId,
                                    role: flag.userRole
                                };

                                break;
                            // Handle for essay question flag
                            case 'essay_question':
                                flagRow.contentId = flag.content_id;
                                flagRow.type = 'essay question';
                                flagRow.name = `${contentObj.name} ${contentObj.question}`;

                                flagRow.nameUrl = `skills/${contentObj.url}/question-bank`;
                                flagRow.flagId = flag.id;
                                flagRow.editUrl = `/essay-questions/edit/${flag.content_id}?dismissFlagId=${flagRow.flagId}`;
                                flagRow.expandContent = contentObj;
                                flagRow.user = {
                                    username: flag.username,
                                    id: flag.userId,
                                    role: flag.userRole
                                };
                                break;
                            // Handle for image question flag
                            case 'image_question':
                                flagRow.contentId = flag.content_id;
                                flagRow.type = 'image question';
                                flagRow.name = `${contentObj.name} ${contentObj.question}`;
                                flagRow.nameUrl = `skills/${contentObj.url}/question-bank`;
                                flagRow.flagId = flag.id;
                                flagRow.editUrl = `/image-questions/edit/${flag.content_id}?dismissFlagId=${flagRow.flagId}`;
                                flagRow.expandContent = contentObj;
                                flagRow.user = {
                                    username: flag.username,
                                    id: flag.userId,
                                    role: flag.userRole
                                };
                                break;
                            // handle for skill flag
                            case 'skill':
                                flagRow.contentId = flag.content_id;
                                flagRow.type = 'skill';
                                flagRow.name = contentObj.name;
                                flagRow.nameUrl = `skills/${contentObj.url}`;
                                flagRow.flagId = flag.id;
                                flagRow.editUrl = `/skills/edit/${flag.content_id}?dismissFlagId=${flagRow.flagId}`;
                                (flagRow.expandContent = contentObj),
                                    (flagRow.user = {
                                        username: flag.username,
                                        id: flag.userId,
                                        role: flag.userRole
                                    });
                                break;
                            // handle for resource flag
                            case 'resource':
                                flagRow.contentId = flag.content_id;
                                flagRow.type = 'source';
                                flagRow.name = `Commented by user: ${contentObj.user} in skill: ${contentObj.skill} forum`;
                                flagRow.nameUrl = `skills/${contentObj.url}`;
                                flagRow.flagId = flag.id;
                                flagRow.editUrl = `/resources/edit/${flag.content_id}?dismissFlagId=${flagRow.flagId}`;
                                flagRow.expandContent = contentObj;
                                flagRow.user = {
                                    username: flag.username,
                                    id: flag.userId,
                                    role: flag.userRole
                                };
                                break;
                            case 'tutor_post':
                                flagRow.contentId = flag.content_id;
                                flagRow.type = 'tutor post';
                                flagRow.name = `Tutor post by user: ${contentObj.user} in skill: ${contentObj.skill} forum`;
                                flagRow.nameUrl = `skills/${contentObj.skillId}`;
                                flagRow.flagId = flag.id;
                                flagRow.editUrl = `/tutor/edit/${flag.content_id}?dismissFlagId=${flagRow.flagId}`;
                                flagRow.expandContent = contentObj;
                                flagRow.user = {
                                    username: flag.username,
                                    id: flag.userId,
                                    role: flag.userRole
                                };
                                break;

                            default:
                                break;
                        }
                        this.rows.push(flagRow);
                    }
                    this.rows = this.rows.sort((a, b) => {
                        const dateA = new Date(a.dateString);
                        const dateB = new Date(b.dateString);
                        return dateB - dateA;
                    });
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

            // *** Date Filter ***
            if (this.dateFilterCriteria !== 'all') {
                filterOptionsArray.push({
                    field: 'dateString',
                    criteria: this.dateFilterCriteria,
                    comparison: (value, criteria) => {
                        const parseDate = new Date(value);
                        const dateNow = new Date();
                        switch (criteria) {
                            case 'this month':
                                return (
                                    parseDate.getMonth() === dateNow.getMonth()
                                );
                            case 'last three month':
                                // Get the date of six month ago from today. This can leave wrong day for date but all we need is the month so it will be okay
                                const compareDate3Month = dateNow.setMonth(
                                    dateNow.getMonth() - 4
                                );
                                return parseDate >= compareDate3Month;
                            case 'last six month':
                                // Get the date of six month ago from today. This can leave wrong day for date but all we need is the month so it will be okay
                                const compareDate = dateNow.setMonth(
                                    dateNow.getMonth() - 7
                                );
                                return parseDate >= compareDate;
                            case 'this year':
                                return (
                                    parseDate.getFullYear() ===
                                    dateNow.getFullYear()
                                );
                            default:
                                break;
                        }
                    }
                });
            }

            // *** Year Filter ***
            if (this.dateYearCriteria !== '') {
                filterOptionsArray.push({
                    field: 'dateString',
                    criteria: this.dateYearCriteria,
                    comparison: (value, criteria) => {
                        const flagDate = new Date(value);
                        return flagDate.getFullYear() == criteria;
                    }
                });
            }

            // *** Month Filter ***
            if (this.dateMonthCriteria !== '') {
                filterOptionsArray.push({
                    field: 'dateString',
                    criteria: this.dateMonthCriteria,
                    comparison: (value, criteria) => {
                        const flagDate = new Date(value);
                        return flagDate.getMonth() == criteria;
                    }
                });
            }

            // *** day Filter ***
            if (this.dateDayCriteria !== '') {
                filterOptionsArray.push({
                    field: 'dateString',
                    criteria: this.dateDayCriteria,
                    comparison: (value, criteria) => {
                        const flagDate = new Date(value);
                        return flagDate.getDate() == criteria;
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
            this.showDateFilter = false;
            this.dateFilterCriteria = 'all';
            this.dateOrder = 'desc';
            this.dateDayCriteria = '';
            this.dateMonthCriteria = '';
            this.dateYearCriteria = '';
        },
        // parse date string into more readable format
        formatDate(dateString) {
            // parse the content data because mysql library return it as a string
            const parseDate = new Date(dateString);
            const createDate = parseDate.toLocaleString('en-gb', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            });
            return `${createDate}`;
        },
        closeAllFilter(showFilter) {
            // Do not close the current open filter
            if (showFilter !== 'date') {
                this.showDateFilter = false;
            }
            if (showFilter !== 'type') {
                this.showFlagTypeFilter = false;
            }
            if (showFilter !== 'user') {
                this.showUserFilter = false;
            }
        },
        // Helper function to show flag name in phone view
        showShortName(name) {
            let shortName = name.slice(0, 10);
            shortName = shortName + ' ...';
            return shortName;
        },
        showWarningModal(source) {
            console.log(source);
            this.source = source;
            this.showModal = true;
        },
        deletePost(content) {
            // Close the modal.
            this.showModal = false;

            // Function to handle fetch requests
            const deleteRequest = async (url) => {
                try {
                    const response = await fetch(url, { method: 'DELETE' });
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                } catch (error) {
                    alert('Failed to delete the item. Please try again.');
                }
            };

            // Delete record from DB
            switch (content.type) {
                case 'tutor post':
                    deleteRequest('/tutor-posts/delete/' + content.contentId);
                    break;
                case 'source':
                    deleteRequest('/resources/delete/' + content.contentId);
                    break;
                case 'mc question':
                    deleteRequest('/questions/mc/' + content.contentId);
                    break;
                case 'essay question':
                    deleteRequest('/questions/essay/' + content.contentId);
                    break;
                default:
                    break;
            }

            // Remove the element from the array
            this.rows = this.rows.filter(
                (element) => element.contentId !== content.contentId
            );
        }
    },
    computed: {
        rowsPerPage() {
            if (this.isMounted) {
                if (
                    parseInt(this.settingStore.todoContentFlagTableRows) !==
                    parseInt(this.dataTableRef?.rowsPerPageActiveOption)
                ) {
                    this.settingStore.todoContentFlagTableRows =
                        this.dataTableRef?.rowsPerPageActiveOption;
                    this.settingStore.saveSettings();
                }
            }
            return this.dataTableRef?.rowsPerPageActiveOption;
        },
        rowsPerPageM() {
            if (this.isMounted && parseInt(this.windowWidth) <= 575) {
                if (
                    parseInt(this.settingStore.todoContentFlagTableRows) !==
                    parseInt(this.dataTableRefM?.rowsPerPageActiveOption)
                ) {
                    this.settingStore.todoContentFlagTableRows =
                        this.dataTableRefM?.rowsPerPageActiveOption;
                    this.settingStore.saveSettings();
                }
            }
            return this.dataTableRef?.rowsPerPageActiveOption;
        }
    },
    watch: {
        dateOrder: {
            handler(newVal, oldVal) {
                if (newVal === 'asc') {
                    this.rows = this.rows.sort((a, b) => {
                        const dateA = new Date(a.dateString);
                        const dateB = new Date(b.dateString);
                        return dateA - dateB;
                    });
                } else {
                    this.rows = this.rows.sort((a, b) => {
                        const dateA = new Date(a.dateString);
                        const dateB = new Date(b.dateString);
                        return dateB - dateA;
                    });
                }
            }
        }
    }
};
</script>

<template>
    <div class="mb-2">
        <!-- Search Bar -->
        <div>
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
        <div class="pb-3 d-none d-md-block table-div">
            <Vue3EasyDataTable
                ref="dataTable"
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
                <!-- Loading animation -->
                <template #loading>
                    <div
                        class="d-flex justify-content-center align-items-center mt-5"
                    >
                        <span class="loader"></span>
                    </div>
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

                <!-- --- Date column --- -->
                <template #item-date="{ dateString }">
                    <div class="date-cell">
                        {{ formatDate(dateString) }}
                    </div>
                </template>
                <!-- --- Action Buttons Column --- -->
                <template #item-action="{ flagId, editUrl, type, contentId }">
                    <div
                        class="pb-2 pt-2 d-flex flex-column flex-lg-row gap-1 align-items-center"
                    >
                        <router-link
                            :to="editUrl"
                            class="btn primary-btn"
                            b-tooltip.hover
                            :title="'Edit flagged item'"
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
                            :title="'Dismiss flag'"
                            class="btn red-btn"
                            @click="handleOpenDismissModal(flagId)"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 576 512"
                                width="16"
                                height="17"
                                fill="white"
                            >
                                <path
                                    d="M290.7 57.4L57.4 290.7c-25 25-25 65.5 0 90.5l80 80c12 12 28.3 18.7 45.3 18.7H288h9.4H512c17.7 0 32-14.3 32-32s-14.3-32-32-32H387.9L518.6 285.3c25-25 25-65.5 0-90.5L381.3 57.4c-25-25-65.5-25-90.5 0zM297.4 416H288l-105.4 0-80-80L227.3 211.3 364.7 348.7 297.4 416z"
                                />
                            </svg>
                        </button>
                        <button
                            v-if="
                                type === 'tutor post' ||
                                type === 'mc question' ||
                                type === 'essay question' ||
                                type === 'source'
                            "
                            b-tooltip.hover
                            :title="'Delete flagged item'"
                            class="btn red-btn"
                            @click="showWarningModal({ contentId, type })"
                        >
                            <!-- X icon -->
                            <svg
                                width="14"
                                height="16"
                                viewBox="0 0 20 20"
                                fill="white"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M0.312625 14.5205L4.83312 9.99999L0.312625 5.49218C0.111396 5.29025 -0.00159545 5.0168 -0.00159545 4.73172C-0.00159545 4.44665 0.111396 4.17319 0.312625 3.97126L3.96282 0.312625C4.16474 0.111396 4.4382 -0.00159545 4.72327 -0.00159545C5.00835 -0.00159545 5.2818 0.111396 5.48373 0.312625L9.99999 4.83312L14.5205 0.312625C14.6204 0.21056 14.7397 0.12947 14.8714 0.0741101C15.003 0.0187502 15.1444 -0.00976563 15.2873 -0.00976562C15.4301 -0.00976563 15.5715 0.0187502 15.7032 0.0741101C15.8349 0.12947 15.9541 0.21056 16.0541 0.312625L19.6874 3.96282C19.8886 4.16474 20.0016 4.4382 20.0016 4.72327C20.0016 5.00835 19.8886 5.2818 19.6874 5.48373L15.1669 9.99999L19.6874 14.5205C19.8883 14.7217 20.0012 14.9944 20.0012 15.2788C20.0012 15.5632 19.8883 15.836 19.6874 16.0372L16.0541 19.6874C15.8529 19.8883 15.5801 20.0012 15.2957 20.0012C15.0113 20.0012 14.7386 19.8883 14.5374 19.6874L9.99999 15.1669L5.49218 19.6874C5.29025 19.8886 5.0168 20.0016 4.73172 20.0016C4.44665 20.0016 4.17319 19.8886 3.97126 19.6874L0.312625 16.0541C0.21056 15.9541 0.12947 15.8349 0.0741101 15.7032C0.0187502 15.5715 -0.00976563 15.4301 -0.00976562 15.2873C-0.00976563 15.1444 0.0187502 15.003 0.0741101 14.8714C0.12947 14.7397 0.21056 14.6204 0.312625 14.5205Z"
                                />
                            </svg>
                        </button>
                        <!---------------------------------------------------------->
                    </div>
                </template>

                <!-- ---  Expand Part --- -->
                <template #expand="{ expandContent, type, reason }">
                    <div class="p-4">
                        <!-- Reason section shared with all types of flag  -->
                        <div class="row mb-2">
                            <div class="col">
                                <h6 class="secondary-heading">
                                    Reason for flagging:
                                </h6>
                            </div>
                            <div class="col">
                                {{
                                    reason
                                        ? reason
                                        : 'No reason given for this flag'
                                }}
                            </div>
                        </div>
                        <!-- MC Question Expand -->
                        <div v-if="type == 'mc question'">
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Skill:</h6>
                                </div>
                                <div class="col">
                                    <router-link
                                        :to="'skills/' + expandContent.url"
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
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Level:</h6>
                                </div>
                                <div class="col">{{ expandContent.level }}</div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Name:</h6>
                                </div>
                                <div class="col">
                                    {{ expandContent.name }}
                                </div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Question:</h6>
                                </div>
                                <div class="col">
                                    {{ expandContent.question }}
                                </div>
                            </div>
                            <div class="">
                                <div
                                    class="row mb-2 border-bottom border-opacity-75 pb-2"
                                >
                                    <div class="col">
                                        <h6 class="secondary-heading">
                                            Correct answer number:
                                        </h6>
                                    </div>
                                    <div class="col">
                                        {{ expandContent.correctAnswer }}
                                    </div>
                                </div>
                                <div class="row mb-2 border-bottom pb-2">
                                    <div class="col">
                                        <h6 class="secondary-heading">
                                            Answer option 1:
                                        </h6>
                                    </div>
                                    <div class="col">
                                        {{ expandContent.answer1 }}
                                    </div>
                                </div>
                                <div class="row mb-2 border-bottom pb-2">
                                    <div class="col">
                                        <h6 class="secondary-heading">
                                            Answer option 2:
                                        </h6>
                                    </div>
                                    <div class="col">
                                        {{ expandContent.answer2 }}
                                    </div>
                                </div>
                                <div class="row mb-2 border-bottom pb-2">
                                    <div class="col">
                                        <h6 class="secondary-heading">
                                            Answer option 3:
                                        </h6>
                                    </div>
                                    <div class="col">
                                        {{ expandContent.answer3 }}
                                    </div>
                                </div>
                                <div class="row mb-2 border-bottom pb-2">
                                    <div class="col">
                                        <h6 class="secondary-heading">
                                            Answer option 4:
                                        </h6>
                                    </div>
                                    <div class="col">
                                        {{ expandContent.answer4 }}
                                    </div>
                                </div>
                                <div class="row mb-2 </div>border-bottom pb-2">
                                    <div class="col">
                                        <h6 class="secondary-heading">
                                            Answer option 5:
                                        </h6>
                                    </div>
                                    <div class="col">
                                        {{ expandContent.answer5 }}
                                    </div>
                                </div>
                            </div>

                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">
                                        Explanation:
                                    </h6>
                                </div>
                                <div class="col">
                                    {{ expandContent.explanation }}
                                </div>
                            </div>
                        </div>
                        <!-- Essay Expand content -->
                        <div v-if="type == 'essay question'">
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">
                                        Belongs to skill:
                                    </h6>
                                </div>
                                <div class="col">
                                    <router-link
                                        :to="'skills/' + expandContent.url"
                                        target="_blank"
                                        b-tooltip.hover
                                        :style="{ color: '#8f7bd6' }"
                                        :title="'Skill'"
                                        >{{
                                            expandContent.skillName
                                        }}</router-link
                                    >
                                </div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Level:</h6>
                                </div>
                                <div class="col">{{ expandContent.level }}</div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Name:</h6>
                                </div>
                                <div class="col">{{ expandContent.name }}</div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Question:</h6>
                                </div>
                                <div class="col">
                                    {{ expandContent.question }}
                                </div>
                            </div>
                        </div>
                        <!-- Image Expand content -->
                        <div v-if="type == 'image question'">
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">
                                        Belongs to skill:
                                    </h6>
                                </div>
                                <div class="col">
                                    <router-link
                                        :to="'skills/' + expandContent.url"
                                        target="_blank"
                                        b-tooltip.hover
                                        :style="{ color: '#8f7bd6' }"
                                        :title="'Go to skill'"
                                        >{{
                                            expandContent.skillName
                                        }}</router-link
                                    >
                                </div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Level:</h6>
                                </div>
                                <div class="col">{{ expandContent.level }}</div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Name:</h6>
                                </div>
                                <div class="col">{{ expandContent.name }}</div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Question:</h6>
                                </div>
                                <div class="col">
                                    {{ expandContent.question }}
                                </div>
                            </div>
                        </div>
                        <!-- Skill expanded content -->
                        <div v-if="type == 'skill'">
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Skill:</h6>
                                </div>
                                <div class="col">
                                    {{ expandContent.name }}
                                </div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">
                                        Mastery Requirements:
                                    </h6>
                                </div>
                                <div
                                    class="col expand-skill-requirement"
                                    v-html="expandContent.masteryRequirements"
                                ></div>
                            </div>
                        </div>
                        <!-- Resource expanded content -->
                        <div v-if="type == 'source'">
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Skill:</h6>
                                </div>
                                <div class="col">{{ expandContent.skill }}</div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">User:</h6>
                                </div>
                                <div class="col">{{ expandContent.user }}</div>
                            </div>
                            <div class="row flex-column mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Content:</h6>
                                </div>
                                <div
                                    class="col expand-skill-requirement"
                                    v-html="expandContent.content"
                                ></div>
                            </div>
                        </div>
                        <div v-if="type == 'tutor post'">
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Skill:</h6>
                                </div>
                                <div class="col">{{ expandContent.skill }}</div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">User:</h6>
                                </div>
                                <div class="col">{{ expandContent.user }}</div>
                            </div>
                            <div class="row flex-column mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">
                                        Description:
                                    </h6>
                                </div>
                                <div
                                    class="col expand-skill-requirement"
                                    v-html="expandContent.description"
                                ></div>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- --- User Column --- -->
                <template #item-user="{ user }">
                    <div class="user-cell">
                        {{ user.username }}

                        <span class="user-role">
                            {{ user.role }}
                        </span>
                    </div>
                </template>

                <!-- --- Type Column -->
                <template #item-type="{ type }">
                    <div class="text-capitalize">
                        {{ type }}
                    </div>
                </template>

                <!-- Flag Type Header Filtering -->
                <template #header-type="header">
                    <div class="filter-column">
                        <button
                            @click.stop="
                                closeAllFilter('type');
                                showFlagTypeFilter = !showFlagTypeFilter;
                            "
                            b-tooltip.hover
                            :title="'filter this column'"
                            class="header-btn"
                        >
                            <span class="me-1 header-text">
                                {{ header.text }}
                            </span>
                            <svg
                                class="filter-icon"
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
                        </button>
                        <Transition name="dropdown">
                            <div
                                class="filter-menu flag-type-filter"
                                v-if="showFlagTypeFilter"
                            >
                                <!-- Custom Dropdown -->
                                <div class="d-flex flex-column">
                                    <button
                                        :class="[
                                            'filter-btn',
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
                                    </button>
                                    <Transition name="dropdownFilter">
                                        <div
                                            v-if="showFlagTypeDropDown"
                                            class="custom-dropdown-base"
                                        >
                                            <button
                                                class="custom-dropdown-option"
                                                @click="
                                                    flagTypeCriteria =
                                                        'tutor post';
                                                    showFlagTypeFilter = false;
                                                    showFlagTypeDropDown = false;
                                                "
                                            >
                                                tutor post
                                            </button>
                                            <button
                                                class="custom-dropdown-option"
                                                @click="
                                                    flagTypeCriteria =
                                                        'essay question';
                                                    showFlagTypeDropDown = false;
                                                    showFlagTypeFilter = false;
                                                "
                                            >
                                                essay question
                                            </button>
                                            <button
                                                class="custom-dropdown-option"
                                                @click="
                                                    flagTypeCriteria =
                                                        'mc question';
                                                    showFlagTypeDropDown = false;
                                                    showFlagTypeFilter = false;
                                                "
                                            >
                                                mc question
                                            </button>
                                            <button
                                                class="custom-dropdown-option"
                                                @click="
                                                    flagTypeCriteria =
                                                        'image question';
                                                    showFlagTypeDropDown = false;
                                                    showFlagTypeFilter = false;
                                                "
                                            >
                                                image question
                                            </button>
                                            <button
                                                class="custom-dropdown-option"
                                                @click="
                                                    flagTypeCriteria = 'skill';
                                                    showFlagTypeDropDown = false;
                                                    showFlagTypeFilter = false;
                                                "
                                            >
                                                skill
                                            </button>
                                            <button
                                                class="custom-dropdown-option"
                                                @click="
                                                    flagTypeCriteria = 'source';
                                                    showFlagTypeDropDown = false;
                                                    showFlagTypeFilter = false;
                                                "
                                            >
                                                source
                                            </button>
                                            <button
                                                class="custom-dropdown-option"
                                                @click="
                                                    flagTypeCriteria = 'all';
                                                    showFlagTypeDropDown = false;
                                                    showFlagTypeFilter;
                                                "
                                            >
                                                all
                                            </button>
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
                        <button
                            @click.stop="
                                closeAllFilter('user');
                                showUserFilter = !showUserFilter;
                            "
                            b-tooltip.hover
                            :title="'Search for user name'"
                            class="header-btn"
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
                        </button>
                        <Transition name="dropdown">
                            <div
                                class="filter-menu user-filter-menu"
                                v-if="showUserFilter"
                            >
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
                                    <div id="filter-label">User Role:</div>
                                    <!-- Custom Dropdown -->
                                    <div class="d-flex flex-column">
                                        <button
                                            :class="[
                                                'filter-btn',
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
                                        </button>
                                        <Transition name="dropdownFilter">
                                            <div
                                                v-if="showUserRoleDropDown"
                                                class="custom-dropdown-base"
                                            >
                                                <button
                                                    class="custom-dropdown-option"
                                                    @click="
                                                        userRoleCriteria =
                                                            'all';
                                                        showUserRoleDropDown = false;
                                                    "
                                                >
                                                    All
                                                </button>
                                                <button
                                                    class="custom-dropdown-option"
                                                    @click="
                                                        userRoleCriteria =
                                                            'student';
                                                        showUserRoleDropDown = false;
                                                    "
                                                >
                                                    Student
                                                </button>
                                                <button
                                                    class="custom-dropdown-option"
                                                    @click="
                                                        userRoleCriteria =
                                                            'instructor';
                                                        showUserRoleDropDown = false;
                                                    "
                                                >
                                                    Instructor
                                                </button>
                                                <button
                                                    class="custom-dropdown-option"
                                                    @click="
                                                        userRoleCriteria =
                                                            'admin';
                                                        showUserRoleDropDown = false;
                                                    "
                                                >
                                                    Admin
                                                </button>
                                            </div>
                                        </Transition>
                                    </div>
                                    <!-- End of custom dropdown -->
                                </div>
                            </div>
                        </Transition>
                    </div>
                </template>

                <!-- Date Header (Date filter and sorting) -->
                <template #header-date="header">
                    <div class="filter-column user-header">
                        <button
                            @click.stop="
                                closeAllFilter('date');
                                showDateFilter = !showDateFilter;
                            "
                            b-tooltip.hover
                            :title="'Date filtering and ordering'"
                            class="header-btn"
                        >
                            <span id="type-head-tile" class="me-1">
                                {{ header.text }}
                            </span>
                            <!-- Calender icon -->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                                width="16"
                                height="14"
                                class="mb-1 filter-icon"
                                fill="#8f7bd6"
                            >
                                <path
                                    d="M128 0c17.7 0 32 14.3 32 32l0 32 128 0 0-32c0-17.7 14.3-32 32-32s32 14.3 32 32l0 32 48 0c26.5 0 48 21.5 48 48l0 48L0 160l0-48C0 85.5 21.5 64 48 64l48 0 0-32c0-17.7 14.3-32 32-32zM0 192l448 0 0 272c0 26.5-21.5 48-48 48L48 512c-26.5 0-48-21.5-48-48L0 192zm80 64c-8.8 0-16 7.2-16 16l0 96c0 8.8 7.2 16 16 16l96 0c8.8 0 16-7.2 16-16l0-96c0-8.8-7.2-16-16-16l-96 0z"
                                />
                            </svg>
                        </button>
                        <Transition name="dropdown">
                            <div
                                class="filter-menu date-filter-menu"
                                v-if="showDateFilter"
                            >
                                <div class="d-flex flex-row gap-3">
                                    <div class="d-flex flex-column">
                                        <!-- Sort order -->
                                        <div class="d-flex flex-column">
                                            <div class="filter-label">
                                                Date order
                                            </div>

                                            <label
                                                class="control control-checkbox mt-2"
                                            >
                                                <span class="my-auto mx-2 me-4">
                                                    ascending</span
                                                >
                                                <input
                                                    type="radio"
                                                    value="asc"
                                                    v-model="dateOrder"
                                                />
                                                <div
                                                    class="control_indicator"
                                                ></div>
                                            </label>
                                            <label
                                                class="control control-checkbox mt-2"
                                            >
                                                <span class="my-auto mx-2 me-4">
                                                    descending</span
                                                >
                                                <input
                                                    type="radio"
                                                    value="desc"
                                                    v-model="dateOrder"
                                                />
                                                <div
                                                    class="control_indicator"
                                                ></div>
                                            </label>
                                        </div>

                                        <!-- Date filter -->
                                        <div class="mt-2 d-flex flex-column">
                                            <div class="filter-label">
                                                Flag Date:
                                            </div>
                                            <!-- Custom Dropdown -->
                                            <div class="d-flex flex-column">
                                                <button
                                                    :class="[
                                                        'filter-btn',
                                                        showDateFilterDropDown
                                                            ? 'custom-select-button-focus'
                                                            : 'custom-select-button'
                                                    ]"
                                                    @click="
                                                        showDateFilterDropDown =
                                                            !showDateFilterDropDown
                                                    "
                                                >
                                                    {{ dateFilterCriteria }}
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
                                                </button>
                                                <Transition
                                                    name="dropdownFilter"
                                                >
                                                    <div
                                                        v-if="
                                                            showDateFilterDropDown
                                                        "
                                                        class="custom-dropdown-base"
                                                    >
                                                        <button
                                                            class="custom-dropdown-option"
                                                            @click="
                                                                dateFilterCriteria =
                                                                    'all';
                                                                showDateFilterDropDown = false;
                                                            "
                                                        >
                                                            All
                                                        </button>
                                                        <button
                                                            class="custom-dropdown-option"
                                                            @click="
                                                                dateFilterCriteria =
                                                                    'this month';
                                                                showDateFilterDropDown = false;
                                                            "
                                                        >
                                                            This month
                                                        </button>
                                                        <button
                                                            class="custom-dropdown-option"
                                                            @click="
                                                                dateFilterCriteria =
                                                                    'last three month';
                                                                showDateFilterDropDown = false;
                                                            "
                                                        >
                                                            Last three months
                                                        </button>
                                                        <button
                                                            class="custom-dropdown-option"
                                                            @click="
                                                                dateFilterCriteria =
                                                                    'last six month';
                                                                showDateFilterDropDown = false;
                                                            "
                                                        >
                                                            Last six months
                                                        </button>
                                                        <button
                                                            class="custom-dropdown-option"
                                                            @click="
                                                                dateFilterCriteria =
                                                                    'this year';
                                                                showDateFilterDropDown = false;
                                                            "
                                                        >
                                                            This year
                                                        </button>
                                                    </div>
                                                </Transition>
                                            </div>
                                            <!-- End of custom dropdown -->
                                        </div>
                                    </div>
                                    <div class="d-flex flex-column">
                                        <!-- Year Filter -->
                                        <div class="mt-2 d-flex flex-column">
                                            <div
                                                class="filter-label date-label"
                                            >
                                                Choose Year:
                                            </div>
                                            <div
                                                class="d-flex user-filter date-filter-input"
                                            >
                                                <input
                                                    placeholder="input number"
                                                    type="text"
                                                    v-model="dateYearCriteria"
                                                />
                                            </div>
                                        </div>
                                        <!-- Month Filter -->
                                        <div class="mt-2 d-flex flex-column">
                                            <div
                                                class="filter-label date-label"
                                            >
                                                Choose Month:
                                            </div>
                                            <div
                                                class="d-flex user-filter date-filter-input"
                                            >
                                                <input
                                                    type="text"
                                                    v-model="dateMonthCriteria"
                                                    placeholder="input number"
                                                />
                                            </div>
                                        </div>
                                        <!-- Day Filter -->
                                        <div class="mt-2 d-flex flex-column">
                                            <div
                                                class="filter-label date-label"
                                            >
                                                Choose Day:
                                            </div>
                                            <div
                                                class="d-flex user-filter date-filter-input"
                                            >
                                                <input
                                                    type="text"
                                                    v-model="dateDayCriteria"
                                                    placeholder="input day"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Transition>
                    </div>
                </template>
            </Vue3EasyDataTable>
        </div>
        <!-- ++++++++++++++++++++++++++++_______________________________ ++++++++++++++++++++++++++++ -->

        <!-- Vue Data Table Phone -->
        <div class="mt-5 pb-3 d-md-none">
            <Vue3EasyDataTable
                ref="dataTableM"
                :headers="headersPhone"
                :items="rows"
                alternating
                :loading="!isContentFlagsLoaded"
                table-class-name="customize-table"
                :filter-options="filterOptions()"
                :search-value="searchText"
                buttons-pagination
                theme-color="#a48be6"
            >
                <!-- Loading animation -->
                <template #loading>
                    <div
                        class="d-flex justify-content-center align-items-center mt-5"
                    >
                        <span class="loader"></span>
                    </div>
                </template>
                <!-- --- Flag Name Column ---  -->
                <template #item-name="{ name, nameUrl }">
                    <RouterLink
                        class="flag-name"
                        :to="`/${nameUrl}`"
                        target="_blank"
                        >{{ showShortName(name) }}</RouterLink
                    >
                </template>
                <!-- --- Action Buttons Column -->
                <template #item-action="{ flagId, editUrl, type }">
                    <div
                        class="pb-2 pt-2 d-flex flex-column flex-lg-row gap-1 align-items-center"
                    >
                        <router-link
                            :to="editUrl"
                            class="btn primary-btn"
                            target="_blank"
                            b-tooltip.hover
                            :title="'Edit flagged item'"
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
                            :title="'Dismiss flag'"
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
                <!----- Expanded Part ----->
                <template #expand="{ expandContent, type, reason, dateString }">
                    <div class="p-4">
                        <!-- ---- Reason flagged ---- -->
                        <div class="row mb-2">
                            <div class="col">
                                <h6 class="secondary-heading">
                                    Reason for flagging:
                                </h6>
                            </div>
                            <div class="col" :class="[!reason && 'no-reason']">
                                {{
                                    reason
                                        ? reason
                                        : 'There is no reason for this flag.'
                                }}
                            </div>
                        </div>
                        <!-- Date this flag created -->
                        <div class="row mb-2">
                            <div class="col">
                                <h6 class="secondary-heading">Date:</h6>
                            </div>
                            <div class="col date-cell">
                                {{ formatDate(dateString) }}
                            </div>
                        </div>
                        <!-- MC question expanded content -->
                        <div v-if="type == 'mc question'">
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Skill:</h6>
                                </div>
                                <div class="col">
                                    <router-link
                                        :to="'skills/' + expandContent.url"
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
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Level:</h6>
                                </div>
                                <div class="col">{{ expandContent.level }}</div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Name:</h6>
                                </div>
                                <div class="col">
                                    {{ expandContent.name }}
                                </div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Question:</h6>
                                </div>
                                <div class="col">
                                    {{ expandContent.question }}
                                </div>
                            </div>
                            <div
                                class="row mb-2 border-bottom border-opacity-75 pb-2"
                            >
                                <div class="col">
                                    <h6 class="secondary-heading">
                                        Correct answer number:
                                    </h6>
                                </div>
                                <div class="col">
                                    {{ expandContent.correctAnswer }}
                                </div>
                            </div>
                            <div class="row mb-2 border-bottom pb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">
                                        Answer option 1:
                                    </h6>
                                </div>
                                <div class="col">
                                    {{ expandContent.answer1 }}
                                </div>
                            </div>
                            <div class="row mb-2 border-bottom pb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">
                                        Answer option 2:
                                    </h6>
                                </div>
                                <div class="col">
                                    {{ expandContent.answer2 }}
                                </div>
                            </div>
                            <div class="row mb-2 border-bottom pb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">
                                        Answer option 3:
                                    </h6>
                                </div>
                                <div class="col">
                                    {{ expandContent.answer3 }}
                                </div>
                            </div>
                            <div class="row mb-2 border-bottom pb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">
                                        Answer option 4:
                                    </h6>
                                </div>
                                <div class="col">
                                    {{ expandContent.answer4 }}
                                </div>
                            </div>
                            <div class="row mb-2 border-bottom pb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">
                                        Answer option 5:
                                    </h6>
                                </div>
                                <div class="col">
                                    {{ expandContent.answer5 }}
                                </div>
                            </div>

                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">
                                        Explanation:
                                    </h6>
                                </div>
                                <div class="col">
                                    {{ expandContent.explanation }}
                                </div>
                            </div>
                        </div>
                        <!--- Essay expanded content -->
                        <div v-if="type == 'essay question'">
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">
                                        Belong to skill:
                                    </h6>
                                </div>
                                <div class="col">
                                    <router-link
                                        :to="'skills/' + expandContent.url"
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
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Level:</h6>
                                </div>
                                <div class="col">{{ expandContent.level }}</div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Name:</h6>
                                </div>
                                <div class="col">{{ expandContent.name }}</div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Question:</h6>
                                </div>
                                <div class="col">
                                    {{ expandContent.question }}
                                </div>
                            </div>
                        </div>
                        <!-- Skill expanded content -->
                        <div v-if="type == 'skill'">
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Skill:</h6>
                                </div>
                                <div class="col">{{ expandContent.name }}</div>
                            </div>

                            <div class="col">
                                <h6 class="secondary-heading">
                                    Mastery Requirements:
                                </h6>
                            </div>
                            <div
                                class="col expand-skill-requirement"
                                v-html="expandContent.masteryRequirements"
                            ></div>
                        </div>
                        <!-- Resources expanded content -->
                        <div v-if="type == 'source'">
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Skill:</h6>
                                </div>
                                <div class="col">{{ expandContent.skill }}</div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">User:</h6>
                                </div>
                                <div class="col">{{ expandContent.user }}</div>
                            </div>
                            <div class="row flex-column mb-2">
                                <div class="col">
                                    <h6 class="secondary-heading">Content:</h6>
                                </div>
                                <div
                                    class="col expand-skill-requirement"
                                    v-html="expandContent.content"
                                ></div>
                            </div>
                        </div>
                    </div>
                </template>
                <!-- --- User Column --- -->
                <template #item-user="{ user }">
                    <div class="user-cell">
                        {{ user.username }}

                        <span class="user-role">
                            {{ user.role }}
                        </span>
                    </div>
                </template>

                <!-- --- Flag Type Header Filtering --- -->
                <template #header-type="header">
                    <div class="filter-column">
                        <div
                            @click.stop="
                                closeAllFilter('type');
                                showFlagTypeFilter = !showFlagTypeFilter;
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
                                                        'tutor post';
                                                    showFlagTypeFilter = false;
                                                    showFlagTypeDropDown = false;
                                                "
                                            >
                                                tutor post
                                            </div>
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
                                            <button
                                                class="custom-dropdown-option"
                                                @click="
                                                    flagTypeCriteria =
                                                        'image question';
                                                    showFlagTypeDropDown = false;
                                                    showFlagTypeFilter = false;
                                                "
                                            >
                                                image question
                                            </button>
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
                                                    flagTypeCriteria = 'source';
                                                    showFlagTypeFilter = false;
                                                    showFlagTypeDropDown = false;
                                                "
                                            >
                                                source
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
                            @click.stop="
                                closeAllFilter('user');
                                showUserFilter = !showUserFilter;
                            "
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
                                    <div id="filter-label">User Role:</div>
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
            <button
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
            </button>
        </div>

        <div class="d-none">{{ rowsPerPage }} {{ rowsPerPageM }}</div>
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
    <!-- The Modal -->
    <div v-if="showModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
                <p>Are you sure you want to delete this {{ source.type }}?</p>
                <div style="display: flex; gap: 10px">
                    <button
                        type="button"
                        class="btn btn-danger"
                        @click="deletePost(this.source)"
                    >
                        Yes
                    </button>
                    <button
                        type="button"
                        class="btn btn-dark"
                        @click="showModal = false"
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.flag-container {
    background-color: #f2edff;
    border-radius: 12px;
    padding: 5px;
    padding-top: 25px;
    padding-bottom: 30px;
}

.search-bar {
    background-color: var(--primary-color);
    border-radius: 5px;
    width: fit-content;
    padding-right: 8px;
    padding-top: 2px;
    padding-bottom: 2px;
    padding-left: 2px;
    align-items: center;
    gap: 5px;
    float: right;
}

.search-bar input {
    outline: none;
}

.btn:focus {
    outline: none;
    border: 2px solid var(--primary-color);
    border-radius: 6px;
    scale: 1.2;
}

.filter-btn:focus {
    border: 1px solid var(--primary-color);
    outline: none;
}

.flag-name {
    text-overflow: ellipsis;
    /* Needed to make the over flow work */
    overflow: hidden;
}

.flag-name:hover {
    text-decoration: underline;
}

.flag-name:focus {
    outline: none;
    border: var(--primary-color) 1px solid;
    border-radius: 5px;
}

.expand-tile {
    font-size: 16px;
    color: var(--primary-color);
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

.date-filter-menu {
    left: -60px;
    width: fit-content;
}

/* +-+-+ Vue Easy Table Custom CSS +-+-+  */
.customize-table {
    --easy-table-body-row-font-size: 16px;
    --easy-table-header-font-size: 18px;
    --easy-table-header-font-color: var(--primary-color);
    --easy-table-header-background-color: #fefefe;
    --easy-table-header-height: 50px;
    --easy-table-header-item-padding: 15px 5px;
}

/* Expand components CSS */

.date-cell {
    color: #475569;
    font-family: 'Poppins' sans-serif;
    font-size: 15px;
}

.expand-skill-requirement {
    margin-top: 10px;
    padding: 15px 20px;
    border-radius: 5px;
    background-color: #f2edffcc;
    font-family: Arial, Helvetica, sans-serif;
}

.user-header {
    padding-left: 10px;
}

.user-cell {
    display: flex;
    flex-direction: column;
    padding: 10px 0px;
    margin-left: 0px;
}

.user-role {
    color: #475569;
    font-size: 15px;
}

.filter-icon {
    cursor: pointer;
}

.header-btn {
    background-color: inherit;
    border: none;
    outline: none;
    color: inherit;
    font-weight: inherit;
}

.header-btn:focus {
    border: 1px solid var(--primary-color);
    border-radius: 8px;
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
    box-shadow: 4px 3px 2px rgba(0, 0, 0, 0.2);
}

.filter-column {
    display: flex;
    align-items: center;
    justify-items: center;
    position: relative;
}

.user-filter {
    border: var(--primary-color) 1px solid;
    border-radius: 5px;
    display: flex;
    align-items: center;
    padding: 2px;
}

.user-filter input {
    outline: none;
    border: 0px;
}

.date-filter-input input {
    width: 100%;
}

.flag-type-filter {
    left: -10px;
}

.no-reason {
    border: 3px double #eed202;
    color: #e9d543;
    background-color: white !important;
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
    border: 1px solid var(--primary-color);
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
    border: 1px solid var(--primary-color);
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
    border: 1px solid var(--primary-color);
    box-shadow: 0px 4px 6px -2px #10182808;
    box-shadow: 0px 12px 16px -4px #10182814;
    width: 200px;
}

.custom-dropdown-base:focus {
    border: 1px solid var(--primary-color);
}

.custom-dropdown-option {
    padding: 10px 14px 10px 14px;
    gap: 8px;
    color: #344054;
    font-size: 14px;
    font-weight: 400;
    background-color: inherit;
    border: none;
    width: 100%;
    outline: none;
    text-align: left;
}

.custom-dropdown-option:hover {
    cursor: pointer;
    background: #bca3ff1a;
}

.custom-dropdown-option:focus {
    border-radius: 6px;
    border: 1px solid var(--primary-color);
    background: #bca3ff1a;
}

/* End of CSS style for Custom Select */
.form-validate {
    font-size: 0.75rem;
    color: red;
    font-weight: 300;
}

.filter-label {
    color: #888;
    font-size: 16px;
    font-weight: 400;
    margin-top: 15px;
}

.date-label {
    width: 120px;
}
/**-------------------------------------  */
/* A lot of CSS to styling two check box */
.control {
    font-family: 'Poppins' sans-serif;
    display: block;
    position: relative;
    padding-left: 30px;
    margin-bottom: 5px;
    padding-top: 3px;
    cursor: pointer;
}

.control > span {
    font-weight: 500;
    font-size: 0.938rem;
    color: #667085;
    text-align: center;
}
.control input {
    position: absolute;
    z-index: -1;
    opacity: 0;
}
.control_indicator {
    position: absolute;
    top: 2px;
    left: 0;
    height: 29.09px;
    width: 29.09px;
    background: #f9f5ff;
    border: 1.45px solid var(--primary-color);
    border-radius: 8.73px;
}
.control:hover input ~ .control_indicator,
.control input:focus ~ .control_indicator {
    background: #e7ddf6;
}

.control input:focus ~ .control_indicator {
    background: #826fa0;
}

.plus-svg:hover {
    cursor: pointer;
}
.control input:checked ~ .control_indicator {
    background: #f9f5ff;
}
.control:hover input:not([disabled]):checked ~ .control_indicator,
.control input:checked:focus ~ .control_indicator {
    background: #f9f5ff;
}
.control input:disabled ~ .control_indicator {
    background: #e6e6e6;
    opacity: 0.6;
    pointer-events: none;
}
.control_indicator:after {
    box-sizing: unset;
    content: '';
    position: absolute;
    display: none;
}
.control input:checked ~ .control_indicator:after {
    display: block;
}
.control-checkbox .control_indicator:after {
    left: 4px;
    top: 5px;
    width: 13.58px;
    height: 9.33px;
    border: solid var(--primary-color);
    border-width: 0px 0px 2.9px 2.9px;
    transform: rotate(-45deg);
}
.control-checkbox input:disabled ~ .control_indicator:after {
    border-color: #7b7b7b;
}
.control-checkbox .control_indicator::before {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 4.5rem;
    height: 4.5rem;
    margin-left: -1.3rem;
    margin-top: -1.3rem;
    background: var(--primary-color);
    border-radius: 3rem;
    opacity: 0.6;
    z-index: 99999;
    transform: scale(0);
}

.control-checkbox input + .control_indicator::before {
    animation: s-ripple 250ms ease-out;
}
.control-checkbox input:checked + .control_indicator::before {
    animation-name: s-ripple-dup;
}

/* End of check box styling */

/* View Specific On Phone */
@media (min-width: 0px) and (max-width: 576px) {
    /* +-+-+ Vue Easy Table Custom CSS +-+-+  */
    .customize-table {
        --easy-table-body-row-font-size: 13px;

        --easy-table-header-font-size: 13px;

        --easy-table-header-item-padding: 5px 5px;

        --easy-table-min-height: 70vh;
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
        left: 0px;
        top: 45px;
    }

    .user-phone-filter-menu {
        left: -125px;
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

/* View Specific on Tablet */
@media (min-width: 577px) and (max-width: 1380px) {
    .date-filter-menu {
        left: -190px;
    }

    .user-filter-menu {
        left: -40px;
    }
}

/* Loading animation */
.loader {
    width: 48px;
    height: 48px;
    border: 5px solid var(--primary-color);
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
/* End of loading animation */
</style>
