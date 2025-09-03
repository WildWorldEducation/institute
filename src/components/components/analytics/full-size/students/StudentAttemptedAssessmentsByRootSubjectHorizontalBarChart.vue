<script>
import * as d3 from 'd3';

export default {
    name: 'StudentAttemptedAssessmentsByRootSubjectHorizontalBarChart',
    props: ['data'],
    data() {
        return {};
    },
    mounted() {
        console.log(this.data);
        const container = d3.select('#assessment-comparison-chart-container');

        // Specify the chart’s dimensions, based on a bar’s height.
        const marginTop = 0;
        const marginRight = 10;
        const marginBottom = 10;
        const marginLeft = 200;
        const width = document.getElementById(
            'assessment-comparison-chart-container'
        ).clientWidth;
        const height = document.getElementById(
            'assessment-comparison-chart-container'
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
            .select('#assessment-comparison-chart-container')
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', [0, 0, '100%', '100%'])
            .attr(
                'style',
                'max-width: 100%; height: 100%; font: 14px sans-serif;'
            );

        // Append a rect for each skill.
        svg.append('g')
            .selectAll()
            .data(this.data)
            .join('rect')
            .attr('x', x(0))
            .attr('y', (d) => y(d.name))
            .attr('width', (d) => x(d.quantity) - x(0))
            .attr('height', y.bandwidth())
            .attr('fill', function (d) {
                if (d.name == 'Language') return 'DarkMagenta';
                else if (d.name == 'Mathematics') return 'blue'; // blue
                else if (d.name == 'Science & Invention')
                    return 'purple'; // purple
                else if (d.name == 'Computer Science')
                    return 'deeppink'; // pink
                else if (d.name == 'Dangerous Ideas') return 'brown'; // brown
                else if (d.name == 'History') return 'cyan'; // cyan
                else if (d.name == 'Life') return 'magenta'; // magenta
                else return '#ff7f0e'; // orange
            });

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
    },
    computed: {}
};
</script>

<template></template>

<style scoped></style>
