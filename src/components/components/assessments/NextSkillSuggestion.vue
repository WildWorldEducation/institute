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
            nextSkillsInBranch: []
        };
    },
    created() {
        this.getNextSkillsInBranch();
    },
    methods: {
        async getNextSkillsInBranch() {
            // query user skills
            // skills whose parent is just mastered skill
            // who are not subskills
            const result = await fetch(
                '/user-skills/get-next-accessible-in-branch/' +
                    this.userDetailsStore.userId +
                    '/' +
                    this.skillId
            );
            this.nextSkillsInBranch = await result.json();
            console.log(this.nextSkillsInBranch);
        }
    }
};
</script>

<template>
    <h2 class="secondary-heading h4">Choose Next Skill</h2>
    <div class="wrapper"></div>
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
</style>
