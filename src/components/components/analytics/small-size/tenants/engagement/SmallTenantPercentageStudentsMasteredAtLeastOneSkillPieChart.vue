<script>
import * as d3 from 'd3';

export default {
    name: 'TenantPercentageStudentsMasteredAtLeastOneSkillPieChart',
    props: ['data'],
    data() {
        return {};
    },
    mounted() {
        const container = d3.select(
            '#tenant-percentage-students-mastered-one-skill-chart-container'
        );

        let data = this.data;

        // Specify the chart’s dimensions.
        const width = 200;
        const height = Math.min(width, 200);

        // Create the color scale.
        const color = d3
            .scaleOrdinal()
            .domain(data.map((d) => d.name))
            .range(
                d3
                    .quantize(
                        (t) => d3.interpolateSpectral(t * 0.8 + 0.1),
                        data.length
                    )
                    .reverse()
            );

        // Create the pie layout and arc generator.
        const pie = d3
            .pie()
            .sort(null)
            .value((d) => d.value);

        const arc = d3
            .arc()
            .innerRadius(0)
            .outerRadius(Math.min(width, height) / 2 - 1);

        const labelRadius = arc.outerRadius()() * 0.6;

        // A separate arc generator for labels.
        const arcLabel = d3
            .arc()
            .innerRadius(labelRadius)
            .outerRadius(labelRadius);

        const arcs = pie(data);

        // Create the SVG container.
        const svg = d3
            .select(
                '#tenant-percentage-students-mastered-one-skill-chart-container'
            )
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [-width / 2, -height / 2, width, height])
            .attr(
                'style',
                'max-width: 100%; height: auto; font: 14px sans-serif;'
            );

        // Add a sector path for each value.
        svg.append('g')
            .attr('stroke', 'white')
            .selectAll()
            .data(arcs)
            .join('path')
            .attr('fill', (d) => {
                if (d.data.name === 'Mastered one skill') {
                    return 'green';
                } else if (d.data.name === 'Mastered no skills') {
                    return 'red';
                }
            })
            .attr('d', arc)
            .append('title')
            .text(
                (d) => `${d.data.name}: ${d.data.value.toLocaleString('en-US')}`
            );
    },
    computed: {}
};
</script>

<template>
    <div
        id="tenant-percentage-students-mastered-one-skill-chart-container"
    ></div>
</template>

<style scoped></style>
