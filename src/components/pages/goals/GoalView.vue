<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';
import { useUserSkillsStore } from '../../../stores/UserSkillsStore.js';
export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const userSkillsStore = useUserSkillsStore();
        return {
            userDetailsStore,
            userSkillsStore
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
        await this.userSkillsStore.getFilteredUnnestedList(
            this.userDetailsStore.userId
        );

        for (let i = 0; i < this.goalSteps.length; i++) {
            let userSkillObj = this.userSkillsStore.filteredUnnestedList.find(
                (skill) => skill.id == this.goalSteps[i].skill_id
            );

            this.goalSteps[i].name = userSkillObj.name;
            // this.goalSteps[i].level = userSkillObj.level;
            // this.goalSteps[i].url = userSkillObj.url;
            this.goalSteps[i].isMastered = userSkillObj.is_mastered;
        }
    },
    methods: {
        async getGoalSteps() {
            const result = await fetch(
                '/goals/' + this.goalId + '/goal-steps/list'
            );
            this.goalSteps = await result.json();
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

        <p class="mb-2" v-for="(goalStep, index) in goalSteps">
            {{ index + 1 }})
            <svg
                v-if="goalStep.isMastered != 1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                class="primary-icon"
                width="20"
                height="20"
            >
                <!--!Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                <path
                    d="M384 80c8.8 0 16 7.2 16 16l0 320c0 8.8-7.2 16-16 16L64 432c-8.8 0-16-7.2-16-16L48 96c0-8.8 7.2-16 16-16l320 0zM64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32z"
                />
            </svg>
            <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                class="primary-icon"
                width="20"
                height="20"
            >
                <!--!Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                <path
                    d="M64 80c-8.8 0-16 7.2-16 16l0 320c0 8.8 7.2 16 16 16l320 0c8.8 0 16-7.2 16-16l0-320c0-8.8-7.2-16-16-16L64 80zM0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM337 209L209 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L303 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
                />
            </svg>
            &nbsp;
            <router-link
                class="goals"
                :to="`/skills/${goalStep.url}`"
                target="_blank"
            >
                {{ goalStep.name }}
            </router-link>
            &nbsp;
            <svg
                v-if="index + 1 == goalSteps.length"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                class="primary-icon"
                width="20"
                heigth="20"
            >
                <!--!Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                <path
                    d="M448 256A192 192 0 1 0 64 256a192 192 0 1 0 384 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 80a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm0-224a144 144 0 1 1 0 288 144 144 0 1 1 0-288zM224 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"
                />
            </svg>
        </p>

        <button class="btn btn-danger mt-3" @click="deleteGoal()">
            Delete
        </button>
    </div>
</template>

<style>
.goals {
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
</style>
