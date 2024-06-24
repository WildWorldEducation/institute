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
                        id: this.userSkills[i].id
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
    <!-- <h1 class="text-center text-md-start d-lg-none">My Progress</h1>
  <h2 class="text-center text-md-start d-lg-none">2023 - Active</h2> -->
    <div class="table-responsive"></div>
    <div id="tile">Available Skills</div>
    <div id="skill-list">
        <div v-for="availableSkill in availableSkills">
            <router-link
                class="skill-link"
                :to="`/skills/${availableSkill.id}`"
                target="_blank"
            >
                {{ availableSkill.name }}
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
    overflow: auto;
    max-height: 300px;
}

#tile {
    background-color: #e8e2f9;
    border-color: #dbd0f9;
    color: #ad9af3;
    padding: 14px 20px;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
    font-size: 20px;
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
