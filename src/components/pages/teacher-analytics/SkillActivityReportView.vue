<script>
import { useUsersStore } from '../../../stores/UsersStore';
import SkillActivityGanttChart from '../../components/student-analytics/SkillActivityGanttChart.vue';

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
            visitedSkills: [],
            skillActivities: []
        };
    },
    components: {
        SkillActivityGanttChart
    },
    async created() {
        if (this.usersStore.users.length < 1) await this.usersStore.getUsers();
        const foundObject = this.usersStore.users.find(
            (student) => student.id === this.studentId
        );
        if (foundObject) {
            this.studentName = foundObject.username;
        }

        this.getSkillActivityReport();
    },

    methods: {
        // getLastVisitedSkills() {
        //     // Fetch last visited skills for the student
        //     fetch(`/student-analytics/last-visited-skills/${this.studentId}`)
        //         .then((response) => response.json())
        //         .then((data) => {
        //             this.visitedSkills = data;
        //         })
        //         .catch((error) => {
        //             console.error('Error fetching last visited skills:', error);
        //         });
        // },
        getSkillActivityReport() {
            fetch(`/student-analytics/skill-activity-report/${this.studentId}`)
                .then((response) => response.json())
                .then((data) => {
                    this.skillActivities = data;
                    console.log(this.skillActivities);
                })
                .catch((error) => {
                    console.error('Error fetching skill activities:', error);
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
        <SkillActivityGanttChart
            v-if="skillActivities.length > 0"
            :data="skillActivities"
            colour="darkred"
        />
        <p>
            <em>
                try this one:
                https://observablehq.com/@tezzutezzu/world-history-timeline</em
            >
        </p>
        <p>
            <em>
                Will have to record more data. Which days teh student goes on
                the skill.</em
            >
            <em> Would need to create a new table</em>
        </p>
        <div v-if="this.skillActivities.length > 0" class="mb-4">
            <table class="table">
                <tr>
                    <th>Skill</th>
                    <th>Date first visited</th>
                    <th>Date last visited</th>
                </tr>
                <tr
                    v-for="skill in skillActivities"
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
                        {{ visitedDate(skill.first_visited_date) }}
                    </td>
                    <td>
                        {{ visitedDate(skill.last_visited_date) }}
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
