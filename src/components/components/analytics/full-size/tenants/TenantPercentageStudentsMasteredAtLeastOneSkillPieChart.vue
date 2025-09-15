<script>
import * as d3 from 'd3';

export default {
    name: 'TenantPercentageStudentsMasteredAtLeastOneSkillPieChart',
    props: ['data'],
    data() {
        return {};
    },
    mounted() {
        let data = this.data;

       // Declare the chart dimensions and margins.
        const width = document.getElementById(
            'tenant-students-pie-chart-container'
        ).clientWidth;
        const height = document.getElementById(
            'tenant-students-pie-chart-container'
        ).clientHeight;

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
                '#tenant-students-pie-chart-container'
            )
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [-width / 2, -height / 2, width, height])
            .attr(
                'style',
                'max-width: 100%; height: auto; font: 10px sans-serif;'
            );

        // Add a sector path for each value.
        svg.append('g')
            .attr('stroke', 'white')
            .selectAll()
            .data(arcs)
            .join('path')
            .attr('fill', (d) => {
                if (d.data.name === 'Mastered one skill') {
                    return 'darkgreen';
                } else if (d.data.name === 'Mastered no skills') {
                    return 'darkred';
                }
            })
            .attr('d', arc)
            .append('title')
            .text(
                (d) => `${d.data.name}: ${d.data.value.toLocaleString('en-US')}`
            );

        // Create a new arc generator to place a label close to the edge.
        // The label shows the value if there is enough room.
        svg.append('g')
            .attr('text-anchor', 'middle')
            .selectAll()
            .data(arcs)
            .join('text')
            .attr('transform', (d) => `translate(${arcLabel.centroid(d)})`)
            .call((text) =>
                text
                    .append('tspan')
                    .attr('y', '-0.4em')
                    .attr('fill', 'white')
                    .attr('font-weight', 'bold')
                    .text((d) => d.data.name)
            )
            .call((text) =>
                text
                    .filter((d) => d.endAngle - d.startAngle > 0.25)
                    .append('tspan')
                    .attr('x', 0)
                    .attr('fill', 'white')
                    .attr('y', '1em')
                    .attr('fill-opacity', 1)
                    .text((d) => d.data.value.toLocaleString('en-US'))
            );
    },
    computed: {}
};
</script>

<template>
    
</template>

<style scoped></style>
