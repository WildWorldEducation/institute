<script>
import * as d3 from 'd3';

export default {
    name: 'TimePerSkillHorizontalBarChart',
    props: ['data', 'colour'],
    data() {
        return {
            padding: 60
        };
    },
    mounted() {
        const container = d3.select('#time-per-skill-chart-container');
        //console.log(this.data);

        // Specify the chart’s dimensions, based on a bar’s height.
        const barHeight = 25;
        const marginTop = 0;
        const marginRight = 0;
        const marginBottom = 0;
        const marginLeft = 0;
        const width = 1000;
        const height =
            Math.ceil((this.data.length + 0.1) * barHeight) +
            marginTop +
            marginBottom;

        // Create the scales.
        const x = d3
            .scaleLinear()
            .domain([0, d3.max(this.data, (d) => d.quantity)])
            .range([marginLeft, width - marginRight]);

        const y = d3
            .scaleBand()
            .domain(d3.sort(this.data, (d) => -d.quantity).map((d) => d.name))
            .rangeRound([marginTop, height - marginBottom])
            .padding(0.1);

        // Create a value format.
        const format = x.tickFormat(20);

        // Create the SVG container.
        const svg = d3
            .select('#time-per-skill-chart-container')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height])
            .attr(
                'style',
                'max-width: 100%; height: 100%; font: 14px sans-serif;'
            );

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
    },
    computed: {}
};
</script>

<template>
    <div id="time-per-skill-chart-container"></div>
</template>

<style scoped></style>
