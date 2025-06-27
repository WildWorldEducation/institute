<script>
export default {
    setup() {},
    components: {},
    data() {
        return {
            studentId: this.$route.params.studentId,
            visitedSkills: []
        };
    },
    async created() {
        this.getLastVisitedSkills();
    },

    methods: {
        getLastVisitedSkills() {
            // Fetch last visited skills for the student
            fetch(`/student-analytics/last-visited-skills/${this.studentId}`)
                .then((response) => response.json())
                .then((data) => {
                    this.visitedSkills = data;
                })
                .catch((error) => {
                    console.error('Error fetching last visited skills:', error);
                });
        },
        visitedDate(date) {
            let jsDate = new Date(date);
            return jsDate.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    }
};
</script>

<template>
    <div class="container">
        <h1 class="heading">Skill Activity Report</h1>
        <div class="mb-4">
            <table>
                <tr>
                    <th>Skill</th>
                    <th>Date</th>
                </tr>
                <tr
                    v-for="skill in visitedSkills"
                    :key="skill.id"
                    class="table-rows"
                >
                    <td>
                        <router-link
                            target="_blank"
                            :to="'/skills/' + skill.url"
                            >{{ skill.name }}</router-link
                        >
                    </td>
                    <td>
                        {{ visitedDate(skill.visited_at) }}
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<style></style>
