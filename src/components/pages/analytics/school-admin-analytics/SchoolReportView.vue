<script>
import TenantAvgTokensToMasterSkillsHorizontalBarChart from '../../../components/teacher-analytics/tenants/TenantAvgTokensToMasterSkillsHorizontalBarChart.vue';
import TenantAvgInteractionTimePerSkillHorizontalBarChart from '../../../components/teacher-analytics/tenants/TenantAvgInteractionTimePerSkillHorizontalBarChart.vue';
import TenantPercentageStudentsMasteredAtLeastOneSkillPieChart from '../../../components/teacher-analytics/tenants/TenantPercentageStudentsMasteredAtLeastOneSkillPieChart.vue';
import TenantProgressLineChart from '../../../components/teacher-analytics/tenants/TenantProgressLineChart.vue';
import TenantDurationPerDayLineChart from '../../../components/teacher-analytics/tenants/TenantDurationPerDayLineChart.vue';
import TenantTokensPerSkillHorizontalBarChart from '../../../components/teacher-analytics/tenants/TenantTokensPerSkillHorizontalBarChart.vue';
import TenantTokensPerDayLineChart from '../../../components/teacher-analytics/tenants/TenantTokensPerDayLineChart.vue';
import TenantNumSkillsPassedPerNumStudentsHorizontalBarChart from '../../../components/teacher-analytics/tenants/TenantNumSkillsPassedPerNumStudentsHorizontalBarChart.vue';
import TenantPassedAssessmentsHorizontalBarChart from '../../../components/teacher-analytics/tenants/TenantPassedAssessmentsHorizontalBarChart.vue';

export default {
    setup() {
        return {};
    },
    components: {
        TenantAvgTokensToMasterSkillsHorizontalBarChart,
        TenantTokensPerSkillHorizontalBarChart,
        TenantAvgInteractionTimePerSkillHorizontalBarChart,
        TenantPercentageStudentsMasteredAtLeastOneSkillPieChart,
        TenantProgressLineChart,
        TenantDurationPerDayLineChart,
        TenantTokensPerDayLineChart,
        TenantNumSkillsPassedPerNumStudentsHorizontalBarChart,
        TenantPassedAssessmentsHorizontalBarChart
    },
    data() {
        return {
            chosenPage: 1,
            tenantId: this.$route.params.tenantId,
            avgTokensToMasterSkills: [],
            totalTokensPerSkill: [],
            //totalTokensPerDay: [],
            avgTimeOnSkills: [],
            percentageStudentsMasteredOneSkill: [],
            tenantProgress: [],
            studentDurationsPerSkill: [],
            numSkillsPassedPerNumStudents: [],
            passedAssessments: []
        };
    },
    async created() {
        await this.getAvgTokensToMasterSkills();
        await this.getTotalTokensPerSkill();
        await this.getAvgTimeOnSkills();
        await this.getPercentageStudentsMasteredOneSkill();
        await this.getTenantProgress();
        await this.getTenantDuration();
        await this.getNumSkillsPassedPerNumStudents();
        await this.getPassedAssessments();
        // await this.getTotalTokensPerDay();
    },
    methods: {
        async getAvgTokensToMasterSkills() {
            try {
                const response = await fetch(
                    `/student-analytics/avg-tokens-to-master-skills/tenant/${this.tenantId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                this.avgTokensToMasterSkills = Array.isArray(data) ? data : [];
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.avgTokensToMasterSkills = [];
            }
        },
        async getTotalTokensPerSkill() {
            try {
                const response = await fetch(
                    `/student-analytics/total-tokens-per-skill/tenant/${this.tenantId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                this.totalTokensPerSkill = Array.isArray(data) ? data : [];
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.totalTokensPerSkill = [];
            }
        },
        // async getTotalTokensPerDay() {
        //     fetch(`/student-analytics/tenant-tokens-per-day/${this.tenantId}`)
        //         .then((response) => response.json())
        //         .then((data) => {
        //             for (let i = 0; i < data.length; i++) {
        //                 data[i].date = new Date(data[i].date);
        //                 data[i].formattedQuantity = data[i].quantity / 1000;
        //             }
        //             data.sort((a, b) => a.date - b.date);
        //             this.totalTokensPerDay = data;
        //             console.log(this.totalTokensPerDay);
        //         })
        //         .catch((error) => {
        //             console.error('Error fetching student progress:', error);
        //         });
        // },
        async getAvgTimeOnSkills() {
            try {
                const response = await fetch(
                    `/student-analytics/avg-times-on-skills/tenant/${this.tenantId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                this.avgTimeOnSkills = Array.isArray(data) ? data : [];
                for (let i = 0; i < this.avgTimeOnSkills.length; i++) {
                    this.avgTimeOnSkills[i].formattedQuantity =
                        this.millisToMinutesAndSeconds(
                            this.avgTimeOnSkills[i].quantity
                        );
                }
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.avgTimeOnSkills = [];
            }
        },
        async getPercentageStudentsMasteredOneSkill() {
            try {
                const response = await fetch(
                    `/student-analytics/percentage-students-mastered-one-skill/tenant/${this.tenantId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                this.percentageStudentsMasteredOneSkill = await response.json();
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.percentageStudentsMasteredOneSkill = [];
            }
        },
        async getTenantProgress() {
            fetch(`/student-analytics/tenant-progress/${this.tenantId}`)
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].date = new Date(data[i].date);
                    }
                    data.sort((a, b) => a.date - b.date);
                    this.tenantProgress = data;
                })
                .catch((error) => {
                    console.error('Error fetching student progress:', error);
                });
        },
        async getTenantDuration() {
            fetch(`/student-analytics/tenant-duration-per-day/${this.tenantId}`)
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].date = new Date(data[i].date);
                        data[i].formattedQuantity = data[i].quantity / 1000;
                    }
                    data.sort((a, b) => a.date - b.date);
                    this.studentDurationsPerSkill = data;
                })
                .catch((error) => {
                    console.error('Error fetching student progress:', error);
                });
        },
        async getNumSkillsPassedPerNumStudents() {
            try {
                const response = await fetch(
                    `/student-analytics/num-skills-passed-per-num-students/${this.tenantId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                this.numSkillsPassedPerNumStudents = await response.json();
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.numSkillsPassedPerNumStudents = [];
            }
        },
        async getPassedAssessments() {
            try {
                const response = await fetch(
                    `/student-analytics/passed-assessments/tenant/${this.tenantId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                this.passedAssessments = await response.json();
                console.log(this.numSkillsPassedPerNumStudents);
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.passedAssessments = [];
            }
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
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading">School Admin Report</h1>
        </span>
        <div>
            <button class="btn primary-btn me-1" @click="chosenPage = 1">
                Engagement
            </button>
            <button class="btn primary-btn me-1" @click="chosenPage = 2">
                Academic Performance
            </button>
            <button class="btn primary-btn" @click="chosenPage = 3">
                Resource Usage
            </button>
        </div>
        <div v-if="chosenPage == 1">
            <div class="mt-2 mb-4">
                <button class="btn btn-dark me-1">Total</button>
                <button class="btn btn-dark me-1">This week</button>
            </div>
            <h4>Average interaction time per skill (minutes)</h4>
            <TenantAvgInteractionTimePerSkillHorizontalBarChart
                v-if="avgTimeOnSkills.length > 0"
                :data="avgTimeOnSkills"
                colour="purple"
                class="mb-5"
            />
            <p v-else>No data yet</p>
            <h4>Time spent on platform per day</h4>
            <TenantDurationPerDayLineChart
                v-if="studentDurationsPerSkill.length > 0"
                :data="studentDurationsPerSkill"
                colour="#5f31dd"
                class="mb-5"
            />
            <p v-else>No data yet</p>

            <h4>
                Percentage of students who completed at least one skill
                (cumulative)
            </h4>
            <TenantPercentageStudentsMasteredAtLeastOneSkillPieChart
                v-if="percentageStudentsMasteredOneSkill.length > 0"
                :data="percentageStudentsMasteredOneSkill"
            />
            <p v-else>No data yet</p>
            <p>add total tutoring time</p>
        </div>

        <div v-else-if="chosenPage == 2">
            <div class="mt-2 mb-4">
                <button class="btn btn-dark me-1">Total</button>
                <button class="btn btn-dark me-1">This week</button>
            </div>
            <h3>Growth</h3>
            <TenantProgressLineChart
                v-if="tenantProgress.length > 0"
                :data="tenantProgress"
                colour="#5f31dd"
                class="mb-5 mt-5"
            />
            <p v-else>No data yet</p>

            <h3>Assessment Completion</h3>
            <h4>
                Number of students who have passed a specific number of skills
            </h4>
            <TenantNumSkillsPassedPerNumStudentsHorizontalBarChart
                v-if="numSkillsPassedPerNumStudents.length > 0"
                :data="numSkillsPassedPerNumStudents"
                colour="darkgreen"
                class="mb-5"
            />
            <p v-else>No data yet</p>
            <h4>Number of students who have passed a specific skill</h4>
            <TenantPassedAssessmentsHorizontalBarChart
                v-if="passedAssessments.length > 0"
                :data="passedAssessments"
                colour="darkgreen"
                class="mb-5"
            />
            <p v-else>No data yet</p>
            <h3>Performance by Root Subject</h3>
            <p>
                <em>number of fails per root subject</em>
            </p>
            <p>
                <em>will have to use recursive function</em>
            </p>
        </div>

        <div v-else-if="chosenPage == 3">
            <div class="mt-2 mb-4">
                <button class="btn btn-dark me-1">Total</button>
                <button class="btn btn-dark me-1">This week</button>
            </div>
            <h4 class="mt-5">
                Average number of tokens spent to master a skill
            </h4>
            <TenantAvgTokensToMasterSkillsHorizontalBarChart
                v-if="avgTokensToMasterSkills.length > 0"
                :data="avgTokensToMasterSkills"
                colour="darkgreen"
            />
            <p v-else>No data yet</p>

            <h4 class="mt-5">Total number of tokens spent per skill</h4>
            <TenantTokensPerSkillHorizontalBarChart
                v-if="totalTokensPerSkill.length > 0"
                :data="totalTokensPerSkill"
                colour="#5f31dd"
            />
            <p v-else>No data yet</p>
            <p><em>please note recording cut off usage after mastery</em></p>

            <h4 class="mt-5">Number of tokens per day</h4>
            <p><em>need to record this data first</em></p>
            <!-- <TenantTokensPerSkillHorizontalBarChart
                v-if="totalTokensPerDay.length > 0"
                :data="totalTokensPerDay"
                colour="#5f31dd"
            />
            <p v-else>No data yet</p> -->
        </div>
    </div>
</template>

<style></style>
