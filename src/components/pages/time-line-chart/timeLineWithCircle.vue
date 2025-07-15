<script>
import * as d3 from 'd3';
import { timelines } from 'd3-timelines';
import milestones from 'd3-milestones';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';
import { useUserSkillsStore } from '../../../stores/UserSkillsStore.js';
export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const userSkillsStore = useUserSkillsStore();
        return {
            userDetailsStore,
            userSkillsStore
        };
    },
    data() {
        return {
            chartWidth: '500px',
            data: []
        };
    },
    computed: {},
    async mounted() {
        await this.getUserSkillMasteredHistory();

        //this.drawTimeLineChart();
        //this.drawTimeLineChartWithCircle();
        this.drawTimeLineChartWithMilesStone();
        this.calculateChartLength(this.data);
        this.changeBulletColor();
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
                            color: 'orange',
                            starting_time: 1355752800000, // Dec 18, 2012 08:00:00 UTC
                            ending_time: 1355752860000
                        },
                        {
                            color: 'red',
                            starting_time: 1355925600000, // Dec 20, 2012 08:00:00 UTC
                            ending_time: 1355925660000
                        },
                        {
                            color: 'yellow',
                            starting_time: 1356098400000, // Dec 22, 2012 08:00:00 UTC
                            ending_time: 1356098460000
                        },
                        {
                            color: 'green',
                            starting_time: 1356271200000, // Dec 24, 2012 08:00:00 UTC
                            ending_time: 1356271260000
                        },
                        {
                            color: 'blue',
                            starting_time: 1356444000000, // Dec 26, 2012 08:00:00 UTC
                            ending_time: 1356444060000
                        },
                        {
                            color: 'purple',
                            starting_time: 1356616800000, // Dec 28, 2012 08:00:00 UTC
                            ending_time: 1356616860000
                        },
                        {
                            color: 'pink',
                            starting_time: 1356789600000, // Dec 30, 2012 08:00:00 UTC
                            ending_time: 1356789660000
                        },
                        {
                            color: 'brown',
                            starting_time: 1356962400000, // Jan 1, 2013 08:00:00 UTC
                            ending_time: 1356962460000
                        },
                        {
                            color: 'cyan',
                            starting_time: 1357135200000, // Jan 3, 2013 08:00:00 UTC
                            ending_time: 1357135260000
                        },
                        {
                            color: 'magenta',
                            starting_time: 1357308000000, // Jan 5, 2013 08:00:00 UTC
                            ending_time: 1357308060000
                        }
                    ]
                }
            ];

            const chart = timelines()
                .tickFormat(
                    //
                    {
                        format: d3.timeFormat('%a %d %b %d %Y'),
                        tickTime: d3.timeYears,
                        tickSize: 40,
                        tickInterval: 20
                    }
                )
                .orient('bottom')
                .itemHeight(30)
                .itemMargin(-15)
                .height(400)
                .stack()
                .display('circle');

            const svg = d3
                .select('#timelineLibrary')
                .append('svg')
                .attr('width', 1400)
                .attr('height', 500)
                .datum(testData)
                .call(chart);
        },
        drawTimeLineChartWithMilesStone() {
            console.log('sever data is: ');
            console.log(this.data);
            milestones('#timeline')
                .mapping({
                    timestamp: 'date_mastered',
                    text: 'name'
                })
                .labelFormat('%d-%m-%Y')
                .render(this.data);
        },
        calculateChartLength(dataArray) {
            const startDate = dataArray[0].date;
            const endDate = dataArray[dataArray.length - 1].date;
            console.log(startDate + ' === ' + endDate);
            const dayDiff = this.getDaysBetweenDates(startDate, endDate);
            const numberOfItem = dataArray.length;
            this.chartWidth = dayDiff * 3 + numberOfItem * 50 + 'px';
        },
        getDaysBetweenDates(dateString1, dateString2) {
            const date1 = new Date(dateString1);
            const date2 = new Date(dateString2);

            const time1 = date1.getTime();
            const time2 = date2.getTime();

            const diffInMs = Math.abs(time2 - time1);

            const msInDay = 1000 * 60 * 60 * 24;
            const diffInDays = Math.round(diffInMs / msInDay);

            return diffInDays;
        },
        changeBulletColor() {
            const milestonesDiv = document.getElementsByClassName('milestones');
            const childDiv =
                milestonesDiv[0].getElementsByClassName('milestones__group');
            console.log('----------------------------------');
            for (let index = 0; index < childDiv.length; index++) {
                const element = childDiv[index];
                console.log('|||||||||||||');
                const skillNameDivs = element.getElementsByClassName(
                    'milestones-text-label'
                );
                const skillName = skillNameDivs[0].textContent;
                console.log(skillName);

                const bulletDivs = element.getElementsByClassName(
                    'milestones__group__bullet'
                );
                const bulletDiv = bulletDivs[0];
                const color =
                    '#' +
                    ((Math.random() * 0xffffff) << 0)
                        .toString(16)
                        .padStart(6, '0');
                bulletDiv.style.backgroundColor = color;
                console.log(bulletDivs[0]);
            }
        },
        async getUserSkillMasteredHistory() {
            await this.userSkillsStore.getMasteredSkills(
                this.userDetailsStore.userId
            );
            this.data = this.userSkillsStore.masteredSkills;
            console.log('Data is: ');
            console.log(this.data);
        }
    }
};
</script>

<template>
    <div class="time-chart-big-container">
        <div class="d-flex flex-column">
            <h3>Time Line Chart</h3>
            <!-- Placeholder for the time line chart with circle -->
            <p class="text-white text-center">
                This is a placeholder for the time line chart with circle
                component.
            </p>
            <div class="time-chart-parent">
                <!-- Add a svg shape -->
                <div id="timeline"></div>
            </div>
        </div>
    </div>
</template>

<style>
#svg {
    background-color: #f0f0f0;
    border: 1px solid #ccc;
}

.chart-component {
    width: 500px;
}

#timeline {
    width: v-bind(chartWidth);
    height: 400px;
    overflow-x: auto;
}

#timelineLibrary {
    height: 400px;
    overflow-x: auto;
    padding-top: 60px;
}

.time-chart-parent {
    overflow: hidden;
    width: 500px;
}

.time-chart-children {
    display: inline-block;
    white-space: nowrap;
    overflow-x: auto;
}

.time-chart-big-container {
    max-width: 1000px;
}
</style>
