<script>
export default {
    data() {
        return {
            userSkills: [],
            noSkills: true
        };
    },
    props: ['userId'],
    async created() {
        const result = await fetch('/user-skills/unnested-list/' + this.userId);
        this.userSkills = await result.json();
    },
    computed: {
        availableSkills() {
            const availableSkills = [];
            for (let i = 0; i < this.userSkills.length; i++) {
                if (
                    (this.userSkills[i].is_accessible == 1) &
                    (this.userSkills[i].is_mastered != 1)
                ) {
                    availableSkills.push({
                        name: this.userSkills[i].name,
                        id: this.userSkills[i].id,
                        url: this.userSkills[i].url,
                        level: this.userSkills[i].level,
                        icon: this.userSkills[i].icon
                    });
                }
            }
            if (availableSkills.length > 0) {
                this.noSkills = false;
            }
            return availableSkills;
        }
    },
    methods: {}
};
</script>

<template>
    <h2 class="secondary-heading h5 bg-white rounded p-2">Available Skills</h2>
    <div id="skill-list">
        <router-link
            v-for="availableSkill in availableSkills"
            :class="{
                'grade-school': availableSkill.level == 'grade_school',
                'middle-school': availableSkill.level == 'middle_school',
                'high-school': availableSkill.level == 'high_school',
                college: availableSkill.level == 'college',
                phd: availableSkill.level == 'phd'
            }"
            class="skill-link btn m-2 d-flex"
            :to="`/skills/${availableSkill.url}`"
            target="_blank"
        >
            <img class="icons" :src="availableSkill.icon" />&nbsp;
            {{ availableSkill.name }}
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
    overflow-x: hidden;
    border-radius: 10px;
    /*    max-height: 300px;
     background-color: rgb(33, 37, 41); */
}

#skill-list div {
    padding: 10px 6px;
}

.skill-link {
    width: fit-content;
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
