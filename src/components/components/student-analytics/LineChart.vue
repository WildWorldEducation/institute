<script>
import * as d3 from 'd3';

export default {
    name: 'LineChart',
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
        // Create a parser for the format "YYYY-MM-DD"
        const parseDate = d3.timeParse('%Y-%m-%d');

        const data = [
            {
                date: parseDate('2007-04-23'),
                close: 93.24
            },
            {
                date: parseDate('2007-04-24'),
                close: 50
            },
            {
                date: parseDate('2007-04-25'),
                close: 98.84
            }
        ];

        const container = d3.select('#chart-container');

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
            [0, d3.max(data, (d) => d.close)],
            [height - marginBottom, marginTop]
        );

        // Declare the line generator.
        const line = d3
            .line()
            .x((d) => x(d.date))
            .y((d) => y(d.close));

        const createPath = d3
            .line()
            .x((d, i) => x(i))
            .y((d) => y(d));

        // Create the SVG container.
        const svg = d3
            .select('#chart-container')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height])
            .attr('style', 'max-width: 100%; height: auto; height: intrinsic;');

        // Add the x-axis.
        svg.append('g')
            .attr('transform', `translate(0,${height - marginBottom})`)
            .call(
                d3
                    .axisBottom(x)
                    .ticks(width / 80)
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
                    .attr('stroke-opacity', 0.1)
            )
            .call((g) =>
                g
                    .append('text')
                    .attr('x', -marginLeft)
                    .attr('y', 10)
                    .attr('fill', 'currentColor')
                    .attr('text-anchor', 'start')
                    .text('↑ Daily close ($)')
            );

        // Append a path for the line.
        svg.append('path')
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 1.5)
            .attr('d', line(data));

        console.log(svg.node());
        console.log(container._groups[0]);

        //  container._groups[0].append(svg.node());
        //return svg.node();
    },
    computed: {
        rangeX() {
            const width = this.width - this.padding;
            return [0, width];
        },
        rangeY() {
            const height = this.height - this.padding;
            return [0, height];
        },
        path() {
            const x = d3.scaleLinear().range(this.rangeX);
            const y = d3.scaleLinear().range(this.rangeY);
            d3.axisLeft().scale(x);
            d3.axisTop().scale(y);
            x.domain(d3.extent(this.data, (d, i) => i));
            y.domain([0, d3.max(this.data, (d) => d)]);
            return d3
                .line()
                .x((d, i) => x(i))
                .y((d) => y(d));
        },
        line() {
            return this.path(this.data);
        },
        viewBox() {
            return `0 0 ${this.width} ${this.height}`;
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
