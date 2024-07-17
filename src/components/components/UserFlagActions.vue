<script>
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useResourcesStore } from '../../stores/ResourcesStore.js';
import { useMCQuestionsStore } from '../../stores/MCQuestionsStore.js';
import { useEssayQuestionsStore } from '../../stores/EssayQuestionsStore.js';

export default {
    props: ['userId'],
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
            rows: [],
            currentChooseSkill: '',
            showActionWarnModal: false,
            showSkillWarnModal: false
        };
    },
    components: {},
    async created() {},
    async mounted() {
        // call to content flags route
        await this.getContentFlagLogs();
        // prepare content flag response data in to show_able data
        this.contentFlags.forEach((contentFlag) => {
            // parse the content data because mysql library return it as a string
            const contentObj = JSON.parse(contentFlag.content_obj);
            const parseDate = new Date(contentFlag.create_date);
            const createDate = parseDate.toLocaleString('en-gb', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const createTime = parseDate.toLocaleTimeString();
            const pushObj = {
                date: createTime + ` (${createDate})`,
                action: contentFlag.action,
                questionName: contentObj.question,
                skillName: contentObj.name,
                id: contentFlag.id,
                skill_deleted: contentObj.skill_deleted
            };
            switch (contentFlag.flag_type) {
                case 'mc_question':
                    pushObj.type = 'mc_question';
                    pushObj.questionId = contentObj.question_id;
                    pushObj.skillId = contentObj.skill_id;
                    break;
                case 'resource':
                    pushObj.type = 'resource';
                    pushObj.skillId = contentObj.skill_id;
                    break;
                case 'skill':
                    pushObj.type = 'skill';
                    pushObj.skillId = contentObj.skill_id;
                    break;
                default:
                    pushObj.type = 'delete';
                    break;
            }
            this.rows.push(pushObj);
        });
    },
    methods: {
        // TODO: use store instead.
        async getContentFlagLogs() {
            const res = await fetch(`/user-actions/${this.userId}/flag`);
            this.contentFlags = await res.json();
        },
        actionColor(action) {
            switch (action) {
                case 'create':
                    return 'create-action';
                case 'update':
                    return 'update-action';
                default:
                    return 'delete-action';
            }
        },
        handleNoneLinkClick(logAction, questionName) {
            if (logAction === 'delete') {
                this.showActionWarnModal = true;
            } else {
                this.showSkillWarnModal = true;
                this.currentChooseSkill = questionName;
            }
        }
    }
};
</script>

<template>
    <div v-if="rows.length" class="container-md main-container">
        <!-- Vue Data Table Desktop  -->
        <div class="d-flex flex-column gap-3">
            <div v-for="contentFlag in rows">
                {{ contentFlag.date }}
                <!-- flag type skill -->
                <span v-if="contentFlag.type === 'skill'">
                    <span :class="actionColor(contentFlag.action)">
                        - {{ contentFlag.action }}
                    </span>

                    <!-- Handle Delete Actions -->
                    <span v-if="contentFlag.action == 'delete'">
                        flag with id: {{ contentFlag.id }} </span
                    >flag on skill:
                    <!-- Show link to skill if it is not deleted else show a warn modal-->
                    <span
                        v-if="
                            contentFlag.action === 'delete' ||
                            contentFlag.skill_deleted === 1
                        "
                        class="skill-link"
                        @click="
                            handleNoneLinkClick(
                                contentFlag.action,
                                contentFlag.skillName
                            )
                        "
                    >
                        {{ contentFlag.skillName }}
                    </span>
                    <router-link
                        v-else
                        class="skill-link"
                        target="_blank"
                        :to="`/skills/${contentFlag.skillId}`"
                        >{{ contentFlag.skillName }}</router-link
                    >
                </span>
                <!-- flag type resource -->
                <span v-if="contentFlag.type === 'resource'">
                    <span :class="actionColor(contentFlag.action)">
                        - {{ contentFlag.action }}
                    </span>
                    flag on resource of skill:
                    <!-- Show link to skill if it is not deleted else show a warn modal-->
                    <span
                        v-if="
                            contentFlag.action === 'delete' ||
                            contentFlag.skill_deleted === 1
                        "
                        class="skill-link"
                        @click="
                            handleNoneLinkClick(
                                contentFlag.action,
                                contentFlag.skillName
                            )
                        "
                    >
                        {{ contentFlag.skillName }}
                    </span>

                    <router-link
                        v-else
                        class="skill-link"
                        target="_blank"
                        :to="`/skills/${contentFlag.skillId}`"
                        >{{ contentFlag.skillName }}</router-link
                    >
                </span>
                <!-- flag type mc_question -->
                <span v-if="contentFlag.type === 'mc_question'">
                    <span :class="actionColor(contentFlag.action)">
                        - {{ contentFlag.action }}
                    </span>
                    flag on mc_question:
                    <router-link
                        class="question-link"
                        target="_blank"
                        :to="`/skills/${contentFlag.skillId}/question-bank`"
                        >{{ contentFlag.questionName }}</router-link
                    >
                    on skill:
                    <!-- Show link to skill if it is not deleted else show a warn modal-->
                    <span
                        v-if="
                            contentFlag.action === 'delete' ||
                            contentFlag.skill_deleted === 1
                        "
                        class="skill-link"
                        @click="
                            handleNoneLinkClick(
                                contentFlag.action,
                                contentFlag.skillName
                            )
                        "
                    >
                        {{ contentFlag.skillName }}
                    </span>
                    <router-link
                        v-else
                        class="skill-link"
                        target="_blank"
                        :to="`/skills/${contentFlag.skillId}`"
                        >{{ contentFlag.skillName }}</router-link
                    >
                </span>
                <!-- Handle delete type flag action -->
                <span v-if="contentFlag.type === 'delete'">
                    <span :class="actionColor(contentFlag.action)">
                        - {{ contentFlag.action }}
                    </span>
                    flag with id {{ contentFlag.id }}
                </span>
            </div>
        </div>
    </div>
    <div v-else class="shake">The user has no action on flags</div>
    <!-- The modal popup when user click on a deleted skill -->
    <div v-if="showSkillWarnModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content skill-modal">
                <div class="mb-4">
                    <div class="modal-label">
                        Skill
                        <span class="skill-modal-text">{{
                            currentChooseSkill
                        }}</span>
                        is deleted !!
                    </div>
                </div>
                <div class="d-flex justify-content-center">
                    <button
                        type="button"
                        class="btn green-btn w-fit"
                        @click="showSkillWarnModal = false"
                    >
                        <div>OK</div>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <!-- The modal popup when user click on a deleted skill -->
    <div v-if="showSkillWarnModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content skill-modal">
                <div class="mb-4">
                    <div class="modal-label">
                        Skill
                        <span class="skill-modal-text">{{
                            currentChooseSkill
                        }}</span>
                        is deleted !!
                    </div>
                </div>
                <div class="d-flex justify-content-center">
                    <button
                        type="button"
                        class="btn green-btn w-fit"
                        @click="showSkillWarnModal = false"
                    >
                        <div>OK</div>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <!-- The modal popup when user click on delete action -->
    <div v-if="showActionWarnModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
                <div class="d-flex gap-4 justify-content-center mb-4">
                    <div class="modal-label">this flag is deleted !!</div>
                </div>
                <div class="d-flex justify-content-center">
                    <button
                        type="button"
                        class="btn green-btn w-fit"
                        @click="showActionWarnModal = false"
                    >
                        <div>OK</div>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<style></style>
