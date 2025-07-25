<script>
import * as d3 from 'd3';
import { timelines } from 'd3-timelines';
import moment from 'moment';
import { useTeacherAnalyticsStore } from '../../../../stores/TeacherAnalyticsStore';

export default {
    name: 'SkillActivityGanttChart',
    props: ['data', 'colour', 'studentId'],
    setup() {
        const teacherAnalyticsStore = useTeacherAnalyticsStore();
        return {
            teacherAnalyticsStore
        };
    },
    data() {
        return {
            padding: 60,
            chartData: [],
            timeRange: { min: 0, max: 0 },
            showDropDown: false,
            order: 'time'
        };
    },
    mounted() {
        this.timeRange = this.calculateTimeRange();
        this.prepareDataForChart();
        this.createTimeLinesChart();
    },
    methods: {
        createTimeLinesChart() {
            const chart = timelines()
                .stack(true)
                .tickFormat({
                    format: d3.timeFormat('%d-%m-%Y'),
                    tickTime: d3.timeYears,
                    tickInterval: 1,
                    tickSize: 6
                })
                .beginning(this.timeRange.min * 1000)
                .ending(this.timeRange.max * 1000)
                .margin({ left: 0, right: 0, top: 0, bottom: 20 });

            const svg = d3
                .select('#skill-activity-chart-container')
                .append('svg')
                .attr('width', 1630)
                .attr('height', this.calculateChartHeight())
                .datum(this.chartData)
                .call(chart);

            const emptyChart = timelines()
                .stack(true)
                .tickFormat({
                    format: d3.timeFormat('%d-%m-%Y'),
                    tickTime: d3.timeYears,
                    tickInterval: 1,
                    tickSize: 6
                })
                .margin({ left: 0, right: 0 })
                .beginning(this.timeRange.min * 1000)
                .ending(this.timeRange.max * 1000);

            const emptyData = [
                {
                    times: [
                        {
                            starting_time: this.timeRange.min * 1000,
                            ending_time: this.timeRange.min * 1000,
                            label: ''
                        }
                    ]
                }
            ];
            // Create an empty chart for the top axis
            const svg2 = d3
                .select('#skill-activity-chart-top-axis')
                .append('svg')
                .attr('width', 1630)
                .attr('height', 50)
                .style('margin-top', '40px')
                .datum(emptyData)
                .call(emptyChart);
        },
        prepareDataForChart() {
            this.chartData = this.data.map((item) => {
                return {
                    times: [
                        {
                            starting_time: moment(item.startDate).unix() * 1000,
                            ending_time: moment(item.endDate).unix() * 1000,
                            label: item.name,
                            level: item.level || 'N/A'
                        }
                    ]
                };
            });
        },
        calculateTimeRange() {
            if (this.data.length === 0) return { min: 0, max: 0 };

            const startDates = this.data.map((item) =>
                moment(item.startDate).unix()
            );
            const endDates = this.data.map((item) =>
                moment(item.endDate).unix()
            );

            return {
                min: Math.min(...startDates),
                max: Math.max(...endDates)
            };
        },
        calculateTickInterval() {
            const range = this.timeRange.max - this.timeRange.min;
            if (range < 60 * 60 * 24) return 1; // less than a day
            if (range < 60 * 60 * 24 * 30) return 7; // less than a month
            return 30; // more than a month
        },
        calculateChartHeight() {
            return this.data.length * 50 + 100; // 50px per item + padding
        },
        handleChooseOrder(orderString) {
            this.order = orderString;
            this.showDropDown = false;
            this.reOrderDataArray();
        },
        async reOrderDataArray() {
            if (this.order === 'time') {
                this.chartData.sort((a, b) => {
                    return a.times[0].starting_time - b.times[0].starting_time;
                });
            } else if (this.order === 'level') {
                const newData =
                    await this.teacherAnalyticsStore.getSkillActivityReportOrderByLevel(
                        this.studentId
                    );
                console.log(newData);
                this.prepareDataForChart();
            }
            this.redrawTimeLinesChart();
        },
        redrawTimeLinesChart() {
            d3.select('#skill-activity-chart-container').select('svg').remove();
            d3.select('#skill-activity-chart-top-axis').select('svg').remove();
            this.createTimeLinesChart();
        }
    }
};
</script>

<template>
    <div class="row">
        <div class="col col-md-8 col-lg-5 mt-2">
            <!-- Custom Dropdown -->
            <h2 class="secondary-heading h4">Order chart:</h2>
            <div class="d-flex flex-column position-relative drop-down-div">
                <div
                    :class="[
                        showDropDown
                            ? 'custom-select-button-focus '
                            : 'custom-select-button '
                    ]"
                    @click="showDropDown = !showDropDown"
                >
                    Order by: {{ order }}
                    <span>
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M14.2929 8.70711C14.9229 8.07714 14.4767 7 13.5858 7H6.41421C5.52331 7 5.07714 8.07714 5.70711 8.70711L9.29289 12.2929C9.68342 12.6834 10.3166 12.6834 10.7071 12.2929L14.2929 8.70711Z"
                                fill="#344054"
                            />
                        </svg>
                    </span>
                </div>
                <div v-if="showDropDown" class="custom-dropdown-base">
                    <div
                        class="custom-dropdown-option"
                        @click="handleChooseOrder('time')"
                    >
                        Time
                    </div>
                    <div
                        class="custom-dropdown-option"
                        @click="handleChooseOrder('level')"
                    >
                        Level
                    </div>
                </div>
            </div>
            <!-- End of custom dropdown -->
        </div>
    </div>
    <!-- an empty time line chart just to get the time line axis -->
    <div id="skill-activity-chart-top-axis"></div>
    <div id="skill-activity-chart-container"></div>
</template>

<style scoped>
/* Style For The Custom Select */
.custom-select-button {
    width: 100%;
    height: 42px;
    padding: 10px 0px 10px 14px;
    border-radius: 8px;
    gap: 8px;
    background: linear-gradient(0deg, #ffffff, #ffffff),
        linear-gradient(0deg, #f2f4f7, #f2f4f7);
    border: 1px solid #6f6f6f;
    box-shadow: 0px 1px 2px 0px #1018280d;
    font-family: 'Poppins' sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0.03em;
    text-align: left;
    display: flex;
}

.custom-select-button-focus {
    width: 100%;
    height: 42px;
    padding: 10px 0px 10px 14px;
    border-radius: 8px;
    gap: 8px;
    background: linear-gradient(0deg, #ffffff, #ffffff),
        linear-gradient(0deg, #f2f4f7, #f2f4f7);
    border: 1px solid #9c7eec;
    box-shadow: 0px 0px 0px 4px #bca3ff4d;
    font-family: 'Poppins' sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0.03em;
    text-align: left;
    display: flex;
}

.custom-select-button:hover {
    cursor: pointer;
    border: 1px solid #9c7eec;
}

.custom-select-button > span {
    margin-right: 2px;
    margin-left: auto;
    animation: rotationBack 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

.custom-select-button-focus > span {
    margin-right: 2px;
    margin-left: auto;
    animation: rotation 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

.form-validate {
    font-size: 0.75rem;
    color: red;
    font-weight: 300;
}

/* The animation key frame */
@keyframes rotation {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(180deg);
    }
}

@keyframes rotationBack {
    from {
        transform: rotate(180deg);
    }
    to {
        transform: rotate(0deg);
    }
}

.custom-select-button-focus:hover {
    cursor: pointer;
}
.custom-dropdown-base {
    border-radius: 8px;
    border: 1px;
    background: linear-gradient(0deg, #ffffff, #ffffff);
    border: 1px solid #9c7eec;
    box-shadow: 0px 4px 6px -2px #10182808;
    box-shadow: 0px 12px 16px -4px #10182814;
    position: absolute;
    z-index: 10;
    width: 100%;
    top: 42px;
}

.custom-dropdown-option {
    padding: 10px 14px 10px 14px;
    gap: 8px;
    color: #344054;
}

.custom-dropdown-option:hover {
    cursor: pointer;
    background: #bca3ff1a;
}

.drop-down-div {
    width: 40%;
}
/* End of CSS style for Custom Select */
</style>
