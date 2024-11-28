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
                    (this.userSkills[i].is_mastered != 1) &
                    (this.userSkills[i].type != 'domain')
                ) {
                    availableSkills.push({
                        name: this.userSkills[i].name,
                        id: this.userSkills[i].id,
                        url: this.userSkills[i].url,
                        level: this.userSkills[i].level
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
    <h2>Available Skills</h2>
    <div id="skill-list">
        <div v-for="availableSkill in availableSkills">
            <router-link
                :class="{
                    'grade-school': availableSkill.level == 'grade_school',
                    'middle-school': availableSkill.level == 'middle_school',
                    'high-school': availableSkill.level == 'high_school',
                    college: availableSkill.level == 'college',
                    phd: availableSkill.level == 'phd'
                }"
                class="skill-link btn"
                :to="`/skills/${availableSkill.url}`"
                target="_blank"
            >
                {{ availableSkill.name }}
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
    overflow-x: hidden;
    max-height: 300px;
    border-radius: 10px;
}

#skill-list div {
    padding: 10px 6px;
}

.skill-link {
    text-decoration: none !important;
    color: black;
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
