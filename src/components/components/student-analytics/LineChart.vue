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
        // console.log(this.formattedData);

        // const data = [
        //     {
        //         date: parseDate('2007-04-23'),
        //         close: 93.24
        //     },
        //     {
        //         date: parseDate('2007-04-24'),
        //         close: 50
        //     },
        //     {
        //         date: parseDate('2007-04-25'),
        //         close: 98.84
        //     }
        // ];

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
            d3.extent(this.formattedData, (d) => d.newDate),
            [marginLeft, width - marginRight]
        );

        // Declare the y (vertical position) scale.
        const y = d3.scaleLinear(
            [0, d3.max(this.formattedData, (d) => 1)],
            [height - marginBottom, marginTop]
        );

        // Declare the line generator.
        const line = d3
            .line()
            .x((d) => x(d.newDate))
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
                    .text('Number of assessments passed')
            );

        // Append a path for the line.
        svg.append('path')
            .attr('fill', 'none')
            .attr('stroke', 'green')
            .attr('stroke-width', 1.5)
            .attr('d', line(this.formattedData));
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

<style scoped></style>
