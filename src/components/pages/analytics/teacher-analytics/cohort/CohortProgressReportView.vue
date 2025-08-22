<script>
import { useCohortsStore } from '../../../../../stores/CohortsStore';
import { useUserDetailsStore } from '../../../../../stores/UserDetailsStore';
import CohortProgressLineChart from '../../../../components/analytics/full-size/cohorts/CohortProgressLineChart.vue';
import DownloadCSVBtn from '../../../../components/downloadCSVBtn/downloadCSVBtn.vue';

export default {
    setup() {
        const cohortsStore = useCohortsStore();
        const userDetailsStore = useUserDetailsStore();
        return {
            cohortsStore,
            userDetailsStore
        };
    },
    components: { CohortProgressLineChart, DownloadCSVBtn },
    data() {
        return {
            cohortId: this.$route.params.cohortId,
            cohortName: '',
            cohortProgress: [],
            cohortProgressDownloadData: []
        };
    },
    async created() {
        if (this.cohortsStore.cohorts.length < 1) {
            await this.cohortsStore.getCohorts(this.userDetailsStore.userId);
        }
        const foundObject = this.cohortsStore.cohorts.find(
            (cohort) => cohort.id == this.cohortId
        );
        if (foundObject) {
            this.cohortName = foundObject.name;
        }
        if (this.cohortId != 'all-students') {
            await this.getCohortProgress();
        } else {
            await this.getAllStudentsProgress();
        }
    },
    methods: {
        async getCohortProgress() {
            fetch(`/student-analytics/cohort-progress/${this.cohortId}`)
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].date = new Date(data[i].date);
                    }
                    data.sort((a, b) => a.date - b.date);
                    this.cohortProgress = data;
                })
                .catch((error) => {
                    console.error('Error fetching student progress:', error);
                });
        },
        async getAllStudentsProgress() {
            fetch(
                `/student-analytics/all-students-progress/${this.userDetailsStore.userId}`
            )
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].date = new Date(data[i].date);
                    }
                    data.sort((a, b) => a.date - b.date);
                    this.cohortProgress = data;
                    this.cohortProgressDownloadData = data.map((item) => ({
                        date: item.date,
                        skillMastered: item.quantity
                    }));
                })
                .catch((error) => {
                    console.error('Error fetching student progress:', error);
                });
        }
    }
};
</script>

<template>
    <div class="container">
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading">Progress Report</h1>
            <div class="d-flex align-items-center">
                <h2 class="secondary-heading h3 mt-1">{{ cohortName }}</h2>
                <DownloadCSVBtn
                    :data="cohortProgressDownloadData"
                    :fileName="`${cohortName}-progress.csv`"
                />
            </div>
        </span>
        <CohortProgressLineChart
            v-if="cohortProgress.length > 0"
            :data="cohortProgress"
            colour="#5f31dd"
        />
        <p v-else>There is no data to show yet.</p>
    </div>
</template>

<style></style>
