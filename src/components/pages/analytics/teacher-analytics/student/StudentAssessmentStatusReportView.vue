<script>
import { useUsersStore } from '../../../../../stores/UsersStore';
import { useUserSkillsStore } from '../../../../../stores/UserSkillsStore';
import { useTeacherAnalyticsStore } from '../../../../../stores/TeacherAnalyticsStore';
import PassedAssessmentsTimelineChart from '../../../../components/teacher-analytics/students/PassedAssessmentsTimelineChart.vue';
import AttemptedAssessmentsTimelineChart from '../../../../components/teacher-analytics/students/AttemptedAssessmentsTimelineChart.vue';
import FailedAssessmentsHorizontalBarChart from '../../../../components/teacher-analytics/students/FailedAssessmentsHorizontalBarChart.vue';
import DownloadCSVBtn from '../../../../components/downloadCSVBtn/downloadCSVBtn.vue';

export default {
    setup() {
        const usersStore = useUsersStore();
        const userSkillsStore = useUserSkillsStore();
        const teacherAnalyticsStore = useTeacherAnalyticsStore();
        return {
            usersStore,
            userSkillsStore,
            teacherAnalyticsStore
        };
    },
    components: {
        FailedAssessmentsHorizontalBarChart,
        PassedAssessmentsTimelineChart,
        AttemptedAssessmentsTimelineChart,
        DownloadCSVBtn
    },
    data() {
        return {
            studentId: this.$route.params.studentId,
            studentName: null,
            assessmentPasses: [],
            assessmentAttempts: [],
            assessmentPassesDownloadData: [],
            assessmentAttemptsDownloadData: []
            // multipleFails: []
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

        await this.getUserSkillMasteredHistory(this.studentId);
        await this.getAssessmentAttempts();
        this.assessmentPassesDownloadData = this.assessmentPasses.map((e) => {
            return {
                skill: e.name,
                last_visited_date: this.assessmentDate(e.last_visited_date),
                mastered_date: this.assessmentDate(e.mastered_date)
            };
        });

        this.assessmentAttemptsDownloadData = this.assessmentAttempts.map(
            (e) => {
                return {
                    skill: e.name,
                    date: this.assessmentDate(e.date)
                };
            }
        );

        if (this.teacherAnalyticsStore.studentMultipleFails.length == 0) {
            await this.teacherAnalyticsStore.getStudentMultipleFails(
                this.studentId
            );
        }

        this.isLoaded = true;
    },
    methods: {
        async getAssessmentAttempts() {
            fetch(
                `/student-analytics/started-unmastered-assessments/${this.studentId}`
            )
                .then((response) => response.json())
                .then((data) => {
                    this.assessmentAttempts = data.map((e) => {
                        return {
                            ...e,
                            url: `/skills/${e.url}`,
                            // labelName: `${e.rootParent} - ${e.name}`
                            labelName: `${e.name}`
                        };
                    });
                })
                .catch((error) => {
                    console.error('Error fetching last visited skills:', error);
                });
        },
        assessmentDate(date) {
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
        async getUserSkillMasteredHistory(studentId) {
            await this.userSkillsStore.getMasteredSkills(studentId);

            this.assessmentPasses = this.userSkillsStore.masteredSkills.map(
                (e) => {
                    return {
                        ...e,
                        url: `/skills/${e.url}`,
                        labelName: `${e.name}`
                    };
                }
            );
        }
    }
};
</script>

<template>
    <div class="container">
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading">Assessment Status Report</h1>
            <h2 class="secondary-heading h3">{{ studentName }}</h2>
        </span>
        <div>
            <h4 class="secondary-heading pt-2 d-flex justify-content-between">
                Failed multiple times
                <DownloadCSVBtn
                    :data="teacherAnalyticsStore.studentMultipleFails"
                    :fileName="`Assessment Status Report - ${studentName}`"
                    toolTip="Download failed assessments data as CSV"
                />
            </h4>
            <FailedAssessmentsHorizontalBarChart
                v-if="teacherAnalyticsStore.studentMultipleFails.length > 0"
                :data="teacherAnalyticsStore.studentMultipleFails"
                colour="darkred"
                class="mb-5"
            />
            <p v-else>
                This student has not failed any assessments more than once yet.
            </p>
        </div>
        <div>
            <h4 class="secondary-heading pt-2 d-flex justify-content-between">
                Passed
                <DownloadCSVBtn
                    :data="assessmentPassesDownloadData"
                    :fileName="`Passed Assessments - ${studentName}`"
                    toolTip="Download passed assessments data as CSV"
                />
            </h4>
            <PassedAssessmentsTimelineChart
                class="mb-5"
                v-if="assessmentPasses.length > 0"
                :data="assessmentPasses"
            />
            <p v-else>This student has not completed any assessments yet.</p>
        </div>

        <div>
            <h4 class="secondary-heading pt-2 d-flex justify-content-between">
                Attempted
                <DownloadCSVBtn
                    :data="assessmentAttemptsDownloadData"
                    :fileName="`Attempted Assessments - ${studentName}`"
                    toolTip="Download attempted assessments data as CSV"
                />
            </h4>
            <AttemptedAssessmentsTimelineChart
                class="mb-5"
                v-if="assessmentAttempts.length > 0"
                :data="assessmentAttempts"
            />
            <p v-else>This student has not attempted any assessments yet.</p>
        </div>
    </div>
</template>

<style></style>
