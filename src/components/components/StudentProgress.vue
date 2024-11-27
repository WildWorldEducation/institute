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
                    // Format the skill name as a URL, based on the Wikipedia style.
                    let url = this.userSkills[i].name.replace(/ /g, '_');

                    availableSkills.push({
                        name: this.userSkills[i].name,
                        id: this.userSkills[i].id,
                        url: this.userSkills[i].url
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
