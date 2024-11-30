<script>
import { useSkillsStore } from '../../../stores/SkillsStore';

export default {
    props: ['userId'],
    setup() {
        const skillsStore = useSkillsStore();
        return {
            skillsStore
        };
    },
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
        const promises = [];
        this.skillsData.forEach((skill) => {
            if (skill.action === 'approve') {
                promises.push(this.getApproveSkillData(skill));
            } else {
                promises.push(this.getStillAwaitingData(skill));
            }
        });
        console.log(promises);
        Promise.all(promises).then(() => {
            console.log('Result');
            console.log(this.rows);
        });
    },
    methods: {
        async getSubmittedSkillLogs() {
            const res = await fetch(
                `/user-actions/${this.userId}/skill_submit_by_user`
            );
            this.skillsData = await res.json();
        },
        async getApproveSkillData(skillActionData) {
            const parseDate = new Date(skillActionData.create_date);
            const createDate = parseDate.toLocaleString('en-gb', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const createTime = parseDate.toLocaleTimeString();
            const approvedSkill = await this.skillsStore.findSkillById(
                skillActionData.content_id
            );

            this.rows.push({
                resourceId: skillActionData.content_id,
                action: skillActionData.action,
                date: createDate,
                time: createTime,
                id: skillActionData.id,
                skillName: approvedSkill && approvedSkill.name,
                skillUrl: approvedSkill.url && approvedSkill.url
            });
        },
        async getStillAwaitingData(skillActionData) {
            const parseDate = new Date(skillActionData.create_date);
            const createDate = parseDate.toLocaleString('en-gb', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const createTime = parseDate.toLocaleTimeString();
            const resResult = await fetch(
                `/new-skills-awaiting-approval/show/${skillActionData.content_id}`
            );

            const resultJson = await resResult.json();
            const resSkillName = resultJson.name && resultJson.name;

            this.rows.push({
                resourceId: skillActionData.content_id,
                action: skillActionData.action,
                date: createDate,
                time: createTime,
                id: skillActionData.id,
                skillName: resSkillName
            });
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
                <span
                    v-if="skill.skillName && skill.action !== 'approve'"
                    class="ms-1"
                >
                    skill: {{ skill.skillName }}</span
                >
                <router-link
                    v-if="skill.skillName && skill.action === 'approve'"
                    class="skill-link ms-1"
                    target="_blank"
                    :to="`/skills/${skill.skillUrl}`"
                    >{{ skill.skillName }}.</router-link
                >
                <span
                    @click="showWarnModal = true"
                    v-else
                    class="no-skill-text ms-1"
                    >skill deleted.</span
                >
            </div>
        </div>
    </div>
    <div v-else class="shake">The user has no recorded actions on skills</div>
    <!-- The modal popup when user click on not visible -->
    <div v-if="showWarnModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content skill-modal">
                <div class="modal-label">Skill is deleted !!</div>

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
<style>
.no-skill-text {
    color: #a16207;
}

.no-skill-text:hover {
    text-decoration: underline;
    cursor: pointer;
}
</style>
