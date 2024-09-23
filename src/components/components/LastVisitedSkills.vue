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

        for (let i = 0; i < this.visitedSkills.length; i++) {
            // Format the skill name as a URL, based on the Wikipedia style.
            this.visitedSkills[i].url = this.visitedSkills[i].name?.replace(
                / /g,
                '_'
            );
        }
    },
    computed: {}
};
</script>

<template>
    <div class="table-responsive"></div>
    <h2 id="title">Last visited Skills</h2>
    <div id="skill-list">
        <div v-for="skill in visitedSkills">
            <router-link
                class="skill-link"
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

#title {
    background-color: #e8e2f9;
    border-color: #dbd0f9;
    color: #ad9af3;
    padding: 14px 20px;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
    font-size: 20px;
    margin-bottom: 0px;
}

#skill-list div {
    border-collapse: collapse;
    border: 1px solid #ad9af3;
    border-top: 0px;
    font-family: 'Poppins', sans-serif;
    font-size: 20px;
    font-weight: 500;
    line-height: 28px;
    text-align: left;
    padding: 10px 6px;
    color: #667085;
}

.skill-link {
    text-decoration: none !important;
    color: #667085;
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
