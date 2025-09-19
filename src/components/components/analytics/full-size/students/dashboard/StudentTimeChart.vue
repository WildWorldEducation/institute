<script>
import * as d3 from 'd3';

export default {
    name: 'SchoolTimeChart',
    props: [],
    data() {
        return {
            axisData: []
        };
    },
    mounted() {},
    methods: {
        createChart(data) {
            // Work out which array to use for the axes
            if (data.student.length == 0) {
                this.axisData = data.tenant;
            } else if (data.tenant.length == 0) {
                this.axisData = data.student;
            } else {
                // find which array has the highest number
                const highestStudentValue = data.student.reduce(
                    (max, obj) => Math.max(max, obj.quantity),
                    -Infinity
                );
                const highestAverageValue = data.tenant.reduce(
                    (max, obj) => Math.max(max, obj.quantity),
                    -Infinity
                );

                if (highestStudentValue >= highestAverageValue) {
                    this.axisData = data.student;
                } else {
                    this.axisData = data.tenant;
                }
            }

            // Convert object into array of series
            const series = Object.entries(data).map(([name, values]) => ({
                name,
                values
            }));

            // Declare the chart dimensions and margins.
            const width = document.getElementById(
                'time-chart-container'
            ).clientWidth;
            const height = document.getElementById(
                'time-chart-container'
            ).clientHeight;
            const marginTop = 5;
            const marginRight = 0;
            const marginBottom = 25;
            const marginLeft = 25;

            // Declare the x (horizontal position) scale.
            const x = d3.scaleUtc(
                d3.extent(this.axisData, (d) => d.date),
                [marginLeft, width - marginRight]
            );

            // Declare the y (vertical position) scale.
            const y = d3.scaleLinear(
                [0, d3.max(this.axisData, (d) => d.formattedQuantity)],
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
                .attr('transform', `translate(0,${height - marginBottom})`)
                .call(d3.axisBottom(x).ticks(7).tickSizeOuter(0));

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
                .attr('stroke', (d) => {
                    if (d.name == 'student') return 'RoyalBlue';
                    else return '#ff7f0e'; // orange
                })
                .attr('stroke-width', (d) => {
                    if (d.name == 'student') return 3;
                    else return 2;
                })
                .attr('d', (d) => line(d.values));
        }
    }
};
</script>

<template></template>

<style scoped></style>
