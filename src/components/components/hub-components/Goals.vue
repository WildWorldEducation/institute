<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';
import { useSkillsStore } from '../../../stores/SkillsStore.js';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const skillsStore = useSkillsStore();
        return {
            userDetailsStore,
            skillsStore
        };
    },
    data() {
        return {
            goals: []
        };
    },
    async created() {
        await this.getGoals();
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
        }

        for (let i = 0; i < this.goals.length; i++) {
            let skillObj = this.skillsStore.skillsList.find(
                (skill) => skill.id === this.goals[i].skill_id
            );
            this.goals[i].name = skillObj.name;
            this.goals[i].level = skillObj.level;
        }
        console.log(this.goals);
    },
    methods: {
        async getGoals() {
            const result = await fetch(
                '/goals/' + this.userDetailsStore.userId + '/list'
            );
            this.goals = await result.json();
        }
    }
};
</script>

<template>
    <h2 class="secondary-heading h4">Goals</h2>
    <div id="goal-list">
        <div v-for="goal in goals">
            <router-link
                :class="{
                    'grade-school': goal.level == 'grade_school',
                    'middle-school': goal.level == 'middle_school',
                    'high-school': goal.level == 'high_school',
                    college: goal.level == 'college',
                    phd: goal.level == 'phd'
                }"
                class="goal-link btn"
                :to="`/goals/${goal.id}`"
                target="_blank"
            >
                {{ goal.name }}
            </router-link>
        </div>
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

#goal-list {
    overflow-y: auto;
    max-height: 300px;
    background-color: rgb(33, 37, 41);
    border-radius: 10px;
}

#goal-list div {
    padding: 10px 6px;
}

.goal-link {
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

#goal-list div:hover {
    cursor: pointer;
    text-decoration: underline;
}

@media (max-width: 480px) {
    #goal-list {
        max-height: 200px;
        margin-left: 1px;
    }
}
</style>
