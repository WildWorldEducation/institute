<script>
import * as d3 from 'd3';
import { timelines } from 'd3-timelines';

export default {
    setup() {},
    data() {
        return {};
    },
    computed: {},
    async mounted() {
        //this.drawTimeLineChart();
        this.drawTimeLineChartWithCircle();
    },
    methods: {
        drawTimeLineChart() {
            const data = [
                {
                    start: new Date(2024, 0, 5),
                    end: new Date(2024, 0, 7),
                    label: 'Read Chapter 1'
                },
                {
                    start: new Date(2024, 0, 15),
                    end: new Date(2024, 0, 17),
                    label: 'Number Theory'
                },
                {
                    start: new Date(2024, 0, 25),
                    end: new Date(2024, 0, 26),
                    label: 'Practice Worksheet'
                },
                {
                    start: new Date(2024, 1, 3),
                    end: new Date(2024, 1, 5),
                    label: 'Group Study'
                },
                {
                    start: new Date(2024, 1, 12),
                    end: new Date(2024, 1, 14),
                    label: 'Quiz'
                },
                {
                    start: new Date(2024, 1, 22),
                    end: new Date(2024, 1, 24),
                    label: 'Read '
                },
                {
                    start: new Date(2024, 2, 1),
                    end: new Date(2024, 2, 2),
                    label: 'Real Life'
                },
                {
                    start: new Date(2024, 2, 10),
                    end: new Date(2024, 2, 12),
                    label: 'Proportions'
                },
                {
                    start: new Date(2024, 2, 20),
                    end: new Date(2024, 2, 21),
                    label: ' Review Session'
                },
                {
                    start: new Date(2024, 2, 28),
                    end: new Date(2024, 2, 30),
                    label: 'Midterm Exam'
                },
                {
                    start: new Date(2024, 3, 10),
                    end: new Date(2024, 3, 12),
                    label: 'geometry Basics'
                },
                {
                    start: new Date(2024, 3, 20),
                    end: new Date(2024, 3, 22),
                    label: 'and Shapes'
                }
            ];

            const margin = { top: 20, right: 20, bottom: 30, left: 50 };
            const width = 1900 - margin.left - margin.right;
            const height = 700 - margin.top - margin.bottom;

            const svg = d3
                .select('#timeline')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const x = d3
                .scaleTime()
                .domain(d3.extent(data, (d) => d.end))
                .range([0, width]);

            const xAxis = d3.axisBottom(x);

            svg.append('g')
                .attr('class', 'x-axis')
                .attr('transform', `translate(0,300)`)
                .call(xAxis);

            svg.selectAll('.event')
                .data(data)
                .enter()
                .append('circle')
                .attr('class', 'event')
                .attr('cx', (d) => x(d.start))
                .attr('cy', height / 2)
                .attr('r', 5)
                .attr('fill', 'steelblue');

            svg.selectAll('.event-label')
                .data(data)
                .enter()
                .append('text')
                .attr('class', 'event-label')
                .attr('x', (d) => x(d.start) + 5)
                .attr('y', height / 2)
                .attr('dy', '.35em')
                .text((d) => d.label)
                .attr('fill', 'steelblue')
                .attr('font-size', '12px');
        },
        drawTimeLineChartWithCircle() {
            const testData = [
                {
                    times: [
                        {
                            starting_time: 1355752800000,
                            ending_time: 1355759900000
                        },
                        {
                            starting_time: 1355767900000,
                            ending_time: 1355774400000
                        }
                    ]
                },
                {
                    times: [
                        {
                            starting_time: 1355759910000,
                            ending_time: 1355761900000
                        }
                    ]
                },
                {
                    times: [
                        {
                            starting_time: 1355761910000,
                            ending_time: 1355763910000
                        }
                    ]
                }
            ];

            const chart = timelines()
                .tickFormat(
                    //
                    {
                        format: d3.utcFormat('%B %d, %Y')
                    }
                )
                .display('circle'); // toggle between rectangles and circles;

            const svg = d3
                .select('#timelineLibrary')
                .append('svg')
                .attr('width', 1800)
                .attr('height', 400)
                .datum(testData)
                .call(chart);
        }
    }
};
</script>

<template>
    <div class="container bg-dark">
        <div class="row">
            <div class="col-12">
                <h1 class="text-center text-white">
                    Time Line Chart with Circle
                </h1>
            </div>
        </div>
        <div class="row">
            <div class="col-12 bg-light">
                <!-- Placeholder for the time line chart with circle -->
                <p class="text-white text-center">
                    This is a placeholder for the time line chart with circle
                    component.
                </p>
                <!-- Add a svg shape -->
                <div id="timeline"></div>
            </div>
        </div>
        <div class="row bg-light">
            <div class="col-12">
                Time Line Chart with Circle using Timeline library .
            </div>
            <div class="col-12">
                <div id="timelineLibrary"></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
#svg {
    background-color: #f0f0f0;
    border: 1px solid #ccc;
}

#timeline {
    width: 100%;
    height: 400px;
    overflow-x: auto;
}

#timelineLibrary {
    width: 100%;
    height: 400px;
    overflow-x: auto;
}

#timelineLibrary .axis {
    transform: translate(0px, 40px);
    -ms-transform: translate(0px, 40px); /* IE 9 */
    -webkit-transform: translate(0px, 40px); /* Safari and Chrome */
    -o-transform: translate(0px, 40px); /* Opera */
    -moz-transform: translate(0px, 40px); /* Firefox */
}
</style>
