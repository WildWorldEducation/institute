<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    components: {},
    data() {
        return {
            skillId: this.$route.params.id,
            nextSkillsInBranch: [],
            showNextSkillsInBranch: false
        };
    },
    created() {
        this.getNextSkillsInBranch();
    },
    methods: {
        async getNextSkillsInBranch() {
            const result = await fetch(
                '/user-skills/get-next-accessible-in-branch/' +
                    this.userDetailsStore.userId +
                    '/' +
                    this.skillId
            );
            this.nextSkillsInBranch = await result.json();
            this.showNextSkillsInBranch = true;
        }
    }
};
</script>

<template>
    <h2 class="secondary-heading h4">Next skills in this branch</h2>
    <div v-if="showNextSkillsInBranch" class="wrapper">
        <div v-for="nextSkill in nextSkillsInBranch">
            <router-link
                :class="{
                    'grade-school': nextSkill.level == 'grade_school',
                    'middle-school': nextSkill.level == 'middle_school',
                    'high-school': nextSkill.level == 'high_school',
                    college: nextSkill.level == 'college',
                    phd: nextSkill.level == 'phd'
                }"
                class="skill-link btn"
                :to="`/skills/${nextSkill.url}`"
                target="_blank"
            >
                {{ nextSkill.name }}
            </router-link>
        </div>
    </div>
</template>

<style scoped>
.wrapper {
    padding: 15px 20px;
    background-color: #f0f1f3;
    border-radius: 5px;
    border: #8f7bd6 1px solid;
    margin: 10px 0px;
    width: fit-content;
    height: fit-content;
    display: flex;
    flex-direction: column;
    gap: 8px;
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
