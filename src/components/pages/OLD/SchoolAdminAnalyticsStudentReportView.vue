<script>
// Import the stores.
import { useUsersStore } from '../../../stores/UsersStore';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useTeacherAnalyticsStore } from '../../../stores/TeacherAnalyticsStore';
import { useAnalyticsStore } from '../../../stores/AnalyticsStore';
import { useUserSkillsStore } from '../../../stores/UserSkillsStore';
import StudentProgressLineChart from '../../../components/analytics/full-size/students/dashboard/StudentProgressLineChart.vue';
import StudentSkillActivityChart from '../../../components/analytics/full-size/students/StudentSkillActivityChart.vue';
import PassedAssessmentsTimelineChart from '../../../components/analytics/full-size/students/PassedAssessmentsTimelineChart.vue';
import AttemptedAssessmentsTimelineChart from '../../../components/analytics/full-size/students/AttemptedAssessmentsTimelineChart.vue';
import FailedAssessmentsHorizontalBarChart from '../../../components/analytics/full-size/students/FailedAssessmentsHorizontalBarChart.vue';
import StudentDurationPerDayLineChart from '../../../components/analytics/full-size/students/StudentDurationPerDayLineChart.vue';
import StudentAttemptedAssessmentsByRootSubjectHorizontalBarChart from '../../../components/analytics/full-size/students/StudentAttemptedAssessmentsByRootSubjectHorizontalBarChart.vue';
import StudentFailedAssessmentsByRootSubjectHorizontalBarChart from '../../../components/analytics/full-size/students/StudentFailedAssessmentsByRootSubjectHorizontalBarChart.vue';
import StudentPassedAssessmentsByRootSubjectHorizontalBarChart from '../../../components/analytics/full-size/students/StudentPassedAssessmentsByRootSubjectHorizontalBarChart.vue';

export default {
    components: {
        StudentProgressLineChart,
        StudentSkillActivityChart,
        PassedAssessmentsTimelineChart,
        AttemptedAssessmentsTimelineChart,
        FailedAssessmentsHorizontalBarChart,
        StudentDurationPerDayLineChart,
        StudentAttemptedAssessmentsByRootSubjectHorizontalBarChart,
        StudentFailedAssessmentsByRootSubjectHorizontalBarChart,
        StudentPassedAssessmentsByRootSubjectHorizontalBarChart
    },
    setup() {
        const usersStore = useUsersStore();
        const userDetailsStore = useUserDetailsStore();
        const teacherAnalyticsStore = useTeacherAnalyticsStore();
        const userSkillsStore = useUserSkillsStore();
        const analyticsStore = useAnalyticsStore();

        // Run the GET request.
        if (usersStore.users.length < 1) usersStore.getUsers();
        return {
            usersStore,
            userDetailsStore,
            teacherAnalyticsStore,
            userSkillsStore,
            analyticsStore
        };
    },
    data() {
        return {
            userId: this.$route.params.studentId,
            isMobileCheck: window.innerWidth,
            studentProgress: [],
            assessmentPasses: [],
            assessmentAttempts: [],
            skillDurations: [],
            durationsPerDay: [],
            visitedSkills: []
        };
    },

    async created() {
        await this.getStudentDurationPerDay();
        await this.getTenantStudentProgress();
        await this.getAssessmentPasses();
        await this.getAssessmentAttempts();
        if (this.teacherAnalyticsStore.studentMultipleFails.length == 0) {
            await this.teacherAnalyticsStore.getStudentMultipleFails(
                this.userid
            );
        }
        if (this.teacherAnalyticsStore.skillActivities.length == 0) {
            await this.teacherAnalyticsStore.getSkillActivityReport(
                this.userid
            );
        }
        this.teacherAnalyticsStore.skillActivities =
            this.teacherAnalyticsStore.skillActivities.map((skill) => {
                return {
                    ...skill,
                    formattedQuantity: this.millisToMinutesAndSeconds(
                        skill.quantity
                    )
                };
            });
        await this.analyticsStore.getStudentFailedAssessmentsBySubject(
            this.userid
        );
        await this.analyticsStore.getStudentPassedAssessmentsBySubject(
            this.userid
        );
        await this.analyticsStore.getStudentAttemptedAssessmentsBySubject(
            this.userid
        );
    },
    computed: {
        studentName() {
            return `${this.$parent.user.username}`.trim();
        }
    },
    methods: {
        async getTenantStudentProgress() {
            fetch(`/student-analytics/student-progress/${this.userId}`)
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
        },
        async getAssessmentAttempts() {
            fetch(
                `/student-analytics/started-unmastered-assessments/${this.userId}`
            )
                .then((response) => response.json())
                .then((data) => {
                    this.assessmentAttempts = data.map((e) => {
                        return {
                            ...e,
                            url: `/skills/${e.url}`,
                            labelName: `${e.name}`
                        };
                    });
                })
                .catch((error) => {
                    console.error('Error fetching last visited skills:', error);
                });
        },
        async getAssessmentPasses() {
            await this.userSkillsStore.getMasteredSkills(this.userId);

            this.assessmentPasses = this.userSkillsStore.masteredSkills.map(
                (e) => {
                    return {
                        ...e,
                        url: `/skills/${e.url}`,
                        labelName: `${e.name}`
                    };
                }
            );
        },
        async getStudentDurationPerDay() {
            fetch(`/student-analytics/student-duration-per-day/${this.userId}`)
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].formattedQuantity =
                            data[i].quantity / (1000 * 60);
                        data[i].date = new Date(data[i].date);
                    }
                    data.sort((a, b) => a.date - b.date);
                    this.durationsPerDay = data;
                })
                .catch((error) => {
                    console.error(
                        'Error fetching student duration per day:',
                        error
                    );
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
    <div class="container bg-light">
        <div class="d-flex justify-content-between">
            <h1 class="heading">Student Report</h1>
            <button class="btn me-1" @click="$parent.restartTutorial">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 192 512"
                    width="20"
                    height="20"
                    class="primary-icon"
                >
                    <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                    <path
                        d="M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 224 32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0 0-192-32 0c-17.7 0-32-14.3-32-32z"
                    />
                </svg>
            </button>
        </div>

        <h2 class="secondary-heading">Engagement</h2>
        <h4>Total time on platform</h4>
        <StudentDurationPerDayLineChart
            v-if="durationsPerDay.length > 1"
            :data="durationsPerDay"
        />
        <p v-else>There is no data to show yet.</p>
        <hr class="mt-5 mb-5" />

        <h4 class="mt-4">Skills visited</h4>
        <StudentSkillActivityChart
            v-if="teacherAnalyticsStore.skillActivities.length > 0"
            :data="teacherAnalyticsStore.skillActivities"
        />
        <p v-else>No skills visited by this student.</p>
        <hr class="mt-5 mb-5" />

        <h2 class="secondary-heading mt-5">Academics</h2>
        <h4>Skill mastery progress</h4>
        <StudentProgressLineChart
            v-if="studentProgress.length > 0"
            :data="studentProgress"
            colour="#5f31dd"
        />
        <p v-else>No data to show yet.</p>
        <hr class="mt-5 mb-5" />

        <h3 class="secondary-heading mt-4">By subject</h3>
        <h4 class="">Failed more than once</h4>
        <StudentFailedAssessmentsByRootSubjectHorizontalBarChart
            v-if="
                analyticsStore.studentRootSubjectsFailedAssessments.length > 0
            "
            :data="analyticsStore.studentRootSubjectsFailedAssessments"
            colour="darkred"
            class="mb-5"
        />
        <p v-else>No data yet</p>
        <hr class="mt-5 mb-5" />

        <h4 class="">Passed</h4>
        <StudentPassedAssessmentsByRootSubjectHorizontalBarChart
            v-if="
                analyticsStore.studentRootSubjectsPassedAssessments.length > 0
            "
            :data="analyticsStore.studentRootSubjectsPassedAssessments"
            colour="darkgreen"
            class="mb-5"
        />
        <p v-else>No data yet</p>
        <hr class="mt-5 mb-5" />

        <h4 class="">Attempted</h4>
        <StudentAttemptedAssessmentsByRootSubjectHorizontalBarChart
            v-if="
                analyticsStore.studentRootSubjectsAttemptedAssessments.length >
                0
            "
            :data="analyticsStore.studentRootSubjectsAttemptedAssessments"
            colour="darkblue"
            class="mb-5"
        />
        <p v-else>No data yet</p>
        <hr class="mt-5 mb-5" />

        <h3 class="secondary-heading mt-4">By skill</h3>
        <h4>Assessments failed</h4>
        <FailedAssessmentsHorizontalBarChart
            v-if="teacherAnalyticsStore.studentMultipleFails.length > 0"
            :data="teacherAnalyticsStore.studentMultipleFails"
            colour="darkred"
        />
        <p v-else>
            This student has not failed any assessments more than once yet.
        </p>
        <hr class="mt-5 mb-5" />

        <h4 class="mt-4">Assessments passed</h4>
        <PassedAssessmentsTimelineChart
            v-if="assessmentPasses.length > 0"
            :data="assessmentPasses"
        />
        <p v-else>This student has not completed any assessments yet.</p>
        <hr class="mt-5 mb-5" />

        <h4 class="mt-4">Assessments attempted</h4>
        <AttemptedAssessmentsTimelineChart
            class="mb-5"
            v-if="assessmentAttempts.length > 0"
            :data="assessmentAttempts"
        />
        <p v-else class="mb-5">
            This student has attempted any assessments yet.
        </p>
    </div>
</template>

<style scoped>
.fit-content {
    max-width: fit-content;
}

.user-input-information {
    background-color: #fcfcfd !important;
    color: black;
    font-family: 'Poppins' sans-serif;
    font-weight: 400;
    font-size: 1rem;
    padding: 10px, 14px, 10px, 14px;
}

.form-label {
    color: black;
    font-size: 0.875rem;
    font-weight: 600;
    font-family: 'Poppins' sans-serif;
}

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
}

.green-btn > svg {
    margin-left: 15px;
}

.green-btn:hover {
    background-color: #2ca695;
}

#close-popup-btn {
    border-radius: 20px;
    background-color: #36c1af;
    padding: 7px 10px;
}

/* The Warning Modal */
.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 1;
    /* Sit on top */
    left: 0;
    top: 0;
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    overflow: auto;
    /* Enable scroll if needed */
    background-color: rgb(0, 0, 0);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
}

.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 300px;
    /* Could be more or less, depending on screen size */
}

/* Mobile */
@media (max-width: 480px) {
    #user-information {
        border-radius: 10px;
        padding-bottom: 0px;
    }
}

/* Tablets */
@media (min-width: 481px) and (max-width: 1024px) {
    #user-information {
        padding-left: 10px;
        padding-right: 10px;
        padding-bottom: 15px;
        margin-right: 10px;
        margin-bottom: 10px;
    }

    .green-btn {
        margin-left: 10px !important;
        margin-right: auto !important;
    }
}

@media (min-width: 1025px) {
    #user-information {
        margin-left: auto;
        margin-right: auto;
    }
}
</style>
