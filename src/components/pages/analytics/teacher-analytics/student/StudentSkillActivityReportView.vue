<script>
import { useUsersStore } from '../../../../../stores/UsersStore';
import { useTeacherAnalyticsStore } from '../../../../../stores/TeacherAnalyticsStore';
import StudentSkillActivityChart from '../../../../components/teacher-analytics/students/StudentSkillActivityChart.vue';

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
        StudentSkillActivityChart
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
        this.teacherAnalyticsStore.skillActivities =
            this.teacherAnalyticsStore.skillActivities.map((skill) => {
                return {
                    ...skill,
                    quantity: this.millisecondsToHours(skill.quantity, 2)
                };
            });
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
        },
        millisecondsToHours(milliseconds, precision) {
            const msPerHour = 60 * 60 * 1000;
            const hours = milliseconds / msPerHour;
            // Round to specified decimal places
            return hours.toFixed(precision);
        }
    }
};
</script>

<template>
    <div class="container">
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading">Skill Activity Report</h1>
            <h2 class="secondary-heading h3">{{ studentName }}</h2>
        </span>
        <StudentSkillActivityChart
            v-if="teacherAnalyticsStore.skillActivities.length > 0"
            :data="teacherAnalyticsStore.skillActivities"
            colour="darkred"
        />
        <p v-else>No skills visited by this student.</p>
    </div>
</template>

<style></style>
