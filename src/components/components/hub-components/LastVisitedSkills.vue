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
    <h2 class="secondary-heading h4">Last visited Skills</h2>
    <div v-if="visitedSkills.length > 0" id="skill-list">
        <div v-for="skill in visitedSkills">
            <router-link
                :class="{
                    'grade-school': skill.level == 'grade_school',
                    'middle-school': skill.level == 'middle_school',
                    'high-school': skill.level == 'high_school',
                    college: skill.level == 'college',
                    phd: skill.level == 'phd'
                }"
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
/* Scrollbar */
::-webkit-scrollbar {
    width: 12px;
}

::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    border-radius: 10px;
}

::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.5);
}

.table-responsive {
    max-height: 300px;
    display: flex;
    flex-direction: column;
}

#skill-list {
    overflow-y: auto;
    max-height: 300px;
    background-color: rgb(33, 37, 41);
    border-radius: 10px;
}

#skill-list div {
    padding: 10px 6px;
}

.skill-link {
    text-decoration: none !important;
    color: black;
    text-align: start
}

/* Level colors */
.grade-school {
    background-color: #40e0d0;
}
.middle-school {
    background-color: #33a133;
    color: white;
}
.high-school {
    background-color: #ffd700;
}
.college {
    background-color: #ffa500;
}
.phd {
    background-color: #ff0000;
    color: white;
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
