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
            if (question.action === 'update') {
                console.log(question);
            }
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
                studentId: contentObj.student_id
            });
        });
    },
    methods: {
        async getMcQuestionsLog() {
            const res = await fetch(
                `/user-actions/${this.userId}/student_mc_question`
            );
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
                {{ question.time }} ({{ question.date }})
                <span :class="actionColor(question.action)">
                    - {{ question.action }}
                </span>
                <span v-if="question.action === 'delete'">
                    student mc_question with id {{ question.id }}
                </span>
                <span v-else-if="question.action === 'create'">
                    student mc_question for skill:
                </span>
                <span v-else>
                    mc question of student
                    <router-link
                        class="user-link"
                        target="_blank"
                        :to="`/users`"
                        >{{ question.studentName }}</router-link
                    >
                    on skill:
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
        The user has no recorded actions on multiple-choice questions
    </div>
</template>
<style></style>
