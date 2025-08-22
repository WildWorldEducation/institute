<script>
import * as d3 from 'd3';

export default {
    name: 'StudentDurationPerDayLineChart',
    props: ['data', 'colour'],
    data() {
        return {};
    },
    mounted() {
        const data = this.data;

        const container = d3.select(
            '#student-duration-per-day-chart-container'
        );

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
            .select('#student-duration-per-day-chart-container')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height])
            .attr('style', 'max-width: 100%; height: auto; height: intrinsic;');

        // Append a path for the line.
        svg.append('path')
            .attr('fill', 'none')
            .attr('stroke', '#5f31dd')
            .attr('stroke-width', 3)
            .attr('d', line(data));
    }
};
</script>

<template>
    <div id="student-duration-per-day-chart-container"></div>
</template>

<style scoped></style>
