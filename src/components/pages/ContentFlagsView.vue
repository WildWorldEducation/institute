<script>
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
                { text: 'Type', value: 'type' },
                { text: 'Action', value: 'action' }
            ],

            rows: []
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
                                const tableRow = {
                                    type: 'mc question',
                                    name:
                                        contentObj.name +
                                        ' ' +
                                        contentObj.question,
                                    nameUrl:
                                        'skills/' +
                                        flag.content_id +
                                        '/question-bank',
                                    flagId: flag.id,
                                    editUrl:
                                        '/mc-questions/edit/' + flag.content_id,
                                    expandContent: contentObj
                                };
                                this.rows.push(tableRow);
                                break;

                            default:
                                break;
                        }
                        // if (this.contentFlags[i].content_type == 'skill') {
                        //     for (
                        //         let j = 0;
                        //         j < this.skillsStore.skillsList.length;
                        //         j++
                        //     ) {
                        //         if (
                        //             this.contentFlags[i].content_id ==
                        //             this.skillsStore.skillsList[j].id
                        //         ) {
                        //             this.skillsStore.skillsList[j].flagId =
                        //                 this.contentFlags[i].id;
                        //             this.skillFlags.push(
                        //                 this.skillsStore.skillsList[j]
                        //             );
                        //             // Prepare Data for table
                        //             const tableRow = {
                        //                 type: 'skill',
                        //                 name: this.skillsStore.skillsList[j]
                        //                     .name,
                        //                 nameUrl:
                        //                     'skills/' +
                        //                     this.skillsStore.skillsList[j].id,
                        //                 flagId: this.contentFlags[i].id,
                        //                 editUrl:
                        //                     'skills/edit/' +
                        //                     this.skillsStore.skillsList[j].id,
                        //                 expandContent:
                        //                     this.skillsStore.skillsList[j]
                        //             };
                        //             this.rows.push(tableRow);
                        //         }
                        //     }
                        // } else if (
                        //     this.contentFlags[i].content_type == 'resource'
                        // ) {
                        //     for (
                        //         let j = 0;
                        //         j < this.resourcesStore.resourcesList.length;
                        //         j++
                        //     ) {
                        //         if (
                        //             this.contentFlags[i].content_id ==
                        //             this.resourcesStore.resourcesList[j].id
                        //         ) {
                        //             this.resourcesStore.resourcesList[
                        //                 j
                        //             ].flagId = this.contentFlags[i].id;
                        //             this.resourcesFlags.push(
                        //                 this.resourcesStore.resourcesList[j]
                        //             );
                        //             // Prepare Data for table
                        //             const tableRow = {
                        //                 type: 'resource',
                        //                 name: this.skillsStore.resourcesList[j]
                        //                     .name,
                        //                 nameUrl:
                        //                     'resources/' +
                        //                     this.skillsStore.resourcesList[j]
                        //                         .id,
                        //                 flagId: this.contentFlags[i].id,
                        //                 editUrl:
                        //                     'resources/edit/' +
                        //                     this.skillsStore.resourcesList[j]
                        //                         .id,
                        //                 expandContent:
                        //                     this.skillsStore.resourcesList[j]
                        //             };
                        //             this.rows.push(tableRow);
                        //         }
                        //     }
                        // } else if (
                        //     this.contentFlags[i].content_type == 'mc_question'
                        // ) {
                        //     for (
                        //         let j = 0;
                        //         j <
                        //         this.mcQuestionsStore.mcQuestionsList.length;
                        //         j++
                        //     ) {
                        //         if (
                        //             this.contentFlags[i].content_id ==
                        //             this.mcQuestionsStore.mcQuestionsList[j].id
                        //         ) {
                        //             this.mcQuestionsStore.mcQuestionsList[
                        //                 j
                        //             ].flagId = this.contentFlags[i].id;
                        //             this.mcQuestionFlags.push(
                        //                 this.mcQuestionsStore.mcQuestionsList[j]
                        //             );
                        //             // Prepare Data for table
                        //             const tableRow = {
                        //                 type: 'mc question',
                        //                 name: this.mcQuestionsStore
                        //                     .mcQuestionsList[j].question,
                        //                 nameUrl:
                        //                     'skills/' +
                        //                     this.mcQuestionsStore
                        //                         .mcQuestionsList[j].skill_id +
                        //                     '/question-bank',
                        //                 flagId: this.contentFlags[i].id,
                        //                 editUrl:
                        //                     '/mc-questions/edit/' +
                        //                     this.mcQuestionsStore
                        //                         .mcQuestionsList[j].id,
                        //                 expandContent:
                        //                     this.mcQuestionsStore
                        //                         .mcQuestionsList[j]
                        //             };
                        //             this.rows.push(tableRow);
                        //         }
                        //     }
                        // } else if (
                        //     this.contentFlags[i].content_type ==
                        //     'essay_question'
                        // ) {
                        //     for (
                        //         let j = 0;
                        //         j <
                        //         this.essayQuestionsStore.essayQuestionsList
                        //             .length;
                        //         j++
                        //     ) {
                        //         if (
                        //             this.contentFlags[i].content_id ==
                        //             this.essayQuestionsStore.essayQuestionsList[
                        //                 j
                        //             ].id
                        //         ) {
                        //             this.skillFlags.push(
                        //                 this.essayQuestionsStore
                        //                     .essayQuestionsList[j]
                        //             );
                        //             // Prepare Data for table
                        //             const tableRow = {
                        //                 type: 'essay question',
                        //                 name: this.essayQuestionsStore
                        //                     .essayQuestionsList[j].question,
                        //                 nameUrl:
                        //                     'skills/' +
                        //                     this.essayQuestionsStore
                        //                         .essayQuestionsList[j]
                        //                         .skill_id +
                        //                     '/question-bank',
                        //                 flagId: this.contentFlags[i].id,
                        //                 editUrl:
                        //                     'skills/edit/' +
                        //                     this.essayQuestionsStore
                        //                         .essayQuestionsList[j].id,
                        //                 expandContent:
                        //                     this.essayQuestionsStore
                        //                         .essayQuestionsList[j]
                        //             };
                        //             this.rows.push(tableRow);
                        //         }
                        //     }
                        // }
                    }
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

            this.skillFlags = [];
            this.resourcesFlags = [];
            this.mcQuestionFlags = [];
            this.showDismissModal = false;
            this.getContentFlags();
        },
        handleOpenDismissModal(flagId) {
            this.flagId = flagId;
            this.showDismissModal = true;
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
    <div class="container">
        <div class="mt-3">
            <h1>Content Flags</h1>
        </div>
        <div class="mt-5 pb-5">
            <Vue3EasyDataTable
                :headers="headers"
                :items="rows"
                alternating
                show-index
                hide-footer
                :loading="!isContentFlagsLoaded"
                table-class-name="customize-table"
            >
                <template #loading>
                    <img src="/images/loading.gif" alt="loading data" />
                </template>
                <template #item-name="{ name, nameUrl }">
                    <RouterLink class="flag-name" :to="`/${nameUrl}`">{{
                        name
                    }}</RouterLink>
                </template>
                <template #item-action="{ flagId, editUrl, type }">
                    <div class="d-flex pt-2 pb-2">
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
                                /></svg></router-link
                        >&nbsp;&nbsp;
                        <button
                            b-tooltip.hover
                            :title="'Dismiss This Flag'"
                            class="btn red-btn"
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
                    </div>
                </template>
                <template #expand="{ expandContent, type }">
                    <div style="padding: 15px">
                        <!-- MC Question Expand -->
                        <div v-if="type == 'mc question'">
                            <p>
                                <strong>Question:</strong>
                                {{ expandContent.question }}
                            </p>
                            <p>
                                <strong>Correct Answer:</strong>
                                {{ expandContent.correct_answer }}
                            </p>
                            <p>
                                <strong>Incorrect Answer 1:</strong>
                                {{ expandContent.incorrect_answer_1 }}
                            </p>
                            <p>
                                <strong>Incorrect Answer 2:</strong>
                                {{ expandContent.incorrect_answer_2 }}
                            </p>
                            <p>
                                <strong>Incorrect Answer 3:</strong>
                                {{ expandContent.incorrect_answer_3 }}
                            </p>
                            <p>
                                <strong>Incorrect Answer 4:</strong>
                                {{ expandContent.incorrect_answer_4 }}
                            </p>
                            <p>
                                <strong>Explanation:</strong>
                                {{ expandContent.explanation }}
                            </p>
                        </div>
                        <!-- Essay Expand content -->
                        <div>
                            <p>
                                <strong>Name:</strong>
                                {{ expandContent.name }}
                            </p>
                            <p>
                                <strong>Question:</strong>
                                {{ expandContent.question }}
                            </p>
                        </div>
                        <!-- Skill Expand content -->
                        <div v-if="type == 'skill'">
                            <p>
                                <strong>Skill: </strong>{{ expandContent.name }}
                            </p>
                            <p><strong>Mastery Requirements: </strong></p>
                            <div
                                v-html="expandContent.mastery_requirements"
                            ></div>
                        </div>
                        <!-- Resource Expand Content -->
                        <div v-if="type == 'resource'">
                            <p>
                                <strong>Source:</strong>
                                <span v-html="expandContent.content"></span>
                            </p>
                        </div>
                    </div>
                </template>
            </Vue3EasyDataTable>
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
                        class="btn red-btn w-25"
                        @click="showDismissModal = false"
                    >
                        <span> No </span>
                    </button>
                    <button
                        type="button"
                        class="btn green-btn w-25"
                        @click="dismissFlag(flagId)"
                    >
                        <span> Yes </span>
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

.purple-btn {
    background-color: #a48be6;
    color: white;
    border: 1px solid #7f56d9;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 12px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
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
    height: auto;
    justify-content: center;
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
    height: auto;
    align-items: center;
    justify-content: center;
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

/* The Warning Modal */
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
    width: 20%;
    /* Could be more or less, depending on screen size */
}
/* End of Modal Styling */

/* +-+-+ Vue Easy Table Custom CSS +-+-+  */
.customize-table {
    --easy-table-body-row-font-size: 16px;

    --easy-table-header-font-size: 16px;
    --easy-table-header-font-color: #8f7bd6;
    --easy-table-header-background-color: #fefefe;
    --easy-table-header-height: 50px;

    --easy-table-header-item-padding: 15px 5px;
}
</style>
