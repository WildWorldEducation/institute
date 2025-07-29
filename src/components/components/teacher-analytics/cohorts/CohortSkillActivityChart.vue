<script>
import * as d3 from 'd3';
import moment from 'moment';

export default {
    name: 'CohortSkillActivityChart',
    props: ['data', 'colour'],
    data() {
        return {
            padding: 60
        };
    },
    mounted() {
        this.drawChart();
    },
    methods: {
        drawChart() {
            const data = this.data;
            if (!data || data.length === 0) {
                console.warn('No data available for the chart');
                return;
            }

            const margin = { top: 20, right: 60, bottom: 40, left: 100 };
            const width = 1200 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            const svg = d3
                .select('#skill-activity-chart-container')
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
                .padding(0.1); // Add padding between bars

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
                .attr('width', (d) => xScale(d.quantity)) // Width based on duration value
                .attr('height', yScale.bandwidth()) // Height from scale bandwidth
                .attr('fill', 'orange'); // Set bar color

            // Create Y axis (left side, showing task names)
            g.append('g').attr('class', 'axis').call(d3.axisLeft(yScale)); // Create left-oriented axis with task labels

            // Create X axis (bottom, showing time duration)
            g.append('g')
                .attr('class', 'axis')
                .attr('transform', `translate(0,${height})`) // Move to bottom of chart
                .call(d3.axisBottom(xScale)); // Create bottom-oriented axis with duration values

            // Add X axis label
            g.append('text')
                .attr('class', 'axis-label')
                .attr('transform', `translate(${width / 2},${height + 35})`) // Center below x-axis
                .style('text-anchor', 'middle')
                .text('Duration (milliseconds)');

            // // Add Y axis label
            // g.append('text')
            //     .attr('class', 'axis-label')
            //     .attr('transform', 'rotate(-90)') // Rotate for vertical text
            //     .attr('y', -70) // Position left of y-axis
            //     .attr('x', -height / 2) // Center vertically
            //     .style('text-anchor', 'middle')
            //     .text('Skill Name');

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
                .text((d) => d.quantity + ' miliseconds'); // Display duration value
        }
    }
};
</script>

<template>
    <div id="skill-activity-chart-container"></div>
</template>

<style scoped></style>
