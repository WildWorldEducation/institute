<script>
import { useUsersStore } from '../../../../stores/UsersStore';
import { useTeacherAnalyticsStore } from '../../../../stores/TeacherAnalyticsStore';
import SkillActivityGanttChart from '../../../components/teacher-analytics/students/SkillActivityGanttChart.vue';

export default {
    setup() {
        const usersStore = useUsersStore();
        const teacherAnalyticsStore = useTeacherAnalyticsStore();
        return {
            usersStore,
            teacherAnalyticsStore
        };
    },
    data() {
        return {
            studentId: this.$route.params.studentId,
            studentName: null,
            visitedSkills: []
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

        if (this.teacherAnalyticsStore.skillActivities.length == 0) {
            await this.teacherAnalyticsStore.getSkillActivityReport(
                this.studentId
            );
        }
    },
    methods: {
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
            v-if="teacherAnalyticsStore.skillActivities.length > 0"
            :data="teacherAnalyticsStore.skillActivities"
            colour="darkred"
        />
        <div
            v-if="teacherAnalyticsStore.skillActivities.length > 0"
            class="mb-4"
        >
            <table class="table">
                <tr>
                    <th>Skill</th>
                    <th>Date first visited</th>
                    <th>Date last visited</th>
                </tr>
                <tr
                    v-for="skill in teacherAnalyticsStore.skillActivities"
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
                        {{ visitedDate(skill.startDate) }}
                    </td>
                    <td>
                        {{ visitedDate(skill.endDate) }}
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
