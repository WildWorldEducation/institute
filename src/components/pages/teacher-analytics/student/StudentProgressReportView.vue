<script>
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import { useUserSkillsStore } from '../../../../stores/UserSkillsStore';
import SkillProgressTimeChart from '../../../components/teacher-analytics/students/SkillProgressTimeChart.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const userSkillsStore = useUserSkillsStore();
        return {
            userDetailsStore,
            userSkillsStore
        };
    },
    components: {
        SkillProgressTimeChart
    },
    data() {
        return {
            studentId: this.$route.params.studentId,
            studentName: '',
            progressData: [],
            masteredSkills: [],
            startDate: null,
            isLoading: true
        };
    },
    async created() {
        await this.initializeData();
    },
    methods: {
        async initializeData() {
            this.isLoading = true;

            try {
                const studentId = this.$route.params.studentId;

                if (
                    this.userDetailsStore.users &&
                    this.userDetailsStore.users.length < 1
                ) {
                    await this.userDetailsStore.getUsers();
                }

                const foundStudent = this.userDetailsStore.users?.find(
                    (student) => student.id === studentId
                );
                if (foundStudent) {
                    this.studentName = foundStudent.username;
                }

                // Get mastered skills data (keep for other purposes)
                await this.userSkillsStore.getMasteredSkills(studentId);
                this.masteredSkills = this.userSkillsStore.masteredSkills;

                // Get progress chart data using new endpoint
                await this.getProgressChartData(studentId);
            } catch (error) {
                console.error('Error initializing data:', error);
            } finally {
                this.isLoading = false;
            }
        },

        async getProgressChartData(studentId) {
            try {
                const response = await fetch(
                    `/student-analytics/skills-progress-chart/${studentId}`
                );

                if (response.ok) {
                    const data = await response.json();

                    this.startDate = data.startDate
                        ? new Date(data.startDate)
                        : this.getFallbackStartDate();

                    // Generate cumulative progress data
                    this.progressData = this.generateCumulativeProgressData(
                        data.skillsByDate
                    );
                } else {
                    // Fallback to old method if new endpoint not available
                    await this.getSkillActivityDataFallback(studentId);
                }
            } catch (error) {
                console.error('Error fetching progress chart data:', error);
                // Fallback to old method
                await this.getSkillActivityDataFallback(studentId);
            }
        },

        async getSkillActivityDataFallback(studentId) {
            try {
                const response = await fetch(
                    `/student-analytics/skill-activity-report/${studentId}`
                );

                if (response.ok) {
                    const skillActivity = await response.json();

                    if (skillActivity.length > 0) {
                        const earliestStartDate = skillActivity.reduce(
                            (earliest, skill) => {
                                if (skill.startDate) {
                                    const skillDate = new Date(skill.startDate);
                                    return !earliest || skillDate < earliest
                                        ? skillDate
                                        : earliest;
                                }
                                return earliest;
                            },
                            null
                        );

                        this.startDate =
                            earliestStartDate || this.getFallbackStartDate();
                    } else {
                        this.startDate = this.getFallbackStartDate();
                    }
                } else {
                    this.setStartDateFromMasteredSkills();
                }

                // Generate progress data using legacy method
                this.progressData = this.generateProgressDataLegacy();
            } catch (error) {
                console.error('Error fetching skill activity data:', error);
                this.setStartDateFromMasteredSkills();
                this.progressData = this.generateProgressDataLegacy();
            }
        },

        generateCumulativeProgressData(skillsByDate) {
            if (!skillsByDate || skillsByDate.length === 0) {
                return [];
            }

            const data = [];
            let cumulativeCount = 0;

            // Add start point if we have a start date
            if (this.startDate) {
                data.push({
                    date: this.startDate,
                    skillsCount: 0
                });
            }

            // Process each date and calculate cumulative count
            skillsByDate.forEach((item) => {
                cumulativeCount += parseInt(item.skills_on_date) || 0;
                data.push({
                    date: new Date(item.date),
                    skillsCount: cumulativeCount
                });
            });

            return data;
        },

        setStartDateFromMasteredSkills() {
            if (this.masteredSkills.length > 0) {
                const earliestMasteredDate = this.masteredSkills.reduce(
                    (earliest, skill) => {
                        const skillDate = new Date(skill.mastered_date);
                        return !earliest || skillDate < earliest
                            ? skillDate
                            : earliest;
                    },
                    null
                );

                if (earliestMasteredDate) {
                    this.startDate = new Date(
                        earliestMasteredDate.getTime() - 7 * 24 * 60 * 60 * 1000
                    );
                } else {
                    this.startDate = this.getFallbackStartDate();
                }
            } else {
                this.startDate = this.getFallbackStartDate();
            }
        },

        getFallbackStartDate() {
            return new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        },

        generateProgressDataLegacy() {
            // Legacy method - only used as fallback
            // Return empty array if no skills
            if (this.masteredSkills.length === 0) {
                return [];
            }

            // Filter only skills with valid mastered_date
            const validSkills = this.masteredSkills.filter((skill) => {
                const date = new Date(skill.mastered_date);
                return !isNaN(date.getTime());
            });

            if (validSkills.length === 0) {
                console.error('No valid mastered_date found in API data');
                return [];
            }

            // Group skills by date and sum them
            const skillsByDate = {};
            validSkills.forEach((skill) => {
                const dateStr = new Date(skill.mastered_date).toDateString();
                skillsByDate[dateStr] = (skillsByDate[dateStr] || 0) + 1;
            });

            // Convert to array and sort by date
            const sortedDates = Object.keys(skillsByDate)
                .map((dateStr) => ({
                    date: new Date(dateStr),
                    count: skillsByDate[dateStr]
                }))
                .sort((a, b) => a.date - b.date);

            const data = [];
            let cumulativeCount = 0;

            // Add start point only if we have a real start date
            if (this.startDate) {
                data.push({
                    date: this.startDate,
                    skillsCount: 0
                });
            }

            // Add cumulative counts for each date
            sortedDates.forEach((item) => {
                cumulativeCount += item.count;
                data.push({
                    date: item.date,
                    skillsCount: cumulativeCount
                });
            });

            return data;
        }
    }
};
</script>

<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-12">
                <div
                    class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center w-100 mb-4"
                >
                    <h1 class="heading mb-2 mb-sm-0">Progress Report</h1>
                    <h2 class="secondary-heading h3 mb-0">{{ studentName }}</h2>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-12">
                <div class="chart-section">
                    <h3 class="chart-title mb-3">
                        Number of Skills Mastered Over Time
                    </h3>

                    <SkillProgressTimeChart
                        :progress-data="progressData"
                        :start-date="startDate"
                        :is-loading="isLoading"
                        chart-id="student-progress-chart"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container-fluid {
    padding: 1rem;
    overflow-x: hidden;
    max-width: 100%;
}

.heading {
    font-weight: 600;
    margin-bottom: 0;
    font-size: clamp(1.5rem, 4vw, 2.5rem);
}

.secondary-heading {
    font-weight: 500;
    margin-bottom: 0;
    font-size: clamp(1rem, 3vw, 1.5rem);
}

.chart-section {
    padding: 1.5rem;
    margin-bottom: 2rem;
    overflow: hidden;
    max-width: 100%;
}

.chart-title {
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    font-weight: 600;
    margin-bottom: 0;
}

@media (max-width: 575.98px) {
    .container-fluid {
        padding: 0.75rem;
    }

    .chart-section {
        padding: 1rem;
        margin-bottom: 1rem;
    }
}
</style>
