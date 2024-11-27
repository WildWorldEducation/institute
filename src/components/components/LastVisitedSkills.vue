<script>
export default {
    data() {
        return {
            visitedSkills: [],
            noSkills: true
        };
    },
    props: ['userId'],
    async created() {
        const result = await fetch('/skills/last-visited/');
        this.visitedSkills = await result.json();
        if (this.visitedSkills.length > 0) {
            this.noSkills = false;
        }
    },
    computed: {}
};
</script>

<template>
    <h2>Last visited Skills</h2>
    <div id="skill-list">
        <div v-for="skill in visitedSkills">
            <router-link
                class="skill-link btn"
                :to="`/skills/${skill.url}`"
                target="_blank"
            >
                {{ skill.name }}
            </router-link>
        </div>
        <div v-if="noSkills" id="no-skill-cell"></div>
    </div>
</template>

<style scoped>
.table-responsive {
    max-height: 300px;
    display: flex;
    flex-direction: column;
}

#skill-list {
    overflow-y: auto;
    max-height: 300px;
}

#skill-list div {
    padding: 10px 6px;
}

.skill-link {
    text-decoration: none !important;
    background-color: white;
}

#skill-list div:hover {
    cursor: pointer;
    text-decoration: underline;
}

#no-skill-cell {
    height: 41px;
}

@media (max-width: 480px) {
    #skill-list {
        max-height: 200px;
        margin-left: 1px;
    }
}
</style>
