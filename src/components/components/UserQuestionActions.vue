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
        console.log(this.questionsData);
        this.questionsData.forEach((question) => {
            const contentObj = JSON.parse(question.content_obj);
            const parseDate = new Date(question.create_date);
            const createDate = parseDate.toLocaleString('en-gb', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const createTime = parseDate.toLocaleTimeString();
            this.rows.push({
                skillName: contentObj.skill_name,
                resourceId: question.content_id,
                skillId: contentObj.skill_id,
                action: question.action,
                date: createDate,
                time: createTime,
                id: question.id,
                studentName: contentObj.student_name,
                studentId: contentObj.student_id,
                type: question.content_type
            });
        });
    },
    methods: {
        async getMcQuestionsLog() {
            const res = await fetch(`/user-actions/${this.userId}/question`);
            this.questionsData = await res.json();
        },
        actionColor(action) {
            switch (action) {
                case 'create':
                    return 'create-action';
                case 'update':
                    return 'update-action';
                case 'bulk-create':
                    return 'bulk-create-action';
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
                {{ question.time }} ({{ question.date }})
                <span :class="actionColor(question.action)">
                    - {{ question.action }}
                </span>
                <span v-if="question.type === 'mc_question'">
                    mc_question in skill:
                </span>
                <span
                    v-if="
                        question.action === 'delete' &&
                        question.type === 'essay_question'
                    "
                >
                    essay question with id: {{ question.id }}
                </span>
                <span
                    v-if="
                        question.action !== 'delete' &&
                        question.type === 'essay_question'
                    "
                >
                    essay question in skill:
                </span>
                <router-link
                    class="skill-link"
                    target="_blank"
                    :to="`/skills/${question.skillId}`"
                    >{{ question.skillName }}</router-link
                >
            </div>
        </div>
    </div>
    <div v-else class="shake">
        The user has no action on multiple-choice questions
    </div>
</template>
<style></style>
