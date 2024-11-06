<script>
import { diffWords } from 'diff';
import HtmlDiff from 'htmldiff-js';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import dayjs from 'dayjs';
import CompareString from './CompareString.vue';
import CompareWithDropdown from './CompareWithDropdown.vue';
export default {
    props: [
        'viewingRevision',
        'compareWithRevision',
        'skillRevisionHistory',
        'updateCompareWithRevision'
    ],
    components: { CompareString, CompareWithDropdown },
    computed: {
        compareData() {
            if (!this.compareWithRevision) {
                return;
            }

            const masteryDiff = HtmlDiff.execute(
                this.viewingRevision.mastery_requirements,
                this.compareWithRevision.mastery_requirements
            );

            const nameDiff = diffWords(
                this.viewingRevision.name,
                this.compareWithRevision.name
            );

            const imageDiff =
                this.viewingRevision.icon_image !==
                this.compareWithRevision.icon_image;

            return {
                masteryDiff: masteryDiff,
                nameDiff: nameDiff,
                imageDiff: imageDiff,
                skillData: this.compareWithRevision,
                currentViewingRevision: this.viewingRevision
            };
        }
    },
    methods: {
        formatDate(dateString) {
            dayjs.extend(LocalizedFormat);
            const formattedDate = dayjs(dateString).format('lll');
            return formattedDate;
        }
    }
};
</script>

<template>
    <div class="container mt-3">
        <div id="skill-info-container">
            <!-- Skill Info -->
            <div class="d-flex justify-content-between">
                <h1 class="skill-name">
                    <CompareString :diffString="compareData.nameDiff" />
                    <span class="revision-version"
                        >(Ver: {{ compareData.skillData.version_number }})</span
                    >
                </h1>
            </div>
            <!-- A line divide -->
            <hr class="border border-2 opacity-100 hr" />

            <div class="d-flex flex-column">
                <div
                    class="alert alert-warning d-flex gap-2 align-items-center"
                    role="alert"
                >
                    <div class="d-flex flex-column ms-2">
                        <p>
                            <strong>You are comparing:</strong>
                            <span>
                                Revision
                                {{
                                    compareData.currentViewingRevision
                                        .version_number
                                }}
                                edited by
                                <em>{{
                                    compareData.currentViewingRevision.userName
                                }}</em>
                                on
                                <span class="warning-date">
                                    {{
                                        formatDate(
                                            compareData.currentViewingRevision
                                                .edited_date
                                        )
                                    }}</span
                                >
                            </span>
                        </p>
                        <p>
                            <strong>with:</strong>

                            <span>
                                Revision
                                {{ compareData.skillData.version_number }}
                                edited by
                                <em>{{ compareData.skillData.user_name }}</em>
                                on
                                <span class="warning-date">
                                    {{
                                        formatDate(
                                            compareData.skillData?.edited_date
                                        )
                                    }}</span
                                >
                            </span>
                        </p>
                    </div>
                </div>

                <CompareWithDropdown
                    :skillRevisionHistory="skillRevisionHistory"
                    :currentShowingVersion="
                        compareData.skillData.version_number
                    "
                    :updateCompareWithRevision="updateCompareWithRevision"
                    :compareWithRevision="compareWithRevision"
                />
            </div>
            <!-- A line divide -->
            <hr class="border border-1 opacity-0 hr mt-md-4 mt-5" />
            <div class="d-flex flex-column-reverse flex-md-row gap-4">
                <div class="mastery-requirements">
                    <div v-html="compareData.masteryDiff"></div>
                </div>
                <!-- Infobox -->
                <div class="col-md-4 order-1 order-md-2">
                    <div class="info-box p-2 mb-2">
                        <!-- AWS S3 hosted feature image -->
                        <!-- Show a default skill avatar if skill not have image yet -->
                        <img
                            :src="
                                compareData.skillData.icon_image
                                    ? compareData.skillData.icon_image
                                    : '/images/skill-avatar/recurso.png'
                            "
                            class="rounded img-fluid"
                        />
                        <!-- Grade level -->
                        <div class="mt-2">
                            <h2 class="h4 title">Level</h2>
                            <span
                                v-if="
                                    compareData.skillData.level ==
                                    'grade_school'
                                "
                                >Grade School</span
                            >
                            <span
                                v-else-if="
                                    compareData.skillData.level ==
                                    'middle_school'
                                "
                                >Middle School</span
                            >
                            <span
                                v-else-if="
                                    compareData.skillData.level == 'high_school'
                                "
                                >High School</span
                            >
                            <span
                                v-else-if="
                                    compareData.skillData.level == 'college'
                                "
                                >College</span
                            >
                            <span
                                v-else-if="compareData.skillData.level == 'phd'"
                                >PHD</span
                            >
                        </div>
                    </div>
                </div>
            </div>
            <button
                class="btn purple-btn mt-4"
                @click="updateCompareWithRevision(null)"
            >
                <div>
                    Go to version
                    {{ compareData.currentViewingRevision.version_number }}
                </div>
            </button>
            <p>&nbsp;</p>
        </div>
    </div>
</template>

<style scoped>
.title {
    color: #a48be6;
    font-weight: 700;
}

#skill-info-container {
    background-color: #f2edff;
    border-radius: 12px;
    padding: 30px;
    min-height: 86.5vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.skill-name {
    font-family: 'Poppins', sans-serif;
    font-size: 40px;
    color: #a48be6;
    font-weight: 800;
    margin-bottom: 0px;
    text-align: start;
}

.revision-version {
    font-weight: 500;
    font-size: 18px;
}

.hr {
    border-color: #aea3ce !important;
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
    height: 44px;
    display: flex;
    align-items: center;
}

.purple-btn:hover {
    background-color: #8f7bd6;
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

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 1rem;
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

.green-btn:focus {
    background-color: #2ca695;
    color: white;
}

.warning-date {
    font-style: italic;
}

.mastery-requirements {
    padding-left: 30px;
    padding-right: 30px;
    padding-top: 10px;
    padding-bottom: 10px;
    background-color: rgba(255, 255, 255, 0.692);
    border-radius: 5px;
}

.info-box {
    color: black;
    border-radius: 5px;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: fit-content;
    border: 1px solid #a2a9b1;
    text-align: center;
}

:deep(ins) {
    background-color: #81d5b9;
    border-radius: 4px;
    color: black;
    white-space-collapse: collapse;
    text-decoration: none;
    margin: 0px 3px;
}

:deep(del) {
    background-color: #faa5a5;
    color: black;
    border-radius: 4px;
    text-decoration-color: #1e293b;
    white-space-collapse: collapse;
    margin: 0px 3px;
}

/* Style Specific On Phone */
@media (min-width: 0px) and (max-width: 576px) {
    .modal-content {
        margin: 45% 0%;
        width: 100% !important;
    }

    .custom-select-div {
        width: 100%;
    }

    #skill-info-container {
        background-color: #f2edffcc;
        border-radius: 12px;
        padding: 20px;
    }

    .skill-name {
        margin-top: 5px;
        font-size: 25px;
        margin: 0px 5px;
    }

    .mastery-requirements {
        width: 100%;
    }

    .info-box {
        width: fit-content;
        height: auto;
    }
}

/* ************************* */
/* Style Specific on Tablet */
@media (min-width: 577px) and (max-width: 1023px) {
    #skill-info-container {
        padding: 15px;
    }
}
</style>
