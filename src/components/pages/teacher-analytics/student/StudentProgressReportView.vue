<script>
import { useUsersStore } from '../../../../stores/UsersStore';
import StudentProgressLineChart from '../../../components/teacher-analytics/students/StudentProgressLineChart.vue';
export default {
    setup() {
        const usersStore = useUsersStore();
        return {
            usersStore
        };
    },
    components: {
        StudentProgressLineChart
    },
    data() {
        return {
            studentId: this.$route.params.studentId,
            studentName: null,
            studentProgress: []
        };
    },
    async created() {
        // Get student name
        if (this.usersStore.users.length < 1) await this.usersStore.getUsers();
        const foundObject = this.usersStore.users.find(
            (student) => student.id === this.studentId
        );
        if (foundObject) {
            this.studentName = foundObject.username;
        }

        await this.getStudentDurationPerDay();
    },
    methods: {
        async getStudentDurationPerDay() {
            fetch(`/student-analytics/student-progress/${this.studentId}`)
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].date = new Date(data[i].date);
                    }
                    data.sort((a, b) => a.date - b.date);
                    this.studentProgress = data;
                    console.log('Student Progress Data:', this.studentProgress);
                })
                .catch((error) => {
                    console.error('Error fetching student progress:', error);
                });
        }
    }
};
</script>

<template>
    <div class="container">
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading">Progress Report</h1>
            <h2 class="secondary-heading h3">{{ studentName }}</h2>
        </span>
        <StudentProgressLineChart
            v-if="studentProgress.length > 0"
            :data="studentProgress"
        />
    </div>
</template>

<style></style>
