<script>
import * as d3 from 'd3';

export default {
    name: 'FailedAssessmentsHorizontalBarChart',
    props: ['data', 'colour'],
    data() {
        return {};
    },
    mounted() {
        // Specify the chart’s dimensions, based on a bar’s height.
        const marginTop = 0;
        const marginRight = 0;
        const marginBottom = 0;
        const marginLeft = 200;
        const width = document.getElementById(
            'fails-by-skill-chart-container'
        ).clientWidth;
        const height = document.getElementById(
            'fails-by-skill-chart-container'
        ).clientHeight;

        // Create the scales.
        const x = d3
            .scaleLinear()
            .domain([0, d3.max(this.data, (d) => d.quantity)])
            .range([marginLeft, width - marginRight]);

        const y = d3
            .scaleBand()
            .domain(d3.sort(this.data, (d) => -d.quantity).map((d) => d.name))
            .rangeRound([marginTop, height - marginBottom])
            .padding(0.2);

        // Create a value format.
        const format = x.tickFormat(20);

        // Create the SVG container.
        const svg = d3
            .select('#fails-by-skill-chart-container')
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', [0, 0, '100%', '100%'])
            .attr('preserveAspectRatio', 'xMinYMin');

        // Append a rect for each skill.
        svg.append('g')
            .attr('fill', this.colour)
            .selectAll()
            .data(this.data)
            .join('rect')
            .attr('x', x(0))
            .attr('y', (d) => y(d.name))
            .attr('width', (d) => x(d.quantity) - x(0))
            .attr('height', y.bandwidth());

        // Append a label for each name.
        svg.append('g')
            .attr('fill', 'white')
            .attr('text-anchor', 'end')
            .selectAll()
            .data(this.data)
            .join('text')
            .attr('x', (d) => x(d.quantity))
            .attr('y', (d) => y(d.name) + y.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('dx', -4)
            .text((d) => format(d.quantity))
            .call((text) =>
                text
                    .filter((d) => x(d.quantity) - x(0) < 20) // short bars
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
            .attr('style', 'font-size: 16px')
            .call(d3.axisLeft(y).tickSizeOuter(0));
    }
};
</script>

<template></template>

<style scoped></style>
