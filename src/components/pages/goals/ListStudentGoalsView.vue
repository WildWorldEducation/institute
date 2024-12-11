<script>
import { useSkillsStore } from '../../../stores/SkillsStore.js';

export default {
    setup() {
        const skillsStore = useSkillsStore();

        return {
            skillsStore
        };
    },
    data() {
        return {
            studentId: this.$route.params.studentId,
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

            for (let j = 0; j < this.goals[i].steps.length; j++) {
                let skillObj = this.skillsStore.skillsList.find(
                    (skill) => skill.id == this.goals[i].steps[j].skill_id
                );
                this.goals[i].steps[j].name = skillObj.name;
                this.goals[i].steps[j].level = skillObj.level;
            }
        }

        console.log(this.goals);
    },
    methods: {
        async getGoals() {
            const result = await fetch('/goals/' + this.studentId + '/list');
            this.goals = await result.json();
            for (let i = 0; i < this.goals.length; i++) {
                await this.getGoalSteps(this.goals[i]);
            }
        },
        async getGoalSteps(goal) {
            const result = await fetch(
                '/goals/' + goal.id + '/goal-steps/list'
            );
            goal.steps = await result.json();
        },
        async deleteGoal() {
            let text = 'Are you sure you want to delete this goal?';
            if (confirm(text) == true) {
                const result = await fetch('/goals/' + this.goalId, {
                    method: 'DELETE'
                });

                if (result.error) {
                    console.log(result.error);
                }

                this.$router.push('/');
            }
        }
    }
};
</script>

<template>
    <div class="container p-3 bg-light rounded">
        <h1 class="heading">Goal Progress</h1>
        <div id="goal-list">
            <div v-for="goal in goals">
                <div
                    :class="{
                        'grade-school': goal.level == 'grade_school',
                        'middle-school': goal.level == 'middle_school',
                        'high-school': goal.level == 'high_school',
                        college: goal.level == 'college',
                        phd: goal.level == 'phd'
                    }"
                    class="goal-link mb-2"
                >
                    {{ goal.name }}
                </div>
                <ul>
                    <li v-for="step in goal.steps">{{ step.name }}</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<style>
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
</style>
