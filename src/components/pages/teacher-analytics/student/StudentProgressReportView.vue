<script>
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import * as d3 from 'd3';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    components: {},
    data() {
        return {
            studentName: '',
            progressData: [],
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

                // TODO: Replace with actual API call to get student details
                // const studentDetails = await this.userDetailsStore.getUserDetails(studentId);

                // Mock student data for now
                this.studentName = 'Test Student';
                this.startDate = new Date(
                    Date.now() - 90 * 24 * 60 * 60 * 1000
                ); // 90 days ago

                // Generate sample progress data
                this.progressData = this.generateSampleProgressData();
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

        generateSampleProgressData() {
            // Sample data showing skills mastered over time
            const data = [];
            const startDate = new Date(this.startDate);
            const currentDate = new Date();
            const daysDiff = Math.floor(
                (currentDate - startDate) / (1000 * 60 * 60 * 24)
            );

            let skillsCount = 0;

            // Generate data points every 3 days
            for (let i = 0; i <= daysDiff; i += 3) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);

                // Simulate realistic skill progression
                if (i > 0 && Math.random() > 0.2) {
                    skillsCount += Math.floor(Math.random() * 4) + 1;
                }

                data.push({
                    date: date,
                    skillsCount: skillsCount
                });
            }

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

            // Add the line
            svg.append('path')
                .datum(this.progressData)
                .attr('fill', 'none')
                .attr('stroke', '#007bff')
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
                .attr('fill', '#007bff')
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
                                        Current Skills:
                                        <strong>{{
                                            progressData[
                                                progressData.length - 1
                                            ]?.skillsCount || 0
                                        }}</strong>
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
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

/* Responsive styles */
@media (max-width: 575.98px) {
    .container-fluid {
        padding: 0.75rem;
    }

    .chart-section {
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
    fill: #0056b3;
}
</style>
