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
            console.log('progress data is: ');
            console.log(data);
            let progressData = [];
            if (this.$parent.progressChartMode === 'school') {
                this.axisData = data.school;
                progressData = data.school;
            } else {
                this.axisData = data.teacher;
                progressData = data.teacher;
            }

            // Declare the chart dimensions and margins.
            const width = document.getElementById(
                'progress-chart-container'
            ).clientWidth;
            const height = document.getElementById(
                'progress-chart-container'
            ).clientHeight;
            const marginTop = 5;
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

            // Declare the line generator.
            const line = d3
                .line()
                .x((d) => x(d.date))
                .y((d) => y(d.quantity));

            // Create the SVG container.
            const svg = d3
                .select('#progress-chart-container')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('viewBox', [0, 0, width, height])
                .attr(
                    'style',
                    'max-width: 100%; height: auto; height: intrinsic;'
                );

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

            // Append a path for the line.
            svg.append('path')
                .attr('fill', 'none')
                .attr('stroke', 'green')
                .attr('stroke-width', 3)
                .attr('d', line(progressData));
        }
    }
};
</script>

<template></template>

<style scoped></style>
