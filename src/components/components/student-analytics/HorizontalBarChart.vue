<script>
import * as d3 from 'd3';

export default {
    name: 'BarChart',
    props: {
        data: {
            required: true,
            type: Array
        }
    },
    data() {
        return {
            padding: 60
        };
    },
    mounted() {
        const container = d3.select('#chart-container');

        // Specify the chart’s dimensions, based on a bar’s height.
        const barHeight = 25;
        const marginTop = 0;
        const marginRight = 0;
        const marginBottom = 10;
        const marginLeft = 150;
        const width = 1000;
        const height =
            Math.ceil((this.data.length + 0.1) * barHeight) +
            marginTop +
            marginBottom;

        // Create the scales.
        const x = d3
            .scaleLinear()
            .domain([0, d3.max(this.data, (d) => d.times)])
            .range([marginLeft, width - marginRight]);

        const y = d3
            .scaleBand()
            .domain(d3.sort(this.data, (d) => -d.times).map((d) => d.name))
            .rangeRound([marginTop, height - marginBottom])
            .padding(0.1);

        // Create a value format.
        const format = x.tickFormat(20);

        // Create the SVG container.
        const svg = d3
            .select('#chart-container')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height])
            .attr(
                'style',
                'max-width: 100%; height: 100%; font: 14px sans-serif;'
            );

        // Append a rect for each name.
        svg.append('g')
            .attr('fill', 'darkred')
            .selectAll()
            .data(this.data)
            .join('rect')
            .attr('x', x(0))
            .attr('y', (d) => y(d.name))
            .attr('width', (d) => x(d.times) - x(0))
            .attr('height', y.bandwidth());

        // Append a label for each name.
        svg.append('g')
            .attr('fill', 'white')
            .attr('text-anchor', 'end')
            .selectAll()
            .data(this.data)
            .join('text')
            .attr('x', (d) => x(d.times))
            .attr('y', (d) => y(d.name) + y.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('dx', -4)
            .text((d) => format(d.times))
            .call((text) =>
                text
                    .filter((d) => x(d.times) - x(0) < 20) // short bars
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
    computed: {
        formattedData() {
            const newData = this.data.map((data) => ({
                ...data, // Spread operator to copy existing properties
                newDate: new Date(data.date),
                close: 1
            }));

            console.log(newData);
            return newData;
        }
    }
};
</script>

<template>
    <div id="chart-container"></div>
</template>

<style scoped>
.demo-chart {
    height: 500px;
}
</style>
