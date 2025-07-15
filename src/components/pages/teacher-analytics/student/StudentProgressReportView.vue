<script>
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import { useUserSkillsStore } from '../../../../stores/UserSkillsStore';
import * as d3 from 'd3';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const userSkillsStore = useUserSkillsStore();
        return {
            userDetailsStore,
            userSkillsStore
        };
    },
    components: {},
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
    async mounted() {
        if (!this.isLoading && this.progressData.length > 0) {
            this.createChart();
        }
    },
    methods: {
        async initializeData() {
            this.isLoading = true;

            try {
                // Get student ID from route params
                const studentId = this.$route.params.studentId;

                // Get student name from users store
                if (
                    this.userDetailsStore.users &&
                    this.userDetailsStore.users.length < 1
                ) {
                    await this.userDetailsStore.getUsers();
                }

                // Find student name
                const foundStudent = this.userDetailsStore.users?.find(
                    (student) => student.id === studentId
                );
                if (foundStudent) {
                    this.studentName = foundStudent.username;
                } else {
                    this.studentName = 'Student'; // Fallback
                }

                // Get mastered skills data
                await this.userSkillsStore.getMasteredSkills(studentId);

                // Use mastered skills (already filtered by API to exclude domains)
                this.masteredSkills = this.userSkillsStore.masteredSkills;

                // Get skill activity data to find the earliest first_visited_date
                await this.getSkillActivityData(studentId);

                // Generate progress data from mastered skills
                this.progressData = this.generateProgressData();
            } catch (error) {
                console.error('Error initializing data:', error);
            } finally {
                this.isLoading = false;

                // Create chart after data is loaded
                this.$nextTick(() => {
                    if (this.progressData.length > 0) {
                        this.createChart();
                    }
                });
            }
        },

        async getSkillActivityData(studentId) {
            try {
                // Use the existing skill-activity-report endpoint to get first_visited_date
                const response = await fetch(
                    `/student-analytics/skill-activity-report/${studentId}`
                );

                if (response.ok) {
                    const skillActivity = await response.json();

                    // Find the earliest first_visited_date (startDate in the response)
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
                    // If no skill activity data, fall back to mastered skills approach
                    this.setStartDateFromMasteredSkills();
                }
            } catch (error) {
                console.error('Error fetching skill activity data:', error);
                // Fall back to mastered skills approach
                this.setStartDateFromMasteredSkills();
            }
        },

        setStartDateFromMasteredSkills() {
            if (this.masteredSkills.length > 0) {
                // Find the earliest mastered date from our data
                const earliestMasteredDate = this.masteredSkills.reduce(
                    (earliest, skill) => {
                        const skillDate = new Date(skill.date);
                        return !earliest || skillDate < earliest
                            ? skillDate
                            : earliest;
                    },
                    null
                );

                // Set start date to a week before the earliest mastered skill
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

        generateProgressData() {
            if (this.masteredSkills.length === 0) {
                return [];
            }

            // Sort mastered skills by date
            const sortedSkills = [...this.masteredSkills].sort((a, b) => {
                return new Date(a.date) - new Date(b.date);
            });

            const data = [];
            let skillsCount = 0;

            // Add starting point
            data.push({
                date: this.startDate,
                skillsCount: 0
            });

            // Add data points for each mastered skill
            sortedSkills.forEach((skill) => {
                skillsCount++;
                data.push({
                    date: new Date(skill.date),
                    skillsCount: skillsCount
                });
            });

            return data;
        },

        createChart() {
            // Clear any existing chart
            d3.select('#student-progress-chart-container')
                .selectAll('*')
                .remove();

            // Chart dimensions
            const marginTop = 20;
            const marginRight = 30;
            const marginBottom = 40;
            const marginLeft = 60;
            const width = 800;
            const height = 400;

            // Create scales
            const x = d3
                .scaleTime()
                .domain(d3.extent(this.progressData, (d) => d.date))
                .range([marginLeft, width - marginRight]);

            const y = d3
                .scaleLinear()
                .domain([0, d3.max(this.progressData, (d) => d.skillsCount)])
                .nice()
                .range([height - marginBottom, marginTop]);

            // Create line generator
            const line = d3
                .line()
                .x((d) => x(d.date))
                .y((d) => y(d.skillsCount))
                .curve(d3.curveMonotoneX);

            // Create SVG container
            const svg = d3
                .select('#student-progress-chart-container')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('viewBox', [0, 0, width, height])
                .attr(
                    'style',
                    'max-width: 100%; height: auto; font: 12px sans-serif;'
                );

            // Add X axis
            svg.append('g')
                .attr('transform', `translate(0,${height - marginBottom})`)
                .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%b %d')))
                .selectAll('text')
                .style('text-anchor', 'end')
                .attr('dx', '-.8em')
                .attr('dy', '.15em')
                .attr('transform', 'rotate(-45)');

            // Add Y axis
            svg.append('g')
                .attr('transform', `translate(${marginLeft},0)`)
                .call(d3.axisLeft(y));

            // Add axis labels
            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 0 - marginLeft)
                .attr('x', 0 - height / 2)
                .attr('dy', '1em')
                .style('text-anchor', 'middle')
                .style('font-size', '12px')
                .style('fill', '#666')
                .text('Skills Mastered');

            svg.append('text')
                .attr('transform', `translate(${width / 2}, ${height - 5})`)
                .style('text-anchor', 'middle')
                .style('font-size', '12px')
                .style('fill', '#666')
                .text('Date');

            // Add the line (dark green color)
            svg.append('path')
                .datum(this.progressData)
                .attr('fill', 'none')
                .attr('stroke', '#006400') // Dark green
                .attr('stroke-width', 2)
                .attr('d', line);

            // Add data points
            svg.selectAll('.dot')
                .data(this.progressData)
                .enter()
                .append('circle')
                .attr('class', 'dot')
                .attr('cx', (d) => x(d.date))
                .attr('cy', (d) => y(d.skillsCount))
                .attr('r', 4)
                .attr('fill', '#006400') // Dark green
                .style('cursor', 'pointer');

            // Add tooltip
            const tooltip = d3
                .select('body')
                .append('div')
                .attr('class', 'student-progress-tooltip')
                .style('opacity', 0)
                .style('position', 'absolute')
                .style('background', 'rgba(0,0,0,0.9)')
                .style('color', 'white')
                .style('padding', '8px 12px')
                .style('border-radius', '4px')
                .style('pointer-events', 'none')
                .style('font-size', '12px')
                .style('z-index', '1000');

            svg.selectAll('.dot')
                .on('mouseover', (event, d) => {
                    tooltip.transition().duration(200).style('opacity', 0.9);
                    tooltip
                        .html(
                            `
                        <strong>Skills:</strong> ${d.skillsCount}<br/>
                        <strong>Date:</strong> ${this.formatDate(d.date)}
                    `
                        )
                        .style('left', event.pageX + 10 + 'px')
                        .style('top', event.pageY - 28 + 'px');
                })
                .on('mouseout', () => {
                    tooltip.transition().duration(500).style('opacity', 0);
                });
        },

        formatDate(date) {
            if (!date) return '';
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        },

        formatDateTime(date) {
            if (!date) return '';
            let jsDate = new Date(date);
            return jsDate.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    },

    watch: {
        progressData: {
            handler() {
                this.$nextTick(() => {
                    if (this.progressData.length > 0) {
                        this.createChart();
                    }
                });
            },
            deep: true
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

                    <div v-if="isLoading" class="loading-state">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2 mb-0 text-muted">
                            Loading progress data...
                        </p>
                    </div>

                    <div
                        v-else-if="progressData.length === 0"
                        class="no-data-state"
                    >
                        <i class="fas fa-chart-line fa-2x text-muted mb-2"></i>
                        <p class="text-muted mb-0">
                            No progress data available yet.
                        </p>
                    </div>

                    <div v-else>
                        <div id="student-progress-chart-container"></div>
                        <div class="chart-info mt-3 pt-2 border-top">
                            <div class="row">
                                <div class="col-12 col-md-6">
                                    <small class="text-muted">
                                        <i class="fas fa-calendar-alt me-1"></i>
                                        Since {{ formatDate(startDate) }}
                                    </small>
                                </div>
                                <div
                                    class="col-12 col-md-6 text-md-end mt-1 mt-md-0"
                                >
                                    <small class="text-muted">
                                        Total Skills Mastered:
                                        <strong>{{
                                            masteredSkills.length
                                        }}</strong>
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Skills Mastered Table -->
        <div class="row" v-if="!isLoading && masteredSkills.length > 0">
            <div class="col-12">
                <div class="table-section">
                    <h3 class="table-title mb-3">Skills Mastered</h3>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Skill</th>
                                    <th>Date Mastered</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="skill in masteredSkills"
                                    :key="skill.id"
                                    class="table-rows"
                                >
                                    <td>
                                        <router-link
                                            target="_blank"
                                            :to="'/skills/' + skill.url"
                                        >
                                            {{ skill.name }}
                                        </router-link>
                                    </td>
                                    <td>
                                        {{ formatDateTime(skill.date) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- No skills message -->
        <div class="row" v-else-if="!isLoading && masteredSkills.length === 0">
            <div class="col-12">
                <div class="table-section">
                    <h3 class="table-title mb-3">Skills Mastered</h3>
                    <p class="text-muted">
                        This student has not mastered any skills yet.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container-fluid {
    padding: 1rem;
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
}

.chart-title {
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    font-weight: 600;
    margin-bottom: 0;
}

.table-section {
    padding: 1.5rem;
    margin-bottom: 2rem;
}

.table-title {
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    font-weight: 600;
    margin-bottom: 0;
}

.loading-state,
.no-data-state {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    padding: 2rem 1rem;
}

.chart-info {
    padding: 0.75rem 0;
}

#student-progress-chart-container {
    width: 100%;
    overflow-x: auto;
}

.table {
    margin-bottom: 0;
}

.table th {
    font-weight: 600;
    border-bottom: 2px solid #dee2e6;
}

.table-rows:hover {
    background-color: #f8f9fa;
}

.table-responsive {
    border-radius: 0.375rem;
}

/* Responsive styles */
@media (max-width: 575.98px) {
    .container-fluid {
        padding: 0.75rem;
    }

    .chart-section,
    .table-section {
        padding: 1rem;
        margin-bottom: 1rem;
    }

    .loading-state,
    .no-data-state {
        min-height: 150px;
        padding: 1rem 0.5rem;
    }

    .chart-info {
        padding: 0.5rem 0;
        font-size: 0.875rem;
    }
}

/* Tooltip styles */
:deep(.student-progress-tooltip) {
    background: rgba(0, 0, 0, 0.9) !important;
    color: white !important;
    border-radius: 4px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
    border: none !important;
    font-family: inherit !important;
    max-width: 200px !important;
    word-wrap: break-word !important;
}

/* Chart dot hover effects */
:deep(.dot:hover) {
    r: 6;
    fill: #004d00; /* Darker green on hover */
}
</style>
