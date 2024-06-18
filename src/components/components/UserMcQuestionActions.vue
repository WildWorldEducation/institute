<script>
export default {
    props: ['userId', 'deleteMcQuestion'],
    data() {
        return {
            questionsData: [],
            rows: []
        };
    },
    components: {},

    async created() {
        // call to content flags route
        await this.getMcQuestionsLog();
        this.questionsData.forEach((question) => {
            const contentObj = JSON.parse(question.content_obj);
            const parseDate = new Date(question.create_date);
            const createDate = parseDate.toLocaleString('en-gb', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC'
            });
            const createTime = parseDate.toLocaleTimeString();
            this.rows.push({
                skillName: contentObj.skill_name,
                resourceId: question.content_id,
                skillId: contentObj.skill_id,
                action: question.action,
                date: createDate,
                time: createTime
            });
        });
    },
    methods: {
        async getMcQuestionsLog() {
            const res = await fetch(`/actions/${this.userId}/mc_question`);
            this.questionsData = await res.json();
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
    <div v-if="rows.length > 0" class="container-md main-container">
        <!-- Vue Data Table Desktop  -->
        <div class="d-flex flex-column">
            <div v-for="question in rows">
                {{ question.time }} ({{ question.date }}) -
                <span :class="actionColor(question.action)">
                    {{ question.action }}
                </span>
                mc_question for skill:
                <router-link
                    class="skill-link"
                    :to="`/skills/${question.skillId}`"
                    >{{ question.skillName }}</router-link
                >
            </div>
        </div>
    </div>
</template>
<style></style>
