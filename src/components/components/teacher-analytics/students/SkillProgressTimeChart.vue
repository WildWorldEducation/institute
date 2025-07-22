<script>
import * as d3 from 'd3';

export default {
    props: {
        progressData: {
            type: Array,
            required: true,
            default: () => []
        },
        startDate: {
            type: Date,
            default: null
        },
        isLoading: {
            type: Boolean,
            default: false
        },
        chartId: {
            type: String,
            default: 'skills-progress-chart'
        }
    },
    computed: {
        totalSkillsMastered() {
            if (this.progressData.length === 0) return 0;
            return Math.max(...this.progressData.map((d) => d.skillsCount));
        }
    },
    watch: {
        // Only watch for when data becomes available (not for every change)
        progressData: {
            handler(newData) {
                if (!this.chartRendered && newData && newData.length > 0) {
                    this.$nextTick(() => {
                        this.createChart();
                        this.chartRendered = true;
                    });
                }
            },
            immediate: true
        }
    },
    data() {
        return {
            chartRendered: false
        };
    },
    mounted() {
        if (!this.isLoading && this.progressData.length > 0) {
            this.$nextTick(() => {
                this.createChart();
                this.chartRendered = true;
            });
        }
    },
    beforeUnmount() {
        // Clean up tooltips
        d3.selectAll('.skills-progress-tooltip').remove();
    },
    methods: {
        createChart() {
            // Clear any existing chart and tooltips
            d3.select(`#${this.chartId}`).selectAll('*').remove();
            d3.selectAll('.skills-progress-tooltip').remove();

            if (!this.progressData || this.progressData.length === 0) {
                return;
            }

            // Clean and validate data
            const cleanData = this.progressData
                .map((d) => ({
                    date: new Date(d.date),
                    skillsCount: Number(d.skillsCount) || 0
                }))
                .filter(
                    (d) => !isNaN(d.date.getTime()) && !isNaN(d.skillsCount)
                )
                .sort((a, b) => a.date - b.date);

            if (cleanData.length === 0) {
                console.error(
                    'No valid data after cleaning:',
                    this.progressData
                );
                return;
            }

            try {
                this.renderChart(cleanData);
            } catch (error) {
                console.error('Error creating chart:', error);
            }
        },

        renderChart(data) {
            // Wait a bit for DOM to be ready and try multiple times if needed
            this.$nextTick(() => {
                const container = d3.select(`#${this.chartId}`);
                let containerNode = container.node();

                if (!containerNode) {
                    // Try again after a short delay
                    setTimeout(() => {
                        const retryContainer = d3.select(`#${this.chartId}`);
                        containerNode = retryContainer.node();

                        if (!containerNode) {
                            console.error(
                                `Chart container #${this.chartId} not found after retry`
                            );
                            return;
                        }

                        this.drawChart(retryContainer, containerNode, data);
                    }, 100);
                } else {
                    this.drawChart(container, containerNode, data);
                }
            });
        },

        drawChart(container, containerNode, data) {
            const containerWidth =
                containerNode.getBoundingClientRect().width || 600;
            const width = Math.min(containerWidth - 20, 600);
            const height = 300;
            const marginTop = 20;
            const marginRight = 30;
            const marginBottom = 60;
            const marginLeft = 50;

            // Create scales with clean data
            const xExtent = d3.extent(data, (d) => d.date);
            const yMax = Math.max(d3.max(data, (d) => d.skillsCount) || 1, 1);

            const x = d3
                .scaleTime()
                .domain(xExtent)
                .range([marginLeft, width - marginRight]);

            const y = d3
                .scaleLinear()
                .domain([0, yMax])
                .nice()
                .range([height - marginBottom, marginTop]);

            // Create line generator with clean data
            const line = d3
                .line()
                .x((d) => x(d.date))
                .y((d) => y(d.skillsCount))
                .curve(d3.curveMonotoneX)
                .defined(
                    (d) =>
                        !isNaN(d.skillsCount) &&
                        !isNaN(x(d.date)) &&
                        !isNaN(y(d.skillsCount))
                );

            const svg = container
                .append('svg')
                .attr('width', window.screen.width >= 2560 ? '60%' : '100%')
                .attr('height', height)
                .attr('viewBox', `0 0 ${width} ${height}`)
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .style('max-width', '100%')
                .style('height', 'auto')
                .style('display', 'block');

            // Add X axis
            svg.append('g')
                .attr('transform', `translate(0,${height - marginBottom})`)
                .call(
                    d3.axisBottom(x).tickFormat(d3.timeFormat('%b %d')).ticks(6)
                )
                .selectAll('text')
                .style('text-anchor', 'end')
                .attr('dx', '-.8em')
                .attr('dy', '.15em')
                .attr('transform', 'rotate(-45)')
                .style('font-size', '11px');

            // Add Y axis
            svg.append('g')
                .attr('transform', `translate(${marginLeft},0)`)
                .call(d3.axisLeft(y).ticks(6))
                .selectAll('text')
                .style('font-size', '11px');

            // Add axis labels
            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 15)
                .attr('x', -(height / 2))
                .style('text-anchor', 'middle')
                .style('font-size', '12px')
                .style('fill', '#666')
                .text('Skills Mastered');

            svg.append('text')
                .attr('x', width / 2)
                .attr('y', height - 8)
                .style('text-anchor', 'middle')
                .style('font-size', '12px')
                .style('fill', '#666')
                .text('Date');

            // Add the line (dark green color) with clean data
            svg.append('path')
                .datum(data)
                .attr('fill', 'none')
                .attr('stroke', '#006400') // Dark green
                .attr('stroke-width', 2)
                .attr('d', line);

            // Add data points with clean data
            svg.selectAll('.dot')
                .data(data)
                .enter()
                .append('circle')
                .attr('class', 'dot')
                .attr('cx', (d) => x(d.date))
                .attr('cy', (d) => y(d.skillsCount))
                .attr('r', 4)
                .attr('fill', '#006400') // Dark green
                .style('cursor', 'pointer')
                .on('mouseover', (event, d) => {
                    this.showTooltip(event, d);
                })
                .on('mouseout', () => {
                    this.hideTooltip();
                });
        },

        showTooltip(event, d) {
            // Remove any existing tooltip
            d3.selectAll('.skills-progress-tooltip').remove();

            const tooltip = d3
                .select('body')
                .append('div')
                .attr('class', 'skills-progress-tooltip')
                .style('opacity', 0)
                .style('position', 'absolute')
                .style('background', 'rgba(0,0,0,0.9)')
                .style('color', 'white')
                .style('padding', '8px 12px')
                .style('border-radius', '4px')
                .style('pointer-events', 'none')
                .style('font-size', '12px')
                .style('z-index', '1000');

            tooltip.transition().duration(200).style('opacity', 0.9);
            tooltip
                .html(
                    `<strong>Skills:</strong> ${d.skillsCount}<br/>
                     <strong>Date:</strong> ${this.formatDate(d.date)}`
                )
                .style('left', event.pageX + 10 + 'px')
                .style('top', event.pageY - 28 + 'px');
        },

        hideTooltip() {
            d3.selectAll('.skills-progress-tooltip')
                .transition()
                .duration(500)
                .style('opacity', 0)
                .remove();
        },

        formatDate(date) {
            if (!date) return '';
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    }
};
</script>

<template>
    <div class="chart-container">
        <div v-if="isLoading" class="loading-state">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 mb-0 text-muted">Loading progress data...</p>
        </div>

        <div
            v-else-if="!progressData || progressData.length === 0"
            class="no-data-state"
        >
            <i class="fas fa-chart-line fa-2x text-muted mb-2"></i>
            <p class="text-muted mb-0">No progress data available yet.</p>
        </div>

        <div v-else>
            <div :id="chartId" class="chart-svg-container"></div>
            <div class="chart-info mt-3 pt-2 border-top">
                <div class="row">
                    <div class="col-12 col-md-6">
                        <small class="text-muted">
                            <i class="fas fa-calendar-alt me-1"></i>
                            Since {{ formatDate(startDate) }}
                        </small>
                    </div>
                    <div class="col-12 col-md-6 text-md-end mt-1 mt-md-0">
                        <small class="text-muted">
                            Total Skills Mastered:
                            <strong>{{ totalSkillsMastered }}</strong>
                        </small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.chart-container {
    width: 100%;
    min-height: 280px;
    overflow: hidden;
}

.chart-svg-container {
    width: 100%;
    overflow: visible;
    max-width: 100%;
    display: flex;
    justify-content: center;
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
    margin: 0;
}

/* Responsive styles */
@media (max-width: 575.98px) {
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

/* Global tooltip styles */
:global(.skills-progress-tooltip) {
    background: rgba(0, 0, 0, 0.9) !important;
    color: white !important;
    border-radius: 4px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
    border: none !important;
    font-family: inherit !important;
    max-width: 200px !important;
    word-wrap: break-word !important;
}
</style>
