<script>
import { useUsersStore } from '../../../stores/UsersStore';
export default {
    setup() {
        const usersStore = useUsersStore();
        return {
            usersStore
        };
    },
    data() {
        return {
            studentId: this.$route.params.studentId,
            studentName: null,
            visitedSkills: []
        };
    },
    async created() {
        if (this.usersStore.users.length < 1) await this.usersStore.getUsers();
        const foundObject = this.usersStore.users.find(
            (student) => student.id === this.studentId
        );
        if (foundObject) {
            this.studentName = foundObject.username;
        }

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
        <h1 class="heading">Skill Activity Report: {{ studentName }}</h1>
        <!-- <p>
            <em>
                try this one:
                https://observablehq.com/@tezzutezzu/world-history-timeline</em
            >
        </p> -->
        <div v-if="this.visitedSkills.length > 0" class="mb-4">
            <table class="table">
                <tr>
                    <th>Skill</th>
                    <th>Date last visited</th>
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
        <div v-else>
            <p>No skills visited by this student.</p>
        </div>
    </div>
</template>

<style></style>
