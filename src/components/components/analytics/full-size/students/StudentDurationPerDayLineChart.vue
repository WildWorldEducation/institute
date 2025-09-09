<script>
import * as d3 from 'd3';

export default {
    name: 'StudentDurationPerDayLineChart',
    props: ['data', 'colour', 'averageDuration'],
    data() {
        return {};
    },
    mounted() {
        const data = this.data;
        console.log('data: ');
        console.log(data);
        const container = d3.select('#time-chart-container');
        console.log('averageDuration');
        console.log(this.averageDuration);
        // Declare the chart dimensions and margins.
        // Declare the chart dimensions and margins.
        const width = document.getElementById(
            'time-chart-container'
        ).clientWidth;
        const height = document.getElementById(
            'time-chart-container'
        ).clientHeight;
        const marginTop = 20;
        const marginRight = 30;
        const marginBottom = 40;
        const marginLeft = 40;

        // Declare the x (horizontal position) scale.
        const x = d3.scaleUtc(
            d3.extent(data, (d) => d.date),
            [marginLeft, width - marginRight]
        );

        // Declare the y (vertical position) scale.
        const y = d3.scaleLinear(
            [0, d3.max(data, (d) => d.formattedQuantity)],
            [height - marginBottom, marginTop]
        );

        // Declare the line generator.
        const line = d3
            .line()
            .x((d) => x(d.date))
            .y((d) => y(d.formattedQuantity));

        // Create the SVG container.
        const svg = d3
            .select('#time-chart-container')
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', [
                0,
                0,
                +Math.min(width, height),
                +Math.min(width, height)
            ])
            .attr('preserveAspectRatio', 'xMinYMin');

        // Add the x-axis.
        svg.append('g')
            .style('font-size', '12px')
            .attr('transform', `translate(0,${height - marginBottom})`)
            .call(
                d3
                    .axisBottom(x)
                    .ticks(data.length / 2)
                    .tickSizeOuter(0)
            );

        // Add the y-axis, remove the domain line, add grid lines and a label.
        svg.append('g')
            .style('font-size', '12px')
            .attr('transform', `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y).ticks(height / 80))
            .call((g) =>
                g
                    .selectAll('.tick line')
                    .clone()
                    .attr('x2', width - marginLeft - marginRight)
                    .attr('stroke-opacity', 0.1)
            )
            .call((g) =>
                g
                    .append('text')
                    .attr('x', -marginLeft)
                    .attr('y', 15)
                    .style('font-size', '16px')
                    .attr('fill', 'currentColor')
                    .attr('text-anchor', 'start')
                    .text('↑ Duration in minutes')
            );

        // Append a path for the line.
        svg.append('path')
            .attr('fill', 'none')
            .attr('stroke', 'green')
            .attr('stroke-width', 3)
            .attr('d', line(data));
    }
};
</script>

<template></template>

<style scoped></style>
