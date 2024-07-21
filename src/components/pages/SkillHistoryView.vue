<script>
export default {
    setup() {},
    data() {
        return {
            skillId: this.$route.params.id,
            skill: {},
            skillRevisions: []
        };
    },
    async created() {
        await this.getSkill();
        await this.getRevisions();
    },
    async mounted() {},
    methods: {
        async getSkill() {
            // Load the skill data
            const res = await fetch('/skills/show/' + this.skillId);
            this.skill = await res.json();
        },
        async getRevisions() {
            // Load the skill data
            const res = await fetch('/skill-history/' + this.skillId + '/list');
            this.skillRevisions = await res.json();
            console.log(this.skillRevisions);
        }
    }
};
</script>

<template>
    <div class="container">
        <h1>{{ skill.name }}: Revision history</h1>
    </div>
</template>

<style scoped>
h1 {
    color: #a48be6;
    font-size: 30px;
    font-weight: 700;
    margin-bottom: 5px;
}
</style>
