<script>
import * as d3 from 'd3';

export default {
    name: 'CohortDurationPerSkillHorizontalBarChart',
    props: ['data', 'colour'],
    data() {
        return {
        };
    },
    mounted() {
        const barHeight = 20;
        const marginTop = 0;
        const marginRight = 30;
        const marginBottom = 10;
        const marginLeft = 200;
        const width = document.getElementById(
            'student-time-chart-container'
        ).clientWidth;
        const height = barHeight * this.data.length + marginTop + marginBottom;

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

        // Create the SVG container.
        const svg = d3
            .select('#cohort-duration-per-skill-chart-container')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [
                0,
                0,
                +Math.min(width, height),
                +Math.min(width, height)
            ])
            .attr('preserveAspectRatio', 'xMinYMin');

        // Append a rect for each skill.
        svg.append('g')
            .attr('fill', 'purple')
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
    },
    computed: {}
};
</script>

<template>
    <div id="cohort-duration-per-skill-chart-container"></div>
</template>

<style scoped></style>
