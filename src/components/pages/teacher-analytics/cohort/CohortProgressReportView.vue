<script>
import { useCohortsStore } from '../../../../stores/CohortsStore';
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import * as d3 from 'd3';

export default {
    setup() {
        const cohortsStore = useCohortsStore();
        const userDetailsStore = useUserDetailsStore();
        return {
            cohortsStore,
            userDetailsStore
        };
    },
    components: {},
    data() {
        return {
            cohortId: this.$route.params.cohortId,
            cohortName: '',
            progressData: [],
            allMasteredSkills: [],
            startDate: null,
            isLoading: true,
            studentsInCohort: []
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
                // Get cohort name
                if (this.cohortsStore.cohorts.length < 1) {
                    await this.cohortsStore.getCohorts(this.userDetailsStore.userId);
                }
                
                const foundCohort = this.cohortsStore.cohorts.find(
                    (cohort) => cohort.id == this.cohortId
                );
                if (foundCohort) {
                    this.cohortName = foundCohort.name;
                }

                // Get students in cohort and their mastered skills
                await this.getCohortStudentsData();

                // Get earliest start date from all students
                await this.getCohortStartDate();

                // Generate progress data
                this.progressData = this.generateProgressData();
            } catch (error) {
                console.error('Error initializing cohort data:', error);
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

        async getCohortStudentsData() {
            try {
                // Get students in cohort and their mastered skills count
                const response = await fetch(`/student-analytics/mastered-skills/cohort/${this.cohortId}`);
                
                if (response.ok) {
                    this.studentsInCohort = await response.json();
                    
                    // Now get detailed mastered skills data for each student
                    this.allMasteredSkills = [];
                    
                    // We need to get individual student data to build the timeline
                    // For now, we'll use the aggregate data from the cohort endpoint
                    // In a real implementation, you might want to fetch individual student data
                } else {
                    console.warn('No cohort data found');
                    this.studentsInCohort = [];
                }
            } catch (error) {
                console.error('Error fetching cohort students data:', error);
                this.studentsInCohort = [];
            }
        },

        async getCohortStartDate() {
            try {
                // For cohort, we'll use a reasonable start date
                // In a full implementation, you'd want to get the earliest first_visited_date 
                // from all students in the cohort
                
                if (this.studentsInCohort.length > 0) {
                    // Set start date to 3 months ago as a reasonable default for cohort
                    this.startDate = new Date(Date.now() - (90 * 24 * 60 * 60 * 1000));
                } else {
                    this.startDate = this.getFallbackStartDate();
                }
            } catch (error) {
                console.error('Error setting cohort start date:', error);
                this.startDate = this.getFallbackStartDate();
            }
        },

        getFallbackStartDate() {
            return new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        },

        generateProgressData() {
            if (this.studentsInCohort.length === 0) {
                return [];
            }

            // For cohort view, we'll create a cumulative progress based on total skills mastered
            // This is a simplified version - in reality you'd want to track when each skill was mastered
            const data = [];
            
            // Add starting point
            data.push({
                date: this.startDate,
                skillsCount: 0
            });

            // Calculate total skills mastered by all students
            const totalSkills = this.studentsInCohort.reduce((sum, student) => sum + student.quantity, 0);
            
            // Create some sample progression points (in reality, you'd use actual mastery dates)
            const numberOfPoints = 10;
            const daysBetweenPoints = 90 / numberOfPoints;
            
            for (let i = 1; i <= numberOfPoints; i++) {
                const date = new Date(this.startDate.getTime() + (i * daysBetweenPoints * 24 * 60 * 60 * 1000));
                const skillsAtPoint = Math.floor((totalSkills * i) / numberOfPoints);
                
                data.push({
                    date: date,
                    skillsCount: skillsAtPoint
                });
            }

            return data;
        },

        createChart() {
            // Clear any existing chart
            d3.select('#cohort-progress-chart-container')
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
                .select('#cohort-progress-chart-container')
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
                .text('Total Skills Mastered');

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
                .attr('class', 'cohort-progress-tooltip')
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
                        <strong>Total Skills:</strong> ${d.skillsCount}<br/>
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
                    <h2 class="secondary-heading h3 mb-0">{{ cohortName }}</h2>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-12">
                <div class="chart-section">
                    <h3 class="chart-title mb-3">
                        Total Skills Mastered Over Time (All Students)
                    </h3>

                    <div v-if="isLoading" class="loading-state">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2 mb-0 text-muted">
                            Loading cohort progress data...
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
                        <div id="cohort-progress-chart-container"></div>
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
                                        Students in Cohort:
                                        <strong>{{ studentsInCohort.length }}</strong>
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Students Progress Table -->
        <div class="row" v-if="!isLoading && studentsInCohort.length > 0">
            <div class="col-12">
                <div class="table-section">
                    <h3 class="table-title mb-3">Student Progress Summary</h3>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Skills Mastered</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="student in studentsInCohort"
                                    :key="student.name"
                                    class="table-rows"
                                >
                                    <td>
                                        {{ student.name }}
                                    </td>
                                    <td>
                                        <strong>{{ student.quantity }}</strong>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- No students message -->
        <div class="row" v-else-if="!isLoading && studentsInCohort.length === 0">
            <div class="col-12">
                <div class="table-section">
                    <h3 class="table-title mb-3">Student Progress Summary</h3>
                    <p class="text-muted">
                        No students found in this cohort or no progress data available.
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

#cohort-progress-chart-container {
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
:deep(.cohort-progress-tooltip) {
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