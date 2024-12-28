<script>
import { useUserSkillsStore } from '../../../stores/UserSkillsStore.js';
import { useUsersStore } from '../../../stores/UsersStore.js';

export default {
    setup() {
        const userSkillsStore = useUserSkillsStore();
        const usersStore = useUsersStore();
        return {
            userSkillsStore,
            usersStore
        };
    },
    data() {
        return {
            studentId: this.$route.params.studentId,
            studentName: '',
            goals: []
        };
    },
    async created() {
        if (this.usersStore.users.length == 0) {
            await this.usersStore.getUsers();
        }

        for (let i = 0; i < this.usersStore.users.length; i++) {
            if (this.usersStore.users[i].id == this.studentId) {
                this.studentName = this.usersStore.users[i].username;
                break;
            }
        }
        await this.userSkillsStore.getFilteredUnnestedList(this.studentId);
        await this.getGoals();
    },
    methods: {
        async getGoals() {
            const result = await fetch('/goals/' + this.studentId + '/list');
            this.goals = await result.json();
            for (let i = 0; i < this.goals.length; i++) {
                await this.getGoalSteps(this.goals[i]);
            }
            this.prepareGoals();
        },
        async getGoalSteps(goal) {
            const result = await fetch(
                '/goals/' + goal.id + '/goal-steps/list'
            );
            goal.steps = await result.json();
        },
        prepareGoals() {
            for (let i = 0; i < this.goals.length; i++) {
                let skillObj = this.userSkillsStore.filteredUnnestedList.find(
                    (skill) => skill.id === this.goals[i].skill_id
                );
                this.goals[i].name = skillObj.name;
                this.goals[i].level = skillObj.level;
                this.goals[i].showSteps = false;

                for (let j = 0; j < this.goals[i].steps.length; j++) {
                    let userSkillObj =
                        this.userSkillsStore.filteredUnnestedList.find(
                            (skill) =>
                                skill.id == this.goals[i].steps[j].skill_id
                        );

                    this.goals[i].steps[j].name = userSkillObj.name;
                    this.goals[i].steps[j].level = userSkillObj.level;
                    this.goals[i].steps[j].url = userSkillObj.url;
                    this.goals[i].steps[j].isMastered =
                        userSkillObj.is_mastered;
                }
            }
        },
        async deleteGoal(goalId) {
            let text = 'Are you sure you want to delete this goal?';
            if (confirm(text) == true) {
                const result = await fetch('/goals/' + goalId, {
                    method: 'DELETE'
                });

                if (result.error) {
                    console.log(result.error);
                }

                await this.getGoals();
            }
        }
    }
};
</script>

<template>
    <div class="container p-3 bg-light rounded">
        <h1 class="heading">{{ studentName }}</h1>
        <h2 class="secondary-heading">Goal Progress</h2>
        <div id="goal-list">
            <div v-for="goal in goals">
                <div class="d-flex">
                    <h2 class="goal h4">
                        {{ goal.name }}

                        <!-- Expand/Collapse button -->
                        <button
                            class="btn"
                            @click="goal.showSteps = !goal.showSteps"
                        >
                            <!-- Plus sign -->
                            <svg
                                v-if="!goal.showSteps"
                                width="18"
                                height="18"
                                class="primary-icon"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                            >
                                <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                                <path
                                    d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                                />
                            </svg>
                            <!-- Minus sign -->
                            <svg
                                v-else
                                width="18"
                                height="18"
                                class="primary-icon"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                            >
                                <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                                <path
                                    d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                                />
                            </svg>
                        </button>
                        <!-- Delete button -->
                        <button class="btn" @click="deleteGoal(goal.id)">
                            <!-- Trash sign -->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                                width="18"
                                height="18"
                                class="primary-icon"
                            >
                                <!-- !Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                                <path
                                    d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"
                                />
                            </svg>
                        </button>
                    </h2>
                </div>
                <ul v-if="goal.showSteps">
                    <li v-for="step in goal.steps">
                        <svg
                            v-if="step.isMastered != 1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 448 512"
                            class="primary-icon"
                            width="20"
                            height="20"
                        >
                            <!-- !Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
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
                            <!-- !Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                            <path
                                d="M64 80c-8.8 0-16 7.2-16 16l0 320c0 8.8 7.2 16 16 16l320 0c8.8 0 16-7.2 16-16l0-320c0-8.8-7.2-16-16-16L64 80zM0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM337 209L209 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L303 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
                            />
                        </svg>

                        <span
                            class="rounded pe-2"
                            :class="{
                                'grade-school': step.level == 'grade_school',
                                'middle-school': step.level == 'middle_school',
                                'high-school': step.level == 'high_school',
                                college: step.level == 'college',
                                phd: step.level == 'phd'
                            }"
                            >&nbsp; {{ step.name }}</span
                        >
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<style>
.goal .btn {
    margin-bottom: 10px;
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
