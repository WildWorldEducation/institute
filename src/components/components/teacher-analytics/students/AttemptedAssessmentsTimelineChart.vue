<script>
import milestones from 'd3-milestones';
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore.js';
import { useUserSkillsStore } from '../../../../stores/UserSkillsStore.js';
export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const userSkillsStore = useUserSkillsStore();
        return {
            userDetailsStore,
            userSkillsStore
        };
    },
    props: ['data'],
    data() {
        return {
            chartOrientation: 'horizontal'
        };
    },
    async mounted() {
        this.drawTimeLineChartWithMilesStone();
        this.calculateChartLength(this.data);
    },
    methods: {
        drawTimeLineChartWithMilesStone() {
            milestones('#attempted-assessments-timeline')
                .mapping({
                    timestamp: 'date',
                    text: 'labelName'
                })
                .aggregateBy('week')
                .labelFormat('%d-%m-%Y')
                .optimize(true)
                .orientation(this.chartOrientation)
                .renderCallback(() => {
                    this.changeLabelColor();
                    if (this.chartOrientation === 'vertical') {
                        const milestonesDivs =
                            document.getElementsByClassName('milestones');
                        const milestonesDiv = milestonesDivs[0];
                        milestonesDiv.style.marginLeft = '30%';
                    }
                })
                .render(this.data);
            this.changeBulletColor();
            this.changeLabelColor();
        },
        calculateChartLength(dataArray) {
            const startDate = dataArray[0].date;
            const endDate = dataArray[dataArray.length - 1].date;
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
            for (let index = 0; index < childDiv.length; index++) {
                const element = childDiv[index];
                const skillNameDivs = element.getElementsByClassName(
                    'milestones-link-label'
                );
                const skillId = skillNameDivs[0].id;
                const skillData = this.data.find(
                    (e) => e.id === parseInt(skillId)
                );
                const bulletDivs = element.getElementsByClassName(
                    'milestones__group__bullet'
                );
                const bulletDiv = bulletDivs[0];
                const color = this.mapSkillLevelWithColor(skillData.level);
                bulletDiv.style.backgroundColor = color;
            }
        },
        changeLabelColor() {
            this.data.forEach((skill) => {
                const labelLink = document.getElementById(skill.id);
                const skillData = this.data.find(
                    (e) => parseInt(labelLink.id) === e.id
                );
                const color = this.mapSkillLevelWithColor(skillData.level);
                labelLink.style.color = color;
            });
        },
        mapSkillLevelWithColor(level) {
            switch (level) {
                case 'grade_school':
                    return '#116b62';
                case 'middle_school':
                    return '#168216';
                case 'high_school':
                    return '#7d6a02';
                case 'college':
                    return '#ffa500';
                case 'phd':
                    return '#9e0000';
                default:
                    break;
            }
        },
        handleOrientationBtnClick(direction) {
            this.chartOrientation = direction;
            this.drawTimeLineChartWithMilesStone();
        }
    }
};
</script>
<template>
    <div id="attempted-assessments-timeline"></div>
</template>
<style>
#attempted-assessments-timeline {
    position: relative;
}

.milestones__group__label__text-horizontal {
    width: 220px !important;
}

.milestones-link-label {
    text-decoration: none;
    color: rgb(68, 68, 68);
    font-weight: 600;
}
.milestones-link-label:hover {
    color: black;
}

.milestones__category_label {
    display: inline-block;
    text-align: right;
    font-size: 14px;
    margin-top: -4px;
}
.milestones__horizontal_line {
    position: absolute;
    background-color: #000;
    height: 3px;
    margin-top: 4px;
    margin-left: 5.5px;
    border-radius: 1.5px;
}
.milestones__vertical_line {
    position: absolute;
    background-color: #000;
    width: 3px;
    margin-left: 4px;
    margin-bottom: 5.5px;
    border-radius: 1.5px;
}
.milestones__group {
    position: absolute;
    font-family: sans-serif;
    font-size: 14px;
}
.milestones__group__bullet {
    background-color: #fff;
    border: 3px solid #333;
    border-radius: 50%;
    width: 0px;
    height: 0px;
    padding: 2.5px;
}
.milestones__group__label-horizontal,
.milestones__group__label-vertical {
    position: absolute;
    padding: 0;
    color: #666;
}
.milestones__group__label-horizontal {
    border-left: 1px solid #000;
    margin-left: 5px;
}
.milestones__group__label-horizontal div {
    position: relative;
    margin-left: 3px;
    display: inline-block;
}
.milestones__group__label-vertical {
    padding-left: 10px;
    padding-bottom: 0px;
    border-bottom: 1px solid #000;
    margin-bottom: -5.5px;
    margin-left: 10px;
    bottom: 100%;
    overflow: visible;
}
.milestones__group__label-vertical .wrapper {
    min-width: 100px;
    max-width: 300px;
    border-left: 1px solid black;
    border-bottom: 1px solid white;
    margin-bottom: -1px;
    padding-left: 5px;
}
.milestones__group__label-above-horizontal {
    bottom: 100%;
}
.milestones__group__label-above-vertical {
    padding-left: 0px;
    padding-right: 10px;
    right: 100%;
    text-align: right;
}
.milestones__group__label-above-vertical .wrapper {
    border-left: 0;
    border-right: 1px solid black;
    padding-left: 0px;
    padding-right: 5px;
}
.milestones__group__label-last {
    right: 100%;
    border-left: 0;
    border-right: 1px solid #000;
    margin-left: 0;
    margin-right: -6px;
    text-align: right;
}
.milestones__group__label-last div {
    margin-left: 0px;
    margin-right: 3px;
}
.milestones__group__label__text-vertical {
    display: table-cell;
    vertical-align: bottom;
}
.milestones__group__label__text__title {
    color: #000;
    font-weight: bold;
    font-size: 15px;
    white-space: nowrap;
}
.milestones__group__label__text__event {
    cursor: pointer;
}
.milestones__group__label__text__event--hover {
    background: #efefef;
    color: #313131;
}
</style>
