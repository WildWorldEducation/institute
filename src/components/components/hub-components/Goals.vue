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
    },
    methods: {
        async getGoals() {
            const result = await fetch(
                '/user-skills/goals/' + this.userDetailsStore.userId + '/list'
            );
            this.goals = await result.json();
        }
    }
};
</script>

<template>
    <h2 class="tertiary-heading h5">Goals</h2>
    <div id="goal-list">
        <router-link
            v-for="goal in goals"
            :class="{
                'grade-school': goal.level == 'grade_school',
                'middle-school': goal.level == 'middle_school',
                'high-school': goal.level == 'high_school',
                college: goal.level == 'college',
                phd: goal.level == 'phd'
            }"
            class="goal-link btn m-2 d-flex"
            :to="`/goals/${userDetailsStore.userId}/` + goal.skill_id"
            target="_blank"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                fill="black"
                width="20"
                heigth="20"
            >
                <!-- !Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                <path
                    d="M448 256A192 192 0 1 0 64 256a192 192 0 1 0 384 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 80a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm0-224a144 144 0 1 1 0 288 144 144 0 1 1 0-288zM224 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"
                />
            </svg>
            &nbsp;
            {{ goal.name }}
        </router-link>
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
    /* max-height: 300px;
     background-color: rgb(33, 37, 41); */
    border-radius: 10px;
}

#goal-list div {
    padding: 10px 6px;
}

.goal-link:hover {
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

.goal-link {
    width: fit-content;
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
