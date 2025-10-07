<script>
import * as d3 from 'd3';

export default {
    name: 'TenantPassedAssessmentsByRootSubjectHorizontalBarChart',
    props: ['data', 'colour'],
    data() {
        return {};
    },
    mounted() {         
        const marginTop = 0;
        const marginRight = 0;
        const marginBottom = 10;
        const marginLeft = 200;
        // Declare the chart dimensions and margins.
            const width = document.getElementById(
                'passed-subjects-chart'
            ).clientWidth;
            const height = document.getElementById(
                'passed-subjects-chart'
            ).clientHeight;

        // Create the scales.
        const x = d3
            .scaleLinear()
            .domain([0, d3.max(this.data, (d) => d.quantity)])
            .range([marginLeft, width - marginRight]);

        const y = d3
            .scaleBand()
            .domain(d3.sort(this.data, (d) => -d.quantity).map((d) => d.name))
            .rangeRound([marginTop, height - marginBottom])
            .padding(0.1);
    
        // Create the SVG container.
        const svg = d3
            .select(
                '#passed-subjects-chart'
            )
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [
                    0,
                    0,
                    +Math.min(width, height),
                    +Math.min(width, height)
                ])
                .attr('preserveAspectRatio', 'xMinYMin');

        // Append a rect for each skill.
        svg.append('g')           
            .selectAll()
            .data(this.data)
            .join('rect')
            .attr('x', x(0))
            .attr('y', (d) => y(d.name))
            .attr('width', (d) => x(d.quantity) - x(0))
            .attr('height', y.bandwidth())
            .attr('fill', function (d) {
                if (d.name == 'Language') return 'DarkMagenta'; // turquoise
                else if (d.name == 'Mathematics') return 'blue'; // blue
                else if (d.name == 'Science & Invention')
                    return 'purple'; // purple
                else if (d.name == 'Computer Science')
                    return 'deeppink'; // pink
                else if (d.name == 'Dangerous Ideas') return 'brown'; // brown
                else if (d.name == 'History') return 'cyan'; // cyan
                else if (d.name == 'Life') return 'magenta'; // magenta
                else return '#ff7f0e'; // orange
            });

        // Append a label for each name.
        svg.append('g')
            .attr('fill', 'white')
            .attr('text-anchor', 'end')
            .selectAll()
            .data(this.data)
            .join('text')
            .attr('x', (d) => x(d.quantity))
            .attr('y', (d) => y(d.name) + y.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('dx', -4)
            .text((d) => d.quantity)
            .call((text) =>
                text
                    .filter((d) => x(d.quantity) - x(0) < 20) // short bars
                    .attr('dx', +4)
                    .attr('fill', 'black')
                    .attr('text-anchor', 'start')
            );

        // Create the axes.
        svg.append('g')
            .attr('transform', `translate(0,${marginTop})`)
            .call(d3.axisTop(x).ticks(0))
            .call((g) => g.select('.domain').remove());

        svg.append('g')
            .attr('transform', `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y).tickSizeOuter(0));
    },
    computed: {}
};
</script>

<template>
    
</template>

<style scoped></style>
