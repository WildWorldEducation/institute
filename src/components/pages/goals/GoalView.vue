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
            goalId: this.$route.params.goalId,
            goalSteps: []
        };
    },
    async created() {
        await this.getGoalSteps();
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
        }

        for (let i = 0; i < this.goalSteps.length; i++) {
            // console.log(this.goalSteps[i].skill_id);

            let skillObj = this.skillsStore.skillsList.find(
                (skill) => skill.id == this.goalSteps[i].skill_id
            );

            this.goalSteps[i].name = skillObj.name;
            this.goalSteps[i].level = skillObj.level;
            this.goalSteps[i].url = skillObj.url;
        }
    },
    methods: {
        async getGoalSteps() {
            const result = await fetch(
                '/goals/' + this.goalId + '/goal-steps/list'
            );
            this.goalSteps = await result.json();
        }
    }
};
</script>

<template>
    <div class="container p-3 bg-light rounded">
        <h1 class="heading">Goal Progress</h1>
        <table>
            <tr v-for="goalStep in goalSteps">
                <th>
                    <router-link
                        class="btn"
                        :class="{
                            'grade-school': goalStep.level == 'grade_school',
                            'middle-school': goalStep.level == 'middle_school',
                            'high-school': goalStep.level == 'high_school',
                            college: goalStep.level == 'college',
                            phd: goalStep.level == 'phd'
                        }"
                        :to="`/skills/${goalStep.url}`"
                        target="_blank"
                    >
                        {{ goalStep.name }}
                    </router-link>
                </th>
                <th>
                    <span v-if="goalStep.is_mastered == 1">mastered</span>
                    <span v-else>unmastered</span>
                </th>
            </tr>
        </table>
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
