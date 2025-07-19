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
            milestones('#timeline')
                .mapping({
                    timestamp: 'mastered_date',
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
                    return '#40e0d0';
                case 'middle_school':
                    return '#33a133';
                case 'high_school':
                    return '#ffd700';
                case 'college':
                    return '#ffa500';
                case 'phd':
                    return '#ff0000';
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
    <div id="timeline"></div>
</template>
<style scoped>
#timeline {
    position: relative;
    width: 100%;
    height: 100%;
    margin: 0 auto;
}

.milestones-link-label {
    text-decoration: none;
    color: rgb(68, 68, 68);
    font-weight: 600;
}
.milestones-link-label:hover {
    color: black;
}
</style>
