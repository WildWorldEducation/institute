<script>
import { useUsersStore } from '../../../../../stores/UsersStore';
import StudentProgressLineChart from '../../../../components/teacher-analytics/students/StudentProgressLineChart.vue';
import DownloadCSVBtn from '../../../../components/downloadCSVBtn/downloadCSVBtn.vue';
export default {
    setup() {
        const usersStore = useUsersStore();
        return {
            usersStore
        };
    },
    components: {
        StudentProgressLineChart,
        DownloadCSVBtn
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

        await this.getStudentProgress();
    },
    methods: {
        async getStudentProgress() {
            fetch(`/student-analytics/student-progress/${this.studentId}`)
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].date = new Date(data[i].date);
                    }
                    data.sort((a, b) => a.date - b.date);
                    this.studentProgress = data;
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
            <h2
                class="secondary-heading h3 d-flex justify-content-end align-items-center"
            >
                {{ studentName }}
                <DownloadCSVBtn
                    :data="studentProgress"
                    :fileName="`Progress Report - ${studentName}`"
                    toolTip="Download progress data as CSV"
                />
            </h2>
        </span>

        <StudentProgressLineChart
            v-if="studentProgress.length > 0"
            :data="studentProgress"
        />
        <p v-else>There is no data to show yet.</p>
    </div>
</template>

<style></style>
