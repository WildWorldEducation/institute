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
import TenantAssessmentsAttemptedHorizontalBarChart from '../../../components/teacher-analytics/tenants/TenantAssessmentsAttemptedHorizontalBarChart.vue';

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
        TenantPassedAssessmentsHorizontalBarChart,
        TenantAssessmentsAttemptedHorizontalBarChart
    },
    data() {
        return {
            chosenPage: 1,
            tenantId: this.$route.params.tenantId,
            avgTokensToMasterSkills: [],
            totalTokensPerSkill: [],
            totalTokensPerDay: [],
            avgTimeOnSkills: [],
            percentageStudentsMasteredOneSkill: [],
            tenantProgress: [],
            studentDurationsPerSkill: [],
            numSkillsPassedPerNumStudents: [],
            passedAssessments: [],
            attemptedAssessments: [],
            isDataWeekly: false
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
        await this.getTenantAssessmentsAttempted();
        await this.getTotalTokensPerDay();
    },
    methods: {
        // Engagement -----------------------
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

        // Academic Performance
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
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.passedAssessments = [];
            }
        },
        async getTenantAssessmentsAttempted() {
            try {
                const response = await fetch(
                    `/student-analytics/attempted-assessments/tenant/${this.tenantId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                this.attemptedAssessments = await response.json();
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.attemptedAssessments = [];
            }
        },

        // Resource usage
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
        async getTotalTokensPerDay() {
            fetch(`/student-analytics/tenant-tokens-per-day/${this.tenantId}`)
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].date = new Date(data[i].date);
                    }
                    data.sort((a, b) => a.date - b.date);
                    this.totalTokensPerDay = data;
                })
                .catch((error) => {
                    console.error('Error fetching student progress:', error);
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
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading">School Admin Report</h1>
        </span>

        <!-- Main Tab Navigation -->
        <div class="nav nav-tabs mb-4 d-flex flex-wrap">
            <button
                :class="[
                    'btn',
                    'nav-link',
                    'tab-btn',
                    'flex-fill',
                    'flex-sm-grow-0',
                    'me-1',
                    { active: chosenPage === 1 }
                ]"
                @click="chosenPage = 1"
            >
                <span class="d-inline">Engagement</span>
            </button>
            <button
                :class="[
                    'btn',
                    'nav-link',
                    'tab-btn',
                    'flex-fill',
                    'flex-sm-grow-0',
                    'me-1',
                    { active: chosenPage === 2 }
                ]"
                @click="chosenPage = 2"
            >
                <span class="d-inline">Academic Performance</span>
            </button>
            <button
                :class="[
                    'btn',
                    'nav-link',
                    'tab-btn',
                    'flex-fill',
                    'flex-sm-grow-0',
                    { active: chosenPage === 3 }
                ]"
                @click="chosenPage = 3"
            >
                <span class="d-inline">Resource Usage</span>
            </button>
        </div>
        <div v-if="chosenPage == 1">
            <!-- Filter Buttons -->
            <div
                class="btn-group d-flex d-sm-inline-flex mt-2 mb-4"
                role="group"
            >
                <input
                    type="radio"
                    class="btn-check"
                    name="timeFilter1"
                    id="total1"
                    checked
                />
                <label
                    class="btn btn-outline-dark btn-sm filter-btn"
                    for="total1"
                    >Total</label
                >
                <input
                    type="radio"
                    class="btn-check"
                    name="timeFilter1"
                    id="week1"
                />
                <label
                    class="btn btn-outline-dark btn-sm filter-btn"
                    for="week1"
                    >This week</label
                >
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
        </div>

        <div v-else-if="chosenPage == 2">
            <!-- Filter Buttons -->
            <div
                class="btn-group d-flex d-sm-inline-flex mt-2 mb-4"
                role="group"
            >
                <input
                    type="radio"
                    class="btn-check"
                    name="timeFilter2"
                    id="total2"
                    checked
                />
                <label
                    class="btn btn-outline-dark btn-sm filter-btn"
                    for="total2"
                    >Total</label
                >
                <input
                    type="radio"
                    class="btn-check"
                    name="timeFilter2"
                    id="week2"
                />
                <label
                    class="btn btn-outline-dark btn-sm filter-btn"
                    for="week2"
                    >This week</label
                >
            </div>
            <h4>Number of total mastered skills growth over time</h4>
            <TenantProgressLineChart
                v-if="tenantProgress.length > 0"
                :data="tenantProgress"
                colour="#5f31dd"
                class="mb-5"
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

            <h4>
                Number of students who have attempted a specific skill
                assessment
            </h4>
            <TenantAssessmentsAttemptedHorizontalBarChart
                v-if="attemptedAssessments.length > 0"
                :data="attemptedAssessments"
                colour="#5f31dd"
            />
            <p v-else>No data yet</p>

            <h3 class="mt-5">Performance by Root Subject</h3>
            <p>
                <em>number of fails per root subject</em>
            </p>
            <p>
                <em>will have to use recursive function</em>
            </p>
        </div>

        <div v-else-if="chosenPage == 3">
            <!-- Filter Buttons -->
            <div
                class="btn-group d-flex d-sm-inline-flex mt-2 mb-4"
                role="group"
            >
                <input
                    type="radio"
                    class="btn-check"
                    name="timeFilter3"
                    id="total3"
                    checked
                />
                <label
                    class="btn btn-outline-dark btn-sm filter-btn"
                    for="total3"
                    >Total</label
                >
                <input
                    type="radio"
                    class="btn-check"
                    name="timeFilter3"
                    id="week3"
                />
                <label
                    class="btn btn-outline-dark btn-sm filter-btn"
                    for="week3"
                    >This week</label
                >
            </div>
            <h4>Average number of tokens spent to master a skill</h4>
            <TenantAvgTokensToMasterSkillsHorizontalBarChart
                v-if="avgTokensToMasterSkills.length > 0"
                :data="avgTokensToMasterSkills"
                colour="darkgreen"
            />
            <p v-else>No data yet</p>

            <h4 class="mt-5">Number of tokens per skill</h4>
            <TenantTokensPerSkillHorizontalBarChart
                v-if="totalTokensPerSkill.length > 0"
                :data="totalTokensPerSkill"
                colour="#5f31dd"
            />
            <p v-else>No data yet</p>

            <h4 class="mt-5">Tokens spent per day</h4>
            <TenantTokensPerDayLineChart
                v-if="totalTokensPerDay.length > 0"
                :data="totalTokensPerDay"
                colour="#5f31dd"
            />
            <p v-else>No data yet</p>
            <p>
                <em
                    >Please note recording of tokens per skill stops after
                    student mastery of that skill</em
                >
            </p>
        </div>
    </div>
</template>

<style scoped>
/* Main Tab Styling */
.tab-btn {
    background-color: #f8f9fa;
    color: #6c757d;
    border: 1px solid #dee2e6;
    border-bottom-color: transparent;
    font-weight: 500;
    opacity: 0.8;
    transition: all 0.3s ease;
    position: relative;
}

.tab-btn:hover {
    background-color: #e9ecef;
    color: #495057;
    opacity: 1;
    transform: translateY(-1px);
    /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); */
}

.tab-btn.active {
    background-color: var(--primary-color);
    color: var(--primary-contrast-color);
    border-color: var(--primary-color) var(--primary-color) #fff;
    opacity: 1;
    /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25); */
}

/* Filter Button Styling */
.filter-btn {
    transition: all 0.2s ease;
}

.filter-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-check:checked + .filter-btn {
    background-color: #495057;
    border-color: #495057;
    color: white;
    box-shadow: 0 2px 6px rgba(73, 80, 87, 0.25);
}

/* Touch Device Optimizations */
@media (hover: none) and (pointer: coarse) {
    .tab-btn:hover,
    .filter-btn:hover {
        transform: none;
        box-shadow: none;
    }

    .tab-btn,
    .filter-btn {
        min-height: 44px;
    }
}

/* Mobile Responsive */
@media (max-width: 576px) {
    .nav.nav-tabs {
        flex-direction: column;
        border-bottom: none;
    }

    .tab-btn {
        width: 100%;
        margin-bottom: 0.25rem;
        border-radius: 0.5rem;
        border-bottom-color: #dee2e6;
        text-align: center;
    }

    .tab-btn.active {
        border-color: var(--primary-color);
    }
}
</style>
