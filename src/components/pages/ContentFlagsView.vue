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
                { text: 'Action', value: 'action', width: 300 }
            ],

            rows: []
        };
    },
    components: {
        Vue3EasyDataTable
    },
    async created() {},
    async mounted() {
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
            console.log('skill list data acquired');
        }
        if (this.resourcesStore.resourcesList.length == 0) {
            await this.resourcesStore.getResourcesList();
            console.log('resource list data acquired');
        }
        if (this.mcQuestionsStore.mcQuestionsList.length == 0) {
            await this.mcQuestionsStore.getMCQuestionsList();
            console.log('multiple choice question list data acquired');
        }
        if (this.essayQuestionsStore.essayQuestionsList.length == 0) {
            await this.essayQuestionsStore.getEssayQuestionsList();
            console.log('essay question list data acquired');
        }

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
                        if (this.contentFlags[i].content_type == 'skill') {
                            for (
                                let j = 0;
                                j < this.skillsStore.skillsList.length;
                                j++
                            ) {
                                if (
                                    this.contentFlags[i].content_id ==
                                    this.skillsStore.skillsList[j].id
                                ) {
                                    this.skillsStore.skillsList[j].flagId =
                                        this.contentFlags[i].id;
                                    this.skillFlags.push(
                                        this.skillsStore.skillsList[j]
                                    );
                                    // Prepare Data for table
                                    const tableRow = {
                                        type: 'skill',
                                        name: this.skillsStore.skillsList[j]
                                            .name,
                                        nameUrl:
                                            'skills/' +
                                            this.skillsStore.skillsList[j].id,
                                        flagId: this.contentFlags[i].id,
                                        editUrl:
                                            'skills/edit/' +
                                            this.skillsStore.skillsList[j].id,
                                        expandContent:
                                            this.skillsStore.skillsList[j]
                                    };
                                    this.rows.push(tableRow);
                                }
                            }
                        } else if (
                            this.contentFlags[i].content_type == 'resource'
                        ) {
                            for (
                                let j = 0;
                                j < this.resourcesStore.resourcesList.length;
                                j++
                            ) {
                                if (
                                    this.contentFlags[i].content_id ==
                                    this.resourcesStore.resourcesList[j].id
                                ) {
                                    this.resourcesStore.resourcesList[
                                        j
                                    ].flagId = this.contentFlags[i].id;
                                    this.resourcesFlags.push(
                                        this.resourcesStore.resourcesList[j]
                                    );
                                    // Prepare Data for table
                                    const tableRow = {
                                        type: 'resource',
                                        name: this.skillsStore.resourcesList[j]
                                            .name,
                                        nameUrl:
                                            'resources/' +
                                            this.skillsStore.resourcesList[j]
                                                .id,
                                        flagId: this.contentFlags[i].id,
                                        editUrl:
                                            'resources/edit/' +
                                            this.skillsStore.resourcesList[j]
                                                .id,
                                        expandContent:
                                            this.skillsStore.resourcesList[j]
                                    };
                                    this.rows.push(tableRow);
                                }
                            }
                        } else if (
                            this.contentFlags[i].content_type == 'mc_question'
                        ) {
                            for (
                                let j = 0;
                                j <
                                this.mcQuestionsStore.mcQuestionsList.length;
                                j++
                            ) {
                                if (
                                    this.contentFlags[i].content_id ==
                                    this.mcQuestionsStore.mcQuestionsList[j].id
                                ) {
                                    this.mcQuestionsStore.mcQuestionsList[
                                        j
                                    ].flagId = this.contentFlags[i].id;
                                    this.mcQuestionFlags.push(
                                        this.mcQuestionsStore.mcQuestionsList[j]
                                    );
                                    // Prepare Data for table
                                    const tableRow = {
                                        type: 'mc question',
                                        name: this.mcQuestionsStore
                                            .mcQuestionsList[j].question,
                                        nameUrl:
                                            'skills/' +
                                            this.mcQuestionsStore
                                                .mcQuestionsList[j].skill_id +
                                            '/question-bank',
                                        flagId: this.contentFlags[i].id,
                                        editUrl:
                                            '/mc-questions/edit/' +
                                            this.mcQuestionsStore
                                                .mcQuestionsList[j].id,
                                        expandContent:
                                            this.mcQuestionsStore
                                                .mcQuestionsList[j]
                                    };
                                    this.rows.push(tableRow);
                                }
                            }
                        } else if (
                            this.contentFlags[i].content_type ==
                            'essay_question'
                        ) {
                            for (
                                let j = 0;
                                j <
                                this.essayQuestionsStore.essayQuestionsList
                                    .length;
                                j++
                            ) {
                                if (
                                    this.contentFlags[i].content_id ==
                                    this.essayQuestionsStore.essayQuestionsList[
                                        j
                                    ].id
                                ) {
                                    this.skillFlags.push(
                                        this.essayQuestionsStore
                                            .essayQuestionsList[j]
                                    );
                                    // Prepare Data for table
                                    const tableRow = {
                                        type: 'essay question',
                                        name: this.essayQuestionsStore
                                            .essayQuestionsList[j].question,
                                        nameUrl:
                                            'skills/' +
                                            this.essayQuestionsStore
                                                .essayQuestionsList[j]
                                                .skill_id +
                                            '/question-bank',
                                        flagId: this.contentFlags[i].id,
                                        editUrl:
                                            'skills/edit/' +
                                            this.essayQuestionsStore
                                                .essayQuestionsList[j].id,
                                        expandContent:
                                            this.essayQuestionsStore
                                                .essayQuestionsList[j]
                                    };
                                    this.rows.push(tableRow);
                                }
                            }
                        }
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
                <template #item-action="{ flagId, nameUrl, editUrl }">
                    <div class="d-flex mt-3">
                        <router-link
                            :to="nameUrl"
                            class="btn purple-btn me-2"
                            target="_blank"
                            >Go to skill</router-link
                        >
                        <router-link
                            :to="editUrl"
                            class="btn purple-btn"
                            target="_blank"
                        >
                            Edit&nbsp;
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
                            class="btn red-btn"
                            @click="handleOpenDismissModal(flagId)"
                        >
                            Dismiss&nbsp;
                            <!-- X icon -->
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M0.312625 14.5205L4.83312 9.99999L0.312625 5.49218C0.111396 5.29025 -0.00159545 5.0168 -0.00159545 4.73172C-0.00159545 4.44665 0.111396 4.17319 0.312625 3.97126L3.96282 0.312625C4.16474 0.111396 4.4382 -0.00159545 4.72327 -0.00159545C5.00835 -0.00159545 5.2818 0.111396 5.48373 0.312625L9.99999 4.83312L14.5205 0.312625C14.6204 0.21056 14.7397 0.12947 14.8714 0.0741101C15.003 0.0187502 15.1444 -0.00976563 15.2873 -0.00976562C15.4301 -0.00976563 15.5715 0.0187502 15.7032 0.0741101C15.8349 0.12947 15.9541 0.21056 16.0541 0.312625L19.6874 3.96282C19.8886 4.16474 20.0016 4.4382 20.0016 4.72327C20.0016 5.00835 19.8886 5.2818 19.6874 5.48373L15.1669 9.99999L19.6874 14.5205C19.8883 14.7217 20.0012 14.9944 20.0012 15.2788C20.0012 15.5632 19.8883 15.836 19.6874 16.0372L16.0541 19.6874C15.8529 19.8883 15.5801 20.0012 15.2957 20.0012C15.0113 20.0012 14.7386 19.8883 14.5374 19.6874L9.99999 15.1669L5.49218 19.6874C5.29025 19.8886 5.0168 20.0016 4.73172 20.0016C4.44665 20.0016 4.17319 19.8886 3.97126 19.6874L0.312625 16.0541C0.21056 15.9541 0.12947 15.8349 0.0741101 15.7032C0.0187502 15.5715 -0.00976563 15.4301 -0.00976562 15.2873C-0.00976563 15.1444 0.0187502 15.003 0.0741101 14.8714C0.12947 14.7397 0.21056 14.6204 0.312625 14.5205Z"
                                    fill="white"
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
