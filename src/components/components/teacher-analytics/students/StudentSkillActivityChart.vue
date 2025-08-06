<script>
import * as d3 from 'd3';

export default {
    name: 'StudentSkillActivityChart',
    props: ['data', 'colour'],
    data() {
        return {
            chartHeight: 400,
            chartWidth: 1200,
            labelWidth: 20
        };
    },
    watch: {
        data: {
            handler() {
                this.labelWidth = this.calculateLongestLabelWidth();
                this.chartHeight = this.calculateChartHeight();
                this.drawChart();
            }
        }
    },

    methods: {
        drawChart() {
            const data = this.data;
            if (!data || data.length === 0) {
                console.warn('No data available for the chart');
                return;
            }

            const margin = { top: 20, right: 400, bottom: 40, left: 200 };
            const width = 400;
            const height = this.chartHeight - margin.top - margin.bottom;

            const svg = d3
                .select('#student-skill-activity-chart-container')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom);

            // Create main group for the chart
            const g = svg
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            // Create scales
            // Y scale for task names (ordinal scale)
            const yScale = d3
                .scaleBand()
                .domain(this.data.map((d) => d.name)) // Map task names to scale domain
                .range([0, height]) // Set output range
                .padding(0.3); // Add padding between bars

            // X scale for time duration (linear scale)
            const xScale = d3
                .scaleLinear()
                .domain([0, d3.max(this.data, (d) => d.quantity)]) // Domain from 0 to max duration
                .range([0, width]);

            // Draw the chart using D3.js
            // Create bars
            g.selectAll('.bar')
                .data(this.data) // Bind data to selection
                .enter()
                .append('rect') // Create rect elements for each data point
                .attr('class', 'bar')
                .attr('x', 0) // Start bars at x=0 (left edge)
                .attr('y', (d) => yScale(d.name)) // Position vertically based on task
                .attr('width', (d) =>
                    d.quantity > 0 ? xScale(d.quantity) : xScale(1)
                ) // Width based on duration value
                .attr('height', (d) =>
                    d.quantity > 0 ? yScale.bandwidth() : 1
                ) // Height from scale bandwidth
                .attr('fill', '#5f31dd'); // Set bar color

            // Create Y axis (left side, showing task names)
            g.append('g').attr('class', 'axis').call(d3.axisLeft(yScale)); // Create left-oriented axis with task labels

            // Create X axis (bottom, showing time duration)
            // g.append('g')
            //     .attr('class', 'axis')
            //     .attr('transform', `translate(0,${height})`) // Move to bottom of chart
            //     .call(d3.axisBottom(xScale)); // Create bottom-oriented axis with duration values

            // Add X axis label
            g.append('text')
                .attr('class', 'axis-label')
                .attr('transform', `translate(${width / 2},${height + 35})`) // Center below x-axis
                .style('text-anchor', 'middle')
                .text('Duration (hours)');

            // Add value labels on bars
            g.selectAll('.bar-label')
                .data(this.data)
                .enter()
                .append('text')
                .attr('class', 'bar-label')
                .attr('x', (d) => xScale(d.quantity) + 5) // Position slightly right of bar end
                .attr('y', (d) => yScale(d.name) + yScale.bandwidth() / 2) // Center vertically on bar
                .attr('dy', '0.35em') // Fine-tune vertical alignment
                .style('font-size', '12px')
                .text((d) => d.formattedQuantity); // Display duration value
        },
        calculateChartHeight() {
            if (this.data.length > 0) {
                const numRows = this.data.length;
                const rowHeight = 30; // Height of each row in pixels
                const result = numRows * rowHeight + 100; // Add some padding
                return result;
            } else {
                return 400; // Default height if no data
            }
        },
        calculateLongestLabelWidth() {
            // find the longest skill name length
            let maxLength = 0;
            for (const skill of this.data) {
                maxLength = Math.max(maxLength, skill.name.length);
            }

            const labelWidth = maxLength + 10; // Estimate width based on character length
            return labelWidth; // Add some padding
        }
    }
};
</script>

<template>
    <div id="student-skill-activity-chart-container"></div>
</template>

<style scoped>
</style>
