<script>
export default {
    props: ['userId'],

    data() {
        return {
            resourcesData: [],
            rows: [],
            showWarnModal: false,
            currentChooseSkill: '',
            showActionWarnModal: false,
            showSkillWarnModal: false
        };
    },
    components: {},

    async created() {
        // call to content flags route
        await this.getResourceLogs();

        this.resourcesData.forEach((resource) => {
            const contentObj = JSON.parse(resource.content_obj);
            const parseDate = new Date(resource.create_date);
            const createDate = parseDate.toLocaleString('en-gb', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const createTime = parseDate.toLocaleTimeString();
            this.rows.push({
                skillName: contentObj.skill_name,
                resourceId: resource.content_id,
                action: resource.action,
                date: createDate,
                time: createTime,
                id: resource.id,
                skillDeleted: contentObj.skill_deleted,
                skillUrl: contentObj.skill_url,
                resourceDeleted: contentObj.resource_deleted
            });
        });
    },
    methods: {
        async getResourceLogs() {
            const res = await fetch(`/user-actions/${this.userId}/resource`);
            this.resourcesData = await res.json();
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
        handleNoneLinkClick(logAction, questionName, resourceDeleted) {
            if (logAction === 'delete') {
                this.showActionWarnModal = true;
            } else if (resourceDeleted) {
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
        <div class="d-flex flex-column">
            <div v-for="resource in rows">
                {{ resource.time }} ({{ resource.date }}) -
                <span :class="actionColor(resource.action)">
                    {{ resource.action }} </span
                >&nbsp;
                <span>
                    <router-link
                        class="skill-link"
                        target="_blank"
                        :to="
                            '/users/' +
                            userId +
                            '/activity-report/source/' +
                            resource.id
                        "
                        >source</router-link
                    >
                    in forum of skill:
                </span>
                <!-- Show link to skill if it is not deleted else show a warn modal-->
                <span
                    v-if="
                        resource.action === 'delete' ||
                        resource.skillDeleted === 1 ||
                        resource.resourceDeleted === 1
                    "
                    class="skill-link"
                    @click="
                        handleNoneLinkClick(
                            resource.action,
                            resource.skillName,
                            resource.resourceDeleted
                        )
                    "
                >
                    {{ resource.skillName }}
                </span>
                <router-link
                    v-else
                    class="skill-link"
                    target="_blank"
                    :to="`/skills/${resource.skillUrl}`"
                    >{{ resource.skillName }}</router-link
                >
            </div>
        </div>
    </div>
    <div v-else class="shake">The user has no action on resource</div>
    <!-- The modal popup when user click on a deleted skill -->
    <div v-if="showSkillWarnModal">
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
                    <div class="modal-label">Resource is deleted !!</div>
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
