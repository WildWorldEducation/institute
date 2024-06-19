<script>
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useResourcesStore } from '../../stores/ResourcesStore.js';
import { useMCQuestionsStore } from '../../stores/MCQuestionsStore.js';
import { useEssayQuestionsStore } from '../../stores/EssayQuestionsStore.js';

export default {
    props: ['userId', 'deleteFlag'],
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
            rows: []
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
                day: 'numeric',
                timeZone: 'UTC'
            });
            const createTime = parseDate.toLocaleTimeString();
            const pushObj = {
                date: createTime + ` (${createDate})`,
                action: contentFlag.action,
                questionName: contentObj.question,
                skillName: contentObj.name
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
        }
    }
};
</script>

<template>
    <div v-if="rows.length" class="container-md main-container">
        <!-- Vue Data Table Desktop  -->
        <div class="d-flex flex-column gap-3">
            <div class="d-flex" v-for="contentFlag in rows">
                <div class="d-flex w-fit me-1">{{ contentFlag.date }} -</div>
                <!-- flag type skill -->
                <div
                    class="d-flex flex-wrap ml-1"
                    v-if="contentFlag.type === 'skill'"
                >
                    <span :class="actionColor(contentFlag.action)">
                        {{ contentFlag.action }}
                    </span>
                    &nbsp;flag on skill:&nbsp;
                    <router-link
                        class="skill-link"
                        :to="`/skills/${contentFlag.skillId}`"
                        >{{ contentFlag.skillName }}</router-link
                    >
                </div>
                <!-- flag type resource -->
                <div
                    class="d-flex flex-wrap ml-1"
                    v-if="contentFlag.type === 'resource'"
                >
                    <span :class="actionColor(contentFlag.action)">
                        {{ contentFlag.action }}
                    </span>
                    &nbsp;flag on resource of skill:&nbsp;
                    <router-link
                        class="skill-link"
                        :to="`/skills/${contentFlag.skillId}`"
                        >{{ contentFlag.skillName }}</router-link
                    >
                </div>
                <!-- flag type mc_question -->
                <div
                    class="d-flex flex-wrap ml-1"
                    v-if="contentFlag.type === 'mc_question'"
                >
                    <span :class="actionColor(contentFlag.action)">
                        {{ contentFlag.action }}
                    </span>
                    &nbsp;flag on mc_question:
                    <router-link
                        class="question-link"
                        :to="`/skills/${contentFlag.skillId}/question-bank`"
                        >{{ contentFlag.questionName }}</router-link
                    >
                    on skill:&nbsp;
                    <router-link
                        class="skill-link"
                        :to="`/skills/${contentFlag.skillId}`"
                        >{{ contentFlag.skillName }}</router-link
                    >
                </div>
            </div>
        </div>
    </div>
    <div v-else class="shake">The user has no action on flags</div>
</template>
<style></style>
