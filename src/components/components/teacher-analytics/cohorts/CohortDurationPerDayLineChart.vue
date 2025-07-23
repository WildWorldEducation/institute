<script>
import * as d3 from 'd3';

export default {
    name: 'CohortDurationPerDayLineChart',
    props: ['data', 'colour'],
    data() {
        return {
            padding: 60
        };
    },
    mounted() {
        const data = this.data;
        const container = d3.select('#cohort-duration-per-day-chart-container');

        // Declare the chart dimensions and margins.
        const width = 928;
        const height = 500;
        const marginTop = 20;
        const marginRight = 30;
        const marginBottom = 30;
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
            .select('#cohort-duration-per-day-chart-container')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height])
            .attr('style', 'max-width: 100%; height: auto; height: intrinsic;');

        // Add the x-axis.
        svg.append('g')
            .attr('transform', `translate(0,${height - marginBottom})`)
            .call(
                d3
                    .axisBottom(x)
                    .ticks(data.length / 2)
                    .tickSizeOuter(0)
            );

        // Add the y-axis, remove the domain line, add grid lines and a label.
        svg.append('g')
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
                    .attr('y', 10)
                    .attr('fill', 'currentColor')
                    .attr('text-anchor', 'start')
                    .text('↑ Duration in seconds')
            );

        // Append a path for the line.
        svg.append('path')
            .attr('fill', 'none')
            .attr('stroke', 'darkblue')
            .attr('stroke-width', 1.5)
            .attr('d', line(data));
    }
};
</script>

<template>
    <div id="cohort-duration-per-day-chart-container"></div>
</template>

<style scoped></style>
