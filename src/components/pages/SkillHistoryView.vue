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

            // Prepare the data.
            for (let i = 0; i < this.skillRevisions.length; i++) {
                // Split timestamp into [ Y, M, D, h, m, s ]
                var date = this.skillRevisions[i].edited_date.replace('T', ' ');
                date = date.replace('Z', ' ');
                console.log(date);
                let newDate = date.split(/[- :]/);
                console.log(newDate);
                // Apply each element to the Date function
                var finalDate = new Date(
                    Date.UTC(
                        newDate[0],
                        newDate[1] - 1,
                        newDate[2],
                        newDate[3],
                        newDate[4],
                        newDate[5]
                    )
                );
                console.log(finalDate);
            }
        }
    }
};
</script>

<template>
    <div class="container">
        <h1>{{ skill.name }}: Revision history</h1>
        <ul>
            <li v-for="revision in skillRevisions">
                {{ revision.edited_date }}
            </li>
        </ul>
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
