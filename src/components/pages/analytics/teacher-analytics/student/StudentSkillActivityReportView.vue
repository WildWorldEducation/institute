<script>
import { useUsersStore } from '../../../../../stores/UsersStore';
import { useTeacherAnalyticsStore } from '../../../../../stores/TeacherAnalyticsStore';
import StudentSkillActivityChart from '../../../../components/analytics/full-size/students/StudentSkillActivityChart.vue';
import DownloadCSVBtn from '../../../../components/downloadCSVBtn/downloadCSVBtn.vue';

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
            downloadData: []
        };
    },
    components: {
        StudentSkillActivityChart,
        DownloadCSVBtn
    },
    async created() {},
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
        millisToMinutesAndSeconds(millis) {
            var minutes = Math.floor(millis / 60000);
            var seconds = ((millis % 60000) / 1000).toFixed(0);
            return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        }
    }
};
</script>

<template>
    <div class="container">
        <div class="d-flex flex-column">
            <span class="d-flex justify-content-between w-100">
                <h1 class="heading">Skill Activity Report</h1>
                <h2
                    class="secondary-heading h3 d-flex justify-content-end align-items-center"
                >
                    <DownloadCSVBtn
                        :data="downloadData"
                        :fileName="`Skill Activity Report - ${studentName}`"
                    />
                    {{ studentName }}
                </h2>
            </span>
        </div>
        <StudentSkillActivityChart
            v-if="teacherAnalyticsStore.skillActivities.length > 0"
            :data="teacherAnalyticsStore.skillActivities"
            colour="darkred"
        />
        <p v-else>No skills visited by this student.</p>
    </div>
</template>

<style></style>
