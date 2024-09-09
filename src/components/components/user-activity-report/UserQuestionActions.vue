<script>
export default {
    props: ['userId'],
    data() {
        return {
            questionsData: [],
            rows: [],
            showSkillWarnModal: false,
            showActionWarnModal: false,
            currentChooseSkill: ''
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
                day: 'numeric'
            });
            const createTime = parseDate.toLocaleTimeString();
            this.rows.push({
                question_name: contentObj.question_name,
                skillName: contentObj.skill_name,
                resourceId: question.content_id,
                skillId: contentObj.skill_id,
                action: question.action,
                date: createDate,
                time: createTime,
                id: question.id,
                studentName: contentObj.student_name,
                studentId: contentObj.student_id,
                type: question.content_type,
                skillDeleted: contentObj.skill_deleted,
                questionDeleted: contentObj.question_deleted
            });
        });
    },
    methods: {
        async getMcQuestionsLog() {
            const res = await fetch(`/user-actions/${this.userId}/question`);
            this.questionsData = await res.json();
            console.log('QUESTION ACTION: ');
            console.log(this.questionsData);
        },
        handleNoneLinkClick(logAction, questionName, questionDeleted) {
            if (logAction === 'delete' || questionDeleted) {
                this.showActionWarnModal = true;
            } else {
                this.showSkillWarnModal = true;
                this.currentChooseSkill = questionName;
            }
        },
        actionColor(action) {
            switch (action) {
                case 'create':
                    return 'create-action';
                case 'update':
                    return 'update-action';
                case 'bulk-create':
                    return 'bulk-create-action';
                case 'submit_update_for_review':
                    return 'submit_update_for_review';
                case 'approve':
                    return 'approve-action';
                case 'edit_and_approve':
                    return 'edit-and-approve-action';
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
                    - {{ question.action.replace(/_/g, ' ') }}
                </span>
                <!-- Text for mc question action -->
                <span v-if="question.type === 'mc_question'">
                    {{ ' "' + question.question_name + '"' }} in question bank
                    of skill:
                </span>
                <!-- Text for essay question action -->
                <span v-if="question.type === 'essay_question'">
                    essay question {{ ' "' + question.question_name + '"' }} in
                    question bank of skill:
                </span>
                <!-- Text for image question action -->
                <span v-if="question.type === 'image_question'">
                    image question {{ ' "' + question.question_name + '"' }} in
                    question bank of skill:
                </span>
                <!-- Show link to skill if it is not deleted else show a warn modal-->
                <span
                    v-if="
                        question.action === 'delete' ||
                        question.skillDeleted === 1 ||
                        question.questionDeleted === 1
                    "
                    class="skill-link"
                    @click="
                        handleNoneLinkClick(
                            question.action,
                            question.skillName,
                            question.questionDeleted
                        )
                    "
                >
                    {{ question.skillName }}
                </span>
                <router-link
                    v-else
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
                    <div class="modal-label">Question is deleted !!</div>
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
