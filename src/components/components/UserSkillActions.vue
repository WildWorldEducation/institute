<script>
export default {
    props: ['userId', 'deleteResource'],

    data() {
        return {
            skillsData: [],
            rows: [],
            showWarnModal: false
        };
    },
    components: {},

    async created() {
        // call to content flags route
        await this.getSkillLogs();
        this.skillsData.forEach((skill) => {
            console.log(skill);
            const contentObj = JSON.parse(skill.content_obj);
            const parseDate = new Date(skill.create_date);
            const createDate = parseDate.toLocaleString('en-gb', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const createTime = parseDate.toLocaleTimeString();
            this.rows.push({
                skillName: contentObj.skill_name,
                resourceId: skill.content_id,
                skillId: contentObj.skill_id,
                action: skill.action,
                date: createDate,
                time: createTime,
                id: skill.id,
                is_deleted: contentObj.is_deleted
            });
        });
    },
    methods: {
        async getSkillLogs() {
            const res = await fetch(`/user-actions/${this.userId}/skill`);
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
                <span> skill: </span>
                <!-- Show link to skill if it is not deleted else show a warn modal-->
                <span
                    v-if="skill.action === 'delete' || skill.is_deleted === 1"
                    class="skill-link"
                    @click="showWarnModal = true"
                >
                    {{ skill.skillName }}
                </span>
                <router-link
                    v-else
                    class="skill-link"
                    target="_blank"
                    :to="`/skills/${skill.skillId}`"
                    >{{ skill.skillName }}</router-link
                >
            </div>
        </div>
    </div>
    <div v-else class="shake">The user has no action on skill</div>
    <!-- The modal popup when user click on not visible -->
    <div v-if="showWarnModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
                <div class="d-flex gap-4 justify-content-center mb-4">
                    <div class="modal-label">This skill is deleted !!</div>
                </div>
                <div class="d-flex justify-content-center">
                    <button
                        type="button"
                        class="btn green-btn w-25"
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
