<script>
export default {
    props: ['userId'],

    data() {
        return {
            skillsData: [],
            rows: [],
            showWarnModal: false,
            currentChooseSkill: ''
        };
    },
    components: {},

    async created() {
        // call to content flags route
        await this.getSubmittedSkillLogs();
        this.skillsData.forEach((skill) => {
            const parseDate = new Date(skill.create_date);
            const createDate = parseDate.toLocaleString('en-gb', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const createTime = parseDate.toLocaleTimeString();
            this.rows.push({
                resourceId: skill.content_id,
                action: skill.action,
                date: createDate,
                time: createTime,
                id: skill.id
            });
        });
    },
    methods: {
        async getSubmittedSkillLogs() {
            const res = await fetch(
                `/user-actions/${this.userId}/skill_submit_by_user`
            );
            this.skillsData = await res.json();
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
        <div class="d-flex flex-column">
            <div v-for="skill in rows">
                {{ skill.time }} ({{ skill.date }}) -
                <span :class="actionColor(skill.action)">
                    {{ skill.action }}
                </span>
                <span>, id: {{ skill.id }}</span>
            </div>
        </div>
    </div>
    <div v-else class="shake">The user has no recorded actions on skills</div>
    <!-- The modal popup when user click on not visible -->
    <div v-if="showWarnModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content skill-modal">
                <div class="modal-label">
                    Skill
                    <span class="skill-modal-text">{{
                        currentChooseSkill
                    }}</span>
                    is deleted !!
                </div>

                <div class="d-flex justify-content-center">
                    <button
                        type="button"
                        class="btn green-btn w-fit"
                        @click="showWarnModal = false"
                    >
                        <div>OK</div>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<style></style>
