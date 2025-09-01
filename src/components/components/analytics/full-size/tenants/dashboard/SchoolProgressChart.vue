<script>
import * as d3 from 'd3';

export default {
    name: 'SchoolProgressChart',
    props: [],
    data() {
        return {
            axisData: []
        };
    },
    mounted() {},
    methods: {
        createChart(data) {
            // First, clear line(s)
            //    d3.select('svg').remove();

            if (data.school.length > 0) this.axisData = data.school;
            else this.axisData = [];

            // Convert object into array of series
            const series = Object.entries(data).map(([name, values]) => ({
                name,
                values
            }));

            const container = d3.select('#progress-chart-container');

            // Declare the chart dimensions and margins.
            const width = document.getElementById(
                'progress-chart-container'
            ).clientWidth;
            const height = document.getElementById(
                'progress-chart-container'
            ).clientHeight;
            const marginTop = 0;
            const marginRight = 20;
            const marginBottom = 20;
            const marginLeft = 20;

            // Declare the x (horizontal position) scale.
            const x = d3.scaleUtc(
                d3.extent(this.axisData, (d) => d.date),
                [marginLeft, width - marginRight]
            );

            // Declare the y (vertical position) scale.
            const y = d3.scaleLinear(
                [0, d3.max(this.axisData, (d) => d.quantity)],
                [height - marginBottom, marginTop]
            );

            const color = d3
                .scaleOrdinal()
                .domain(series.map((s) => s.name))
                .range(d3.schemeCategory10);

            // Declare the line generator.
            const line = d3
                .line()
                .x((d) => x(d.date))
                .y((d) => y(d.quantity));

            // Create the SVG container.
            const svg = d3
                .select('#progress-chart-container')
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
            //   .append("g")
            //.attr("transform", "translate(" + Math.min(width,height) / 2 + "," + Math.min(width,height) / 2 + ")")
            //.attr('style', 'max-width: 100%; height: auto; height: intrinsic;');

            // Add the x-axis.
            svg.append('g')
                .attr('transform', `translate(0,${height - 20})`)
                .call(
                    d3
                        .axisBottom(x)
                        .ticks(width / 100)
                        .tickSizeOuter(0)
                );

            // Add the y-axis, remove the domain line, add grid lines and a label.
            svg.append('g')
                .attr('transform', `translate(${marginLeft},0)`)
                .call(d3.axisLeft(y).ticks(height / 40))
                .call((g) => g.select('.domain').remove())
                .call((g) =>
                    g
                        .selectAll('.tick line')
                        .clone()
                        .attr('x2', width - marginLeft - marginRight)
                        .attr('stroke-opacity', 0.2)
                )
                .call((g) =>
                    g
                        .append('text')
                        .attr('x', -marginLeft)
                        .attr('y', 10)
                        .attr('fill', 'currentColor')
                        .attr('text-anchor', 'start')
                );

            // Draw the lines
            svg.selectAll('.line')
                .data(series)
                .join('path')
                .attr('fill', 'none')
                .attr('stroke', (d) => 'green')
                .attr('stroke-width', 3)
                .attr('d', (d) => line(d.values));
        }
    }
};
</script>

<template></template>

<style scoped></style>
