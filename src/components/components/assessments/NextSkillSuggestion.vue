<script>
export default {
    setup() {},
    components: {},
    data() {
        return {};
    },
    mounted() {},
    methods: {
        getNextSkillsInBranch() {
            // query user skills
            // skills whose parent is just mastered skill
            // who are not subskills
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
