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
            const barHeight = 25;
            const marginTop = 0;
            const marginRight = 0;
            const marginBottom = 10;
            const marginLeft = 200;
            const width = document.getElementById(
                'activity-chart-container'
            ).clientWidth;
            const height = barHeight * data.length;

            // Create the scales.
            const x = d3
                .scaleLinear()
                .domain([0, d3.max(data, (d) => d.quantity)])
                .range([marginLeft, width - marginRight]);

            const y = d3
                .scaleBand()
                .domain(d3.sort(data, (d) => -d.quantity).map((d) => d.name))
                .rangeRound([marginTop, height - marginBottom])
                .padding(0.1);

            // Create the SVG container.
            const svg = d3
                .select('#activity-chart-container')
                .append('svg')
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('viewBox', [0, 0, width, height])
                .attr('preserveAspectRatio', 'xMinYMin');

           // Append a rect for each skill.
        svg.append('g')
            .attr('fill', function (d) { return "#5f31dd"; }.bind(this))
            .selectAll()
            .data(data)
            .join('rect')
            .attr('x', x(0))
            .attr('y', (d) => y(d.name))
            .attr('width', (d) => x(d.quantity) - x(0))
            .attr('height', y.bandwidth())
           

        // Append a label for each name.
        svg.append('g')
            .attr('fill', 'white')
            .attr('text-anchor', 'end')
            .selectAll()
            .data(data)
            .join('text')
            .attr('x', (d) => x(d.quantity))
            .attr('y', (d) => y(d.name) + y.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('dx', -4)
            .text((d) => d.formattedQuantity)
            .call((text) =>
                text
                    .filter((d) => x(d.quantity) - x(0) < 40) // short bars
                    .attr('dx', +4)
                    .attr('fill', 'black')
                    .attr('text-anchor', 'start')
            );

        // Create the axes.
        svg.append('g')
            .attr('transform', `translate(0,${marginTop})`)
            .call(d3.axisTop(x).ticks(0))
            .call((g) => g.select('.domain').remove());

        svg.append('g')
            .attr('transform', `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y).tickSizeOuter(0));
        }
    }
};
</script>

<template></template>

<style scoped></style>
