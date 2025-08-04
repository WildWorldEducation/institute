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
import TenantFailedAssessmentsHorizontalBarChart from '../../../components/teacher-analytics/tenants/TenantFailedAssessmentsHorizontalBarChart.vue';
import TenantFailedAssessmentsByRootSubjectHorizontalBarChart from '../../../components/teacher-analytics/tenants/TenantFailedAssessmentsByRootSubjectHorizontalBarChart.vue';
import TenantPassedAssessmentsByRootSubjectHorizontalBarChart from '../../../components/teacher-analytics/tenants/TenantPassedAssessmentsByRootSubjectHorizontalBarChart.vue';
import TenantAttemptedAssessmentsByRootSubjectHorizontalBarChart from '../../../components/teacher-analytics/tenants/TenantAttemptedAssessmentsByRootSubjectHorizontalBarChart.vue';

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
        TenantAssessmentsAttemptedHorizontalBarChart,
        TenantFailedAssessmentsHorizontalBarChart,
        TenantFailedAssessmentsByRootSubjectHorizontalBarChart,
        TenantPassedAssessmentsByRootSubjectHorizontalBarChart,
        TenantAttemptedAssessmentsByRootSubjectHorizontalBarChart
    },
    data() {
        return {
            chosenPage: 1,
            tenantId: this.$route.params.tenantId,
            // Engagement -----------------------
            durationPerDay: [],
            avgTimeOnSkills: [],
            percentageStudentsMasteredOneSkill: [],
            // Academic performance
            tenantProgress: [],
            numSkillsPassedPerNumStudents: [],
            passedAssessments: [],
            failedAssessments: [],
            rootSubjectsFailedAssessments: [],
            rootSubjectsPassedAssessments: [],
            rootSubjectsAttemptedAssessments: [],
            attemptedAssessments: [],
            // Resources
            avgTokensToMasterSkills: [],
            totalTokensPerSkill: [],
            totalTokensPerDay: [],
            isDataLastWeek: false
        };
    },
    async created() {
        // Engagement -----------------------
        await this.getAvgTimeOnSkills();
        await this.getTenantDuration();
        await this.getPercentageStudentsMasteredOneSkill();
        // Academic Performance
        await this.getTenantProgress();        
        await this.getNumSkillsPassedPerNumStudents();
        await this.getPassedAssessments();
        await this.getFailedAssessments();
        await this.getFailedAssessmentsBySubject();
        await this.getPassedAssessmentsBySubject();
        await this.getAttemptedAssessmentsBySubject();
        await this.getTenantAssessmentsAttempted();
        // Resource usage
        await this.getAvgTokensToMasterSkills();
        await this.getTotalTokensPerSkill();        
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
                    this.avgTimeOnSkills[i].minutes =
                        this.millisToMinutesAndSeconds(
                            this.avgTimeOnSkills[i].milliseconds
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
            console.log("test")
            this.durationPerDay = []
            fetch(`/student-analytics/tenant-duration-per-day/${this.tenantId}`)
                .then((response) => response.json())
                .then(async (data) => {
                
                    for (let i = 0; i < data.length; i++) {                        
                        const now = new Date();
                        const oneWeekAgo = new Date();
                        oneWeekAgo.setDate(now.getDate() - 7); // Set to 7 days before 'now'                       
                        // Compare the timestamp of the date to check with the timestamp of one week ago
                        data[i].date = new Date(data[i].date);
                        data[i].minutes =
                                    data[i].milliseconds / (1000 * 60);
                        if (this.isDataLastWeek)
                        {
                            if(data[i].date >= oneWeekAgo)
                            {                              
                                this.durationPerDay.push(data[i])                         
                            }                        
                        }
                        else{
                            this.durationPerDay.push(data[i])                         
                        }
                    }
                     this.durationPerDay.sort((a, b) => a.date - b.date);  
                     console.log(this.durationPerDay)             
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
        async getFailedAssessments() {
            try {
                const response = await fetch(
                    `/student-analytics/failed-assessments/tenant/${this.tenantId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                this.failedAssessments = await response.json();
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.failedAssessments = [];
            }
        },
        async getFailedAssessmentsBySubject() {
            try {
                const response = await fetch(
                    `/student-analytics/failed-assessments-by-subject/tenant/${this.tenantId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                this.rootSubjectsFailedAssessments = await response.json();               
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.rootSubjectsFailedAssessments = [];
            }
        },
        async getPassedAssessmentsBySubject() {
            try {
                const response = await fetch(
                    `/student-analytics/passed-assessments-by-subject/tenant/${this.tenantId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                this.rootSubjectsPassedAssessments = await response.json();
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.rootSubjectsPassedAssessments = [];
            }
        },
        async getAttemptedAssessmentsBySubject() {
            try {
                const response = await fetch(
                    `/student-analytics/attempted-assessments-by-subject/tenant/${this.tenantId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                this.rootSubjectsAttemptedAssessments = await response.json();
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.rootSubjectsAttemptedAssessments = [];
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

        // Utilities
        millisToMinutesAndSeconds(millis) {
            var minutes = Math.floor(millis / 60000);
            var seconds = ((millis % 60000) / 1000).toFixed(0);
            return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        },
        downloadData(data, name){               
            const headers = Object.keys(data[0]);
            console.log(headers)
            const csvRows = [];

            // Header row
            csvRows.push(headers.join(','));

            // Data rows
            for (const row of data) {
            const values = headers.map(h => {
                const val = row[h];
                return `"${String(val).replace(/"/g, '""')}"`; // Escape quotes
            });
            csvRows.push(values.join(','));
            }

            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = name + '.csv';
            link.click();  
        },
        async toggleWeeklyCumulativeData(){
            this.isDataLastWeek = !this.isDataLastWeek
            await this.getTenantDuration()
        },
        // async checkIfDateMoreThanWeekAgo(dateToCheck) {
        //     const now = new Date();
        //     const oneWeekAgo = new Date();
        //     oneWeekAgo.setDate(now.getDate() - 7); // Set to 7 days before 'now'                       
        //     console.log(dateToCheck)
        //     console.log(oneWeekAgo)
        //     console.log(dateToCheck < oneWeekAgo)
        //     // Compare the timestamp of the date to check with the timestamp of one week ago
        //     return dateToCheck < oneWeekAgo;
        // }
    }
};
</script>

<template>
    <div class="container">
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading">School Admin Report</h1>
        </span>

        <!-- Main Tab Navigation -->
        <div class="mb-4">
            <span class="nav nav-tabs flex-wrap d-flex">
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
            </span>
        </div>
        <div v-if="chosenPage == 1">
            <!-- Filter Buttons -->
            <!-- <div
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
            </div> -->
            <h4 class="d-flex justify-content-between">Time spent on platform per day 
                <span>
                <button v-if="!isDataLastWeek" @click="toggleWeeklyCumulativeData" class="btn">Last week</button>
                <button v-else @click="toggleWeeklyCumulativeData" class="btn">Cumulative</button>
                <button 
                    class="btn"
                    @click="downloadData(durationPerDay, 'Time-per-day')">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 384 512"
                        width="18"
                        height="18">
                        <!-- Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --> <path d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"/>
                    </svg>
                </button>
                </span>
            </h4>
            <TenantDurationPerDayLineChart
                v-if="durationPerDay.length > 0"
                :data="durationPerDay"
                colour="#5f31dd"
                class="mb-5"
            />
            <p v-else>No data yet</p>            
            
            <h4 class="d-flex justify-content-between">Average interaction time per skill (minutes)
                <button 
                    class="btn"
                    @click="downloadData(avgTimeOnSkills, 'Avg-time-per-skill')">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 384 512"
                        width="18"
                        height="18">
                        <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --> <path d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"/>
                    </svg>
            </button>
            </h4>
            <TenantAvgInteractionTimePerSkillHorizontalBarChart
                v-if="avgTimeOnSkills.length > 0"
                :data="avgTimeOnSkills"
                colour="purple"
                class="mb-5"
            />
            <p v-else>No data yet</p>            
            
            <h4 class="d-flex justify-content-between">Percentage of students who completed at least one skill
                (cumulative)
                <button 
                    class="btn"
                    @click="downloadData(percentageStudentsMasteredOneSkill, 'Percentage-students-completed-one-skill')">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 384 512"
                        width="18"
                        height="18">
                        <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --> <path d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"/>
                    </svg>
                </button> 
            </h4>
            <TenantPercentageStudentsMasteredAtLeastOneSkillPieChart
                v-if="percentageStudentsMasteredOneSkill.length > 0"
                :data="percentageStudentsMasteredOneSkill"
                class="mb-5"
            />
            <p v-else class="mb-5">No data yet</p>
        </div>

        <div v-else-if="chosenPage == 2">
            <!-- Filter Buttons -->
            <!-- <div
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
            </div> -->
            
            <h4 class="d-flex justify-content-between">Skill mastery progress
                <button 
                    class="btn"
                    @click="downloadData(tenantProgress, 'Progress')">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 384 512"
                        width="18"
                        height="18">
                        <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --> <path d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"/>
                    </svg>
                </button> 
            </h4>
            <TenantProgressLineChart
                v-if="tenantProgress.length > 0"
                :data="tenantProgress"
                colour="#5f31dd"
                class="mb-5"
            />
            <p v-else>No data yet</p>

            <h3 class="secondary-heading mt-5">Performance by Subject</h3>            
            <h4 class="d-flex justify-content-between">Failed more than once
                <button 
                    class="btn"
                    @click="downloadData(rootSubjectsFailedAssessments, 'Subjects-failed')">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 384 512"
                        width="18"
                        height="18">
                        <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --> <path d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"/>
                    </svg>
                </button> 
            </h4>
            <TenantFailedAssessmentsByRootSubjectHorizontalBarChart
                v-if="rootSubjectsFailedAssessments.length > 0"
                :data="rootSubjectsFailedAssessments"
                colour="darkred"
                class="mb-5"
            />
            <p v-else>No data yet</p>
            
            <h4 class="d-flex justify-content-between">Passed
                <button 
                    class="btn"
                    @click="downloadData(rootSubjectsPassedAssessments, 'Subjects-passed')">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 384 512"
                        width="18"
                        height="18">
                        <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --> <path d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"/>
                    </svg>
                </button> 
            </h4>
            <TenantPassedAssessmentsByRootSubjectHorizontalBarChart
                v-if="rootSubjectsPassedAssessments.length > 0"
                :data="rootSubjectsPassedAssessments"
                colour="darkgreen"
                class="mb-5"
            />
            <p v-else>No data yet</p>
          
            <h4 class="d-flex justify-content-between">Attempted
                <button 
                    class="btn"
                    @click="downloadData(rootSubjectsAttemptedAssessments, 'Subjects-attempted')">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 384 512"
                        width="18"
                        height="18">
                        <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --> <path d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"/>
                    </svg>
                </button> 
            </h4>
            <TenantAttemptedAssessmentsByRootSubjectHorizontalBarChart
                v-if="rootSubjectsAttemptedAssessments.length > 0"
                :data="rootSubjectsAttemptedAssessments"
                colour="darkblue"
                class="mb-5"
            />
            <p v-else>No data yet</p>

            <h3 class="secondary-heading">Assessment Completion</h3>
            <h4 class="d-flex justify-content-between">Number of students who have passed a specific number of skills
                <button 
                    class="btn"
                    @click="downloadData(numSkillsPassedPerNumStudents, 'Number-skills-passed-per-number-of-students')">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 384 512"
                        width="18"
                        height="18">
                        <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --> <path d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"/>
                    </svg>
                </button> 
            </h4>
            <TenantNumSkillsPassedPerNumStudentsHorizontalBarChart
                v-if="numSkillsPassedPerNumStudents.length > 0"
                :data="numSkillsPassedPerNumStudents"
                colour="darkgreen"
                class="mb-5"
            />
            <p v-else>No data yet</p>
            
            <h4 class="d-flex justify-content-between">Number of students who have passed a specific skill
                <button 
                    class="btn"
                    @click="downloadData(passedAssessments, 'Assessments-passed')">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 384 512"
                        width="18"
                        height="18">
                        <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --> <path d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"/>
                    </svg>
                </button> 
            </h4>
            <TenantPassedAssessmentsHorizontalBarChart
                v-if="passedAssessments.length > 0"
                :data="passedAssessments"
                colour="darkgreen"
                class="mb-5"
            />
            <p v-else>No data yet</p>
            
            <h4 class="d-flex justify-content-between">Number of students who have attempted a specific skill
                assessment
                <button 
                    class="btn"
                    @click="downloadData(attemptedAssessments, 'Assessments-attempted')">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 384 512"
                        width="18"
                        height="18">
                        <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --> <path d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"/>
                    </svg>
                </button> 
            </h4>
            <TenantAssessmentsAttemptedHorizontalBarChart
                v-if="attemptedAssessments.length > 0"
                :data="attemptedAssessments"
                colour="#5f31dd"
                class="mb-5"
            />
            <p v-else>No data yet</p>
            
            <h4 class="d-flex justify-content-between">Skills that have been failed more than once
                <button 
                    class="btn"
                    @click="downloadData(failedAssessments, 'Assessments-failed')">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 384 512"
                        width="18"
                        height="18">
                        <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --> <path d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"/>
                    </svg>
                </button> 
            </h4>
            <TenantFailedAssessmentsHorizontalBarChart
                v-if="failedAssessments.length > 0"
                :data="failedAssessments"
                colour="darkred"
                class="mb-5"
            />
            <p v-else>No data yet</p>            
        </div>

        <div v-else-if="chosenPage == 3">
            <!-- Filter Buttons -->
            <!-- <div
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
            </div> -->             
             <h4 class="d-flex justify-content-between">Tokens spent per day
                <button 
                    class="btn"
                    @click="downloadData(totalTokensPerDay, 'Tokens-per-day')">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 384 512"
                        width="18"
                        height="18">
                        <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --> <path d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"/>
                    </svg>
                </button> 
            </h4>
            <TenantTokensPerDayLineChart
                v-if="totalTokensPerDay.length > 0"
                :data="totalTokensPerDay"
                colour="#5f31dd"
                class="mb-5"
            />
            <p v-else>No data yet</p>
            <p>
                <em
                    >Please note recording of tokens per skill stops after
                    student mastery of that skill</em
                >
            </p>
            
            <h4 class="d-flex justify-content-between">Average number of tokens spent to master a skill
                <button 
                    class="btn"
                    @click="downloadData(avgTokensToMasterSkills, 'Avg-tokens-to-master-skill')">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 384 512"
                        width="18"
                        height="18">
                        <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --> <path d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"/>
                    </svg>
                </button> 
            </h4>
            <TenantAvgTokensToMasterSkillsHorizontalBarChart
                v-if="avgTokensToMasterSkills.length > 0"
                :data="avgTokensToMasterSkills"
                colour="darkgreen"
            />
            <p v-else>No data yet</p>
            
            <h4 class="d-flex justify-content-between mt-5">Tokens spent per skill
                <button 
                    class="btn"
                    @click="downloadData(totalTokensPerSkill, 'Tokens-per-skill')">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 384 512"
                        width="18"
                        height="18">
                        <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --> <path d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"/>
                    </svg>
                </button> 
            </h4>
            <TenantTokensPerSkillHorizontalBarChart
                v-if="totalTokensPerSkill.length > 0"
                :data="totalTokensPerSkill"
                colour="#5f31dd"
                class="mb-5"
            />
            <p v-else class="mb-5">No data yet</p>           
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
