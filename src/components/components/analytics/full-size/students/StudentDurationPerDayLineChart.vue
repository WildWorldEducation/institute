<script>
import * as d3 from 'd3';

export default {
    name: 'StudentDurationPerDayLineChart',
    props: ['data', 'colour', 'averageDuration', 'userRole', 'studentName'],
    data() {
        return {};
    },
    mounted() {
        const data = this.data;
        let averageLabel = '';

        if (this.userRole == 'instructor' || this.userRole == 'partner') {
            averageLabel = 'class average';
        }

        if (this.userRole == 'school_admin') {
            averageLabel = 'school average';
        }
        const chartData = [
            {
                name: this.studentName,
                values: data
            },
            {
                name: 'school average',
                values: this.averageDuration
            }
        ];
        const container = d3.select('#time-chart-container');
        console.log('averageDuration');
        console.log(this.averageDuration);

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

        const color = d3
            .scaleOrdinal()
            .domain(chartData.map((d) => d.name)) // Series names
            .range(d3.schemeCategory10);

        // X scale: use d3.scaleUtc (time axis)
        const x = d3.scaleUtc(
            [
                d3.min(chartData, (series) =>
                    d3.min(series.values, (d) => d.date)
                ),
                d3.max(chartData, (series) =>
                    d3.max(series.values, (d) => d.date)
                )
            ],
            [marginLeft, width - marginRight]
        );

        // Y scale: use max value across all series
        const y = d3.scaleLinear(
            [
                0,
                d3.max(chartData, (series) =>
                    d3.max(series.values, (d) => d.formattedQuantity)
                )
            ],
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
        // svg.append('path')
        //     .attr('fill', 'none')
        //     .attr('stroke', (d) => color(d.name))
        //     .attr('stroke-width', 3)
        //     .attr('d', line(data.values));

        svg.append('g')
            .selectAll('path')
            .data(chartData)
            .join('path')
            .attr('fill', 'none')
            .attr('stroke', (d) => color(d.name)) // ✅ use color scale
            .attr('stroke-width', 2)
            .attr('d', (d) => line(d.values));

        // Legend
        svg.selectAll('.legend')
            .data(chartData)
            .enter()
            .append('text')
            .attr('x', width - marginRight - 80)
            .attr('y', (d, i) => marginTop + i * 20)
            .attr('fill', (d) => color(d.name))
            .text((d) => d.name);
    }
};
</script>

<template></template>

<style scoped></style>
