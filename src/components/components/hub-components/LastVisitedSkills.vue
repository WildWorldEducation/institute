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
        console.log(this.visitedSkills);
        if (this.visitedSkills.length > 0) {
            this.noSkills = false;
        }
    },
    computed: {}
};
</script>

<template>
    <h2 class="secondary-heading h5 bg-white rounded p-2">
        Last Visited Skills
    </h2>
    <div id="skill-list">
        <router-link
            v-for="skill in visitedSkills"
            :class="{
                'grade-school': skill.level == 'grade_school',
                'middle-school': skill.level == 'middle_school',
                'high-school': skill.level == 'high_school',
                college: skill.level == 'college',
                phd: skill.level == 'phd'
            }"
            class="skill-link btn m-2 d-flex"
            :to="`/skills/${skill.url}`"
            target="_blank"
        >
            <img class="icons" :src="skill.icon" />&nbsp; {{ skill.name }}
        </router-link>
    </div>
</template>

<style scoped>
.icons {
    mix-blend-mode: multiply;
    height: 30px;
    border-radius: 50%;
}

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
    /* max-height: 300px;
     background-color: rgb(33, 37, 41); */
    border-radius: 10px;
}

#skill-list div {
    padding: 10px 6px;
}

.skill-link:hover {
    border: 1px solid black;
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

.skill-link {
    width: fit-content;
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
