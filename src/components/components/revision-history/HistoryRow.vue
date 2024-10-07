<script>
export default {
    setup() {},
    data() {
        return {
            hoverOn: false
        };
    },
    props: ['revision', 'skill'],
    methods: {},
    async mounted() {}
};
</script>

<template>
    <div
        @mouseover="hoverOn = true"
        @mouseleave="hoverOn = false"
        class="d-flex"
    >
        <div class="revision-header">
            <div class="row-header-circle">
                <div v-if="hoverOn" class="inner-row-header-circle"></div>
            </div>
        </div>
        <router-link
            class="d-flex flex-column ms-3 revision-data"
            :to="`/skills/${skill.url}/revision/${revision.version_number}`"
        >
            <div class="d-flex">
                <div class="me-1 edit-date">
                    {{ revision.edited_date }}
                </div>
                - {{ revision.comment }}
            </div>
            <div class="by-user">By {{ revision.username }}</div>
            <!-- <span v-show="revision.isCurrentRevision"
                >, (current revision)</span
            > -->
        </router-link>
    </div>
</template>

<style scoped>
.revision-data {
    text-decoration: none;
    color: #334155;
}

.edit-date {
    color: #334155;
}

.revision-header {
    position: relative;
    height: 90px;
    border-left: 2px solid #8c8c8c;
}

.row-header-circle {
    position: absolute;
    top: 0px;
    left: -11px;
    width: 20px;
    height: 20px;
    border-radius: 100%;
    border: 3px solid #81b6ef;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
}

.row-header-circle:hover {
    cursor: pointer;
}

.inner-row-header-circle {
    width: 10px;
    height: 10px;
    border-radius: 100%;
    background-color: #81b6ef;
}
.by-user {
    color: #64748b;
}
</style>
