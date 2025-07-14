<script>
import * as d3 from 'd3';
export default {
    setup() {},
    components: {},
    data() {
        return {
            studentName: '',
            progressData: [],
            startDate: null,
            isLoading: true,
            chartDimensions: {
                width: 800,
                height: 400,
                margin: { top: 20, right: 30, bottom: 40, left: 60 }
            },

            updateChartDimensions() {
                if (!this.$refs.chartContainer) return;

                const containerElement =
                    this.$refs.chartContainer.parentElement;
                const containerWidth = containerElement.offsetWidth;
                this.containerWidth = containerWidth;

                // Responsive dimensions based on screen size
                const padding = 32; // Account for container padding
                const availableWidth = containerWidth - padding;

                // Responsive width and height
                if (window.innerWidth < 576) {
                    // Extra small devices
                    this.chartDimensions = {
                        width: Math.max(availableWidth, 300),
                        height: 250,
                        margin: { top: 15, right: 15, bottom: 50, left: 40 }
                    };
                } else if (window.innerWidth < 768) {
                    // Small devices
                    this.chartDimensions = {
                        width: Math.max(availableWidth, 400),
                        height: 300,
                        margin: { top: 20, right: 20, bottom: 60, left: 50 }
                    };
                } else if (window.innerWidth < 992) {
                    // Medium devices
                    this.chartDimensions = {
                        width: Math.max(availableWidth, 600),
                        height: 350,
                        margin: { top: 20, right: 25, bottom: 50, left: 55 }
                    };
                } else if (window.innerWidth < 1200) {
                    // Large devices
                    this.chartDimensions = {
                        width: Math.max(availableWidth, 750),
                        height: 400,
                        margin: { top: 20, right: 30, bottom: 50, left: 60 }
                    };
                } else {
                    // Extra large devices
                    this.chartDimensions = {
                        width: Math.max(availableWidth, 900),
                        height: 450,
                        margin: { top: 20, right: 30, bottom: 50, left: 60 }
                    };
                }
            },
            containerWidth: 0
        };
    },
    async created() {
        await this.initializeData();
    },
    mounted() {
        this.updateChartDimensions();
        this.createChart();
        window.addEventListener('resize', this.handleResize);
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.handleResize);
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
                this.studentName = 'Test name';
                this.startDate = new Date(
                    Date.now() - 90 * 24 * 60 * 60 * 1000
                ); // 90 days ago

                // Generate sample progress data
                this.progressData = this.generateSampleProgressData();
            } catch (error) {
                console.error('Error initializing data:', error);
            } finally {
                this.isLoading = false;
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
            if (!this.progressData.length || this.isLoading) return;

            // Update dimensions first
            this.updateChartDimensions();

            // Clear any existing chart
            d3.select(this.$refs.chartContainer).selectAll('*').remove();

            const { width, height, margin } = this.chartDimensions;
            const innerWidth = width - margin.left - margin.right;
            const innerHeight = height - margin.top - margin.bottom;

            // Create responsive SVG
            const svg = d3
                .select(this.$refs.chartContainer)
                .append('svg')
                .attr('width', '100%')
                .attr('height', height)
                .attr('viewBox', `0 0 ${width} ${height}`)
                .attr('preserveAspectRatio', 'xMidYMid meet');

            const g = svg
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            // Set up scales
            const xScale = d3
                .scaleTime()
                .domain(d3.extent(this.progressData, (d) => d.date))
                .range([0, innerWidth]);

            const yScale = d3
                .scaleLinear()
                .domain([0, d3.max(this.progressData, (d) => d.skillsCount)])
                .nice()
                .range([innerHeight, 0]);

            // Create line generator
            const line = d3
                .line()
                .x((d) => xScale(d.date))
                .y((d) => yScale(d.skillsCount))
                .curve(d3.curveMonotoneX);

            // Responsive tick count
            const xTickCount = width < 500 ? 4 : width < 800 ? 6 : 8;
            const yTickCount = height < 300 ? 4 : 6;

            // Add X axis
            g.append('g')
                .attr('transform', `translate(0,${innerHeight})`)
                .call(
                    d3
                        .axisBottom(xScale)
                        .ticks(xTickCount)
                        .tickFormat(
                            d3.timeFormat(width < 500 ? '%m/%d' : '%b %d')
                        )
                )
                .selectAll('text')
                .style('text-anchor', 'end')
                .style('font-size', width < 500 ? '10px' : '11px')
                .attr('dx', '-.8em')
                .attr('dy', '.15em')
                .attr('transform', width < 768 ? 'rotate(-45)' : 'rotate(-30)');

            // Add Y axis
            g.append('g')
                .call(d3.axisLeft(yScale).ticks(yTickCount))
                .selectAll('text')
                .style('font-size', width < 500 ? '10px' : '11px');

            // Add axis labels with responsive sizing
            const labelFontSize = width < 500 ? '10px' : '12px';

            g.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 0 - margin.left)
                .attr('x', 0 - innerHeight / 2)
                .attr('dy', '1em')
                .style('text-anchor', 'middle')
                .style('font-size', labelFontSize)
                .style('fill', '#666')
                .text(width < 500 ? 'Skills' : 'Skills Mastered');

            g.append('text')
                .attr(
                    'transform',
                    `translate(${innerWidth / 2}, ${
                        innerHeight + margin.bottom - 5
                    })`
                )
                .style('text-anchor', 'middle')
                .style('font-size', labelFontSize)
                .style('fill', '#666')
                .text('Date');

            // Add the line with responsive stroke width
            const strokeWidth = width < 500 ? 1.5 : 2;
            g.append('path')
                .datum(this.progressData)
                .attr('fill', 'none')
                .attr('stroke', '#007bff')
                .attr('stroke-width', strokeWidth)
                .attr('d', line);

            // Add data points with responsive radius
            const dotRadius = width < 500 ? 2.5 : width < 768 ? 3 : 4;
            g.selectAll('.dot')
                .data(this.progressData)
                .enter()
                .append('circle')
                .attr('class', 'dot')
                .attr('cx', (d) => xScale(d.date))
                .attr('cy', (d) => yScale(d.skillsCount))
                .attr('r', dotRadius)
                .attr('fill', '#007bff')
                .style('cursor', 'pointer');

            // Add tooltip functionality
            const tooltip = d3
                .select('body')
                .append('div')
                .attr('class', 'd3-tooltip')
                .style('opacity', 0)
                .style('position', 'absolute')
                .style('background', 'rgba(0,0,0,0.9)')
                .style('color', 'white')
                .style('padding', width < 500 ? '6px 8px' : '8px 12px')
                .style('border-radius', '4px')
                .style('pointer-events', 'none')
                .style('font-size', width < 500 ? '10px' : '12px')
                .style('z-index', '1000');

            g.selectAll('.dot')
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

        handleResize() {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                if (this.$refs.chartContainer) {
                    this.updateChartDimensions();
                    this.createChart();
                }
            }, 150);
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
                    this.createChart();
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

                    <div class="chart-container">
                        <div v-if="isLoading" class="loading-state">
                            <div
                                class="spinner-border text-primary"
                                role="status"
                            >
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
                            <i
                                class="fas fa-chart-line fa-2x text-muted mb-2"
                            ></i>
                            <p class="text-muted mb-0">
                                No progress data available yet.
                            </p>
                        </div>

                        <div v-else class="chart-wrapper">
                            <div ref="chartContainer" class="line-chart"></div>
                        </div>
                    </div>

                    <div
                        v-if="!isLoading && progressData.length > 0"
                        class="chart-info mt-3 pt-2 border-top"
                    >
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
                                        progressData[progressData.length - 1]
                                            ?.skillsCount || 0
                                    }}</strong>
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/*Base Styles */
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

.chart-container {
    position: relative;
    min-height: 250px;
    padding: 1rem 0;
}

.chart-wrapper {
    width: 100%;
    overflow-x: auto;
}

.line-chart {
    width: 100%;
    min-width: 300px;
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

/* Extra Small devices (portrait phones, less than 576px) */
@media (max-width: 575.98px) {
    .container-fluid {
        padding: 0.75rem;
    }

    .chart-section {
        padding: 1rem;
        margin-bottom: 1rem;
    }

    .chart-container {
        min-height: 200px;
        padding: 0.75rem 0;
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

/* Small devices (landscape phones, 576px and up) */
@media (min-width: 576px) and (max-width: 767.98px) {
    .chart-container {
        min-height: 250px;
    }
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) and (max-width: 991.98px) {
    .chart-container {
        min-height: 300px;
    }
}

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) and (max-width: 1199.98px) {
    .chart-container {
        min-height: 350px;
    }
}

/* Extra large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) {
    .chart-container {
        min-height: 400px;
    }

    .chart-section {
        padding: 2rem;
    }
}

/* Ultra-wide screens (1400px and up) */
@media (min-width: 1400px) {
    .chart-container {
        min-height: 450px;
    }
}

/* D3 Chart Responsive Styles */
:deep(.d3-tooltip) {
    background: rgba(0, 0, 0, 0.9) !important;
    color: white !important;
    border-radius: 4px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
    border: none !important;
    font-family: inherit !important;
    max-width: 200px !important;
    word-wrap: break-word !important;
}

:deep(.dot) {
    transition: all 0.2s ease !important;
    cursor: pointer !important;
}

:deep(.dot:hover) {
    fill: #0056b3 !important;
    stroke: #fff !important;
    stroke-width: 2px !important;
}

/* Chart axis styling */
:deep(.line-chart) svg {
    font-family: inherit;
}

:deep(.line-chart) .tick text {
    fill: #6c757d;
}

:deep(.line-chart) .domain {
    stroke: #dee2e6;
}

:deep(.line-chart) .tick line {
    stroke: #dee2e6;
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
    :deep(.dot) {
        transition: none !important;
    }

    :deep(.d3-tooltip) {
        transition: none !important;
    }
}

.chart-info i {
    color: #007bff;
}

/* Responsive Design */
@media (max-width: 768px) {
    .container {
        padding: 16px;
    }

    .chart-section {
        padding: 16px;
    }

    .line-chart {
        height: 300px;
    }

    .chart-container {
        min-height: 300px;
    }

    .heading {
        font-size: 1.5rem;
    }

    .secondary-heading {
        font-size: 1.1rem;
    }
}

@media (max-width: 576px) {
    .d-flex.justify-content-between {
        flex-direction: column;
        align-items: flex-start !important;
    }

    .secondary-heading {
        margin-top: 8px;
    }
}

/* D3 Tooltip Styles */
:deep(.d3-tooltip) {
    background: rgba(0, 0, 0, 0.9) !important;
    color: white !important;
    padding: 8px 12px !important;
    border-radius: 4px !important;
    font-size: 12px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
    border: none !important;
}

/* Chart Dot Hover Effects */
:deep(.dot:hover) {
    r: 6;
    fill: #0056b3;
    transition: all 0.2s ease;
}
</style>
