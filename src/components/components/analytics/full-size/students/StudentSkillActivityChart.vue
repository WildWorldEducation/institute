<script>
import * as d3 from 'd3';

export default {
    name: 'StudentSkillActivityChart',
    methods: {
        createChart(data) {
            if (!data || data.length === 0) {
                console.warn('No data available for the chart');
                return;
            }

            // Declare the chart dimensions and margins.
            const width = document.getElementById(
                'activity-chart-container'
            ).clientWidth;
            const height = document.getElementById(
                'activity-chart-container'
            ).clientHeight;

            const margin = { top: 20, right: 0, bottom: 60, left: 200 };

            const svg = d3
                .select('#activity-chart-container')
                .append('svg')
                .attr('width', '100%')
                .attr('height', '100%');

            // Create main group for the chart
            const g = svg
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            // Create scales
            // Y scale for task names (ordinal scale)
            const yScale = d3
                .scaleBand()
                .domain(data.map((d) => d.name)) // Map task names to scale domain
                .range([0, height - 35]) // Set output range
                .padding(0.2); // Add padding between bars

            // X scale for time duration (linear scale)
            const xScale = d3
                .scaleLinear()
                .domain([0, d3.max(data, (d) => d.quantity)]) // Domain from 0 to max duration
                .range([0, width]);

            // Draw the chart using D3.js
            // Create bars
            g.selectAll('.bar')
                .data(data) // Bind data to selection
                .enter()
                .append('rect') // Create rect elements for each data point
                .attr('class', 'bar')
                .attr('x', 0) // Start bars at x=0 (left edge)
                .attr('y', (d) => yScale(d.name))
                .attr('width', (d) =>
                    d.quantity > 0 ? xScale(d.quantity / 2) : xScale(1)
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
                .style('font-size', '16px')
                .attr('transform', `translate(${width / 2},${height + 35})`) // Center below x-axis
                .style('text-anchor', 'middle')
                .text('Duration (minutes)');

            // Add value labels on bars
            g.selectAll('.bar-label')
                .data(data)
                .enter()
                .append('text')
                .attr('class', 'bar-label')
                .attr('x', (d) => xScale(d.quantity / 2) + 5) // Position slightly right of bar end
                .attr('y', (d) => yScale(d.name) + yScale.bandwidth() / 2) // Center vertically on bar
                .attr('dy', '0.35em') // Fine-tune vertical alignment
                .style('font-size', '14px')
                .text((d) => d.formattedQuantity); // Display duration value
        }
    }
};
</script>

<template></template>

<style scoped></style>
