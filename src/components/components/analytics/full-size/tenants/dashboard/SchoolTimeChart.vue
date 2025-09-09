<script>
import * as d3 from 'd3';
import { useAnalyticsStore } from '../../../../../../stores/AnalyticsStore';

export default {
    name: 'SchoolTimeChart',
    setup() {
        const analyticsStore = useAnalyticsStore();
        return {
            analyticsStore
        };
    },
    data() {
        return {};
    },
    mounted() {},
    methods: {
        createChart(data) {           
            // Declare the chart dimensions and margins.
            const width = document.getElementById(
                'time-chart-container'
            ).clientWidth;
            const height = document.getElementById(
                'time-chart-container'
            ).clientHeight;
            const marginTop = 0;
            const marginRight = 20;
            const marginBottom = 20;
            const marginLeft = 25;

            // Declare the x (horizontal position) scale.
            const x = d3.scaleUtc(
                d3.extent(this.analyticsStore.time.tenant, (d) => d.date),
                [marginLeft, width - marginRight]
            );

            // Declare the y (vertical position) scale.
            const y = d3.scaleLinear(
                [
                    0,
                    d3.max(this.analyticsStore.time.tenant, (d) => d.minutes)
                ],
                [height - marginBottom, marginTop]
            );

            // Declare the line generator.
            const line = d3
                .line()
                .x((d) => x(d.date))
                .y((d) => y(d.minutes));

            // Create the SVG container.
            const svg = d3
                .select('#school-time-chart-container')
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
                .attr('transform', `translate(0,${height - marginBottom})`)
                .call(d3.axisBottom(x).ticks(data.length).tickSizeOuter(0));

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
                .attr('stroke', '#ff7f0e')
                .attr('stroke-width', 3)
                .attr('d', line(data));
        }
    }
};
</script>

<template>
    <div id="school-time-chart-container"></div>
</template>

<style scoped></style>
