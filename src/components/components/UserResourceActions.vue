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
        await this.getResources();
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
                time: createTime
            });
        });
    },
    methods: {
        async getResources() {
            const res = await fetch(`/actions/${this.userId}/resource`);
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
        }
    }
};
</script>

<template>
    <div class="container-md main-container">
        <!-- Vue Data Table Desktop  -->
        <div v-if="rows.length" class="d-flex flex-column">
            <div v-for="resource in rows">
                {{ resource.time }} ({{ resource.date }}) -
                <span :class="actionColor(resource.action)">
                    {{ resource.action }}
                </span>
                resource for skill:
                <router-link
                    class="skill-link"
                    :to="`/skills/${resource.skillId}`"
                    >{{ resource.skillName }}</router-link
                >
            </div>
        </div>
    </div>
</template>
<style></style>
