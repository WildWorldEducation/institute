<script>
export default {
    props: ['userId', 'deleteResource'],

    data() {
        return {
            resourcesData: [],
            rows: []
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
                day: 'numeric',
                timeZone: 'UTC'
            });
            const createTime = parseDate.toLocaleTimeString();
            this.rows.push({
                skillName: contentObj.skill_name,
                resourceId: resource.content_id,
                skillId: contentObj.skill_id,
                action: resource.action,
                date: createDate,
                time: createTime,
                id: resource.id
            });
        });
    },
    methods: {
        async getResourceLogs() {
            const res = await fetch(`/user-actions/${this.userId}/resource`);
            this.resourcesData = await res.json();
            console.log(this.resourcesData);
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
            <div v-for="resource in rows">
                {{ resource.time }} ({{ resource.date }}) -
                <span :class="actionColor(resource.action)">
                    {{ resource.action }}
                </span>
                <span v-if="resource.action === 'delete'">
                    a resource with id {{ resource.id }}
                </span>
                <span v-else> resource for skill: </span>
                <router-link
                    class="skill-link"
                    target="_blank"
                    :to="`/skills/${resource.skillId}`"
                    >{{ resource.skillName }}</router-link
                >
            </div>
        </div>
    </div>
    <div v-else class="shake">The user has no action on resource</div>
</template>
<style></style>
