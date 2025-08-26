<script>
import TenantAvgInteractionTimePerSkillHorizontalBarChart from '../../../components/analytics/full-size/tenants/TenantAvgInteractionTimePerSkillHorizontalBarChart.vue';
import TenantPercentageStudentsMasteredAtLeastOneSkillPieChart from '../../../components/analytics/full-size/tenants/TenantPercentageStudentsMasteredAtLeastOneSkillPieChart.vue';
import TenantDurationPerDayLineChart from '../../../components/analytics/full-size/tenants/TenantDurationPerDayLineChart.vue';
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import { useAnalyticsStore } from '../../../../stores/AnalyticsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const analyticsStore = useAnalyticsStore();
        return { userDetailsStore, analyticsStore };
    },
    components: {
        TenantAvgInteractionTimePerSkillHorizontalBarChart,
        TenantPercentageStudentsMasteredAtLeastOneSkillPieChart,
        TenantDurationPerDayLineChart
    },
    data() {
        return {
            tenantId: this.userDetailsStore.tenantId,
            // Engagement -----------------------
            durationPerDay: [],
            percentageStudentsMasteredOneSkill: [],
            isDataWeekly: false,
            // Tutorial tooltips
            isTutorialComplete: false,
            showTutorialTip1: false,
            // showTutorialTip2: false,
            // showTutorialTip3: false,
            // showTutorialTip4: false,
            dataMode: 'total'
        };
    },
    async created() {
        // Check tutorial progress
        await this.checkIfTutorialComplete();
        // Engagement -----------------------
        if (this.analyticsStore.avgTimeOnSkills.length == 0)
            await this.getAvgTimeOnSkills();
        if (this.analyticsStore.durationPerDay.length == 0)
            await this.getTenantDuration();
        if (this.analyticsStore.percentageStudentsMasteredOneSkill.length == 0)
            await this.getPercentageStudentsMasteredOneSkill();
    },
    methods: {
        // Tutorial methods
        async checkIfTutorialComplete() {
            const result = await fetch(
                `/users/check-tutorial-progress/school-report/${this.userDetailsStore.userId}`
            );
            const data = await result.json();
            if (data == 0) {
                this.isTutorialComplete = false;
                this.showTutorialTip1 = true;
            } else if (data == 1) {
                this.isTutorialComplete = true;
            }
        },
        progressTutorial(step) {
            if (step == 1) {
                this.showTutorialTip1 = false;
                // this.showTutorialTip2 = true;
                this.markTutorialComplete();
            }
            // else if (step == 2) {
            //     this.showTutorialTip2 = false;
            //     this.showTutorialTip3 = true;
            // } else if (step == 3) {
            //     this.showTutorialTip3 = false;
            //     this.showTutorialTip4 = true;
            // } else if (step == 4) {
            //     this.showTutorialTip4 = false;
            //     this.markTutorialComplete();
            // }
        },
        restartTutorial() {
            this.isTutorialComplete = false;
            this.showTutorialTip1 = true;
            // this.showTutorialTip2 = false;
            // this.showTutorialTip3 = false;
            // this.showTutorialTip4 = false;
        },
        markTutorialComplete() {
            let url =
                '/users/mark-tutorial-complete/school-report/' +
                this.userDetailsStore.userId;
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            };
            fetch(url, requestOptions);
        },
        // skipTutorial() {
        //     this.showTutorialTip1 = false;
        //     this.showTutorialTip2 = false;
        //     this.showTutorialTip3 = false;
        //     this.showTutorialTip4 = false;
        //     this.isTutorialComplete = true;
        //     this.markTutorialComplete();
        // },
        // Engagement -----------------------
        async getAvgTimeOnSkills() {
            try {
                const response = await fetch(
                    `/student-analytics/avg-times-on-skills/tenant/${this.tenantId}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                this.analyticsStore.avgTimeOnSkills = Array.isArray(data)
                    ? data
                    : [];
                for (
                    let i = 0;
                    i < this.analyticsStore.avgTimeOnSkills.length;
                    i++
                ) {
                    this.analyticsStore.avgTimeOnSkills[i].minutes =
                        this.millisToMinutesAndSeconds(
                            this.analyticsStore.avgTimeOnSkills[i].milliseconds
                        );
                }
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.avgTimeOnSkills = [];
            }
        },
        async getTenantDuration() {
            this.analyticsStore.durationPerDay = [];
            let url = `/student-analytics/tenant-duration-per-day/${this.dataMode}/${this.tenantId}`;
            fetch(url)
                .then((response) => response.json())
                .then(async (data) => {
                    this.analyticsStore.durationPerDay = [];
                    for (let i = 0; i < data.length; i++) {
                        data[i].date = new Date(data[i].date);
                        data[i].minutes = data[i].milliseconds / (1000 * 60);
                        this.analyticsStore.durationPerDay.push(data[i]);
                    }
                    this.analyticsStore.durationPerDay.sort(
                        (a, b) => a.date - b.date
                    );
                })
                .catch((error) => {
                    console.error('Error fetching student progress:', error);
                });
        },
        async getPercentageStudentsMasteredOneSkill() {
            this.analyticsStore.percentageStudentsMasteredOneSkill = [];
            try {
                let url = `/student-analytics/percentage-students-mastered-one-skill/tenant/${this.dataMode}/${this.tenantId}`;
                let response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.analyticsStore.percentageStudentsMasteredOneSkill =
                    await response.json();
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.analyticsStore.percentageStudentsMasteredOneSkill = [];
            }
        },
        // Utilities
        millisToMinutesAndSeconds(millis) {
            var minutes = Math.floor(millis / 60000);
            var seconds = ((millis % 60000) / 1000).toFixed(0);
            return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        },
        downloadData(data, name) {
            const headers = Object.keys(data[0]);
            console.log(headers);
            const csvRows = [];
            csvRows.push(headers.join(','));
            for (const row of data) {
                const values = headers.map((h) => {
                    const val = row[h];
                    return `"${String(val).replace(/"/g, '""')}"`; // Escape quotes
                });
                csvRows.push(values.join(','));
            }
            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], {
                type: 'text/csv;charset=utf-8;'
            });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = name + '.csv';
            link.click();
        },
        async toggleWeeklyCumulativeData() {
            if (this.dataMode == 'total') this.dataMode = 'weekly';
            else this.dataMode = 'total';

            await this.getTenantDuration();
            await this.getPercentageStudentsMasteredOneSkill();
        }
    }
};
</script>

<template>
    <div class="container">
        <span class="d-flex justify-content-between w-100 mb-2">
            <h1 class="heading">Engagement Report</h1>
            <span>
                <!-- Filter Buttons -->
                <div
                    class="btn-group d-flex d-sm-inline-flex mt-2"
                    role="group"
                >
                    <input
                        type="radio"
                        class="btn-check"
                        name="timeFilter1"
                        id="total1"
                        @click="toggleWeeklyCumulativeData"
                        checked
                    />
                    <label
                        class="btn btn-outline-dark btn-sm filter-btn"
                        for="total1"
                        >Total</label
                    >
                    <input
                        type="radio"
                        class="btn-check"
                        name="timeFilter1"
                        id="week1"
                        @click="toggleWeeklyCumulativeData"
                    />
                    <label
                        class="btn btn-outline-dark btn-sm filter-btn"
                        for="week1"
                        >This week</label
                    >
                </div>
                <!-- Tutorial button -->
                <button
                    class="btn me-1"
                    @click="restartTutorial"
                    aria-label="info"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 192 512"
                        width="20"
                        height="23"
                        class="primary-icon"
                    >
                        <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                        <path
                            d="M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 224 32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0 0-192-32 0c-17.7 0-32-14.3-32-32z"
                        />
                    </svg>
                </button>
            </span>
        </span>

        <!-- Tutorial modal for initial introduction -->
        <div v-if="showTutorialTip1" class="modal">
            <div class="modal-content">
                <p class="modal-text">
                    The School Admin Engagement Report provides comprehensive
                    analytics on student engagement and platform usage across
                    your school. You can download chart data as CSV files using
                    the download buttons next to each chart, and toggle between
                    cumulative (total) and weekly data views using the filter
                    buttons at the top right.
                </p>
                <div class="d-flex justify-content-between">
                    <button
                        class="btn primary-btn"
                        @click="progressTutorial(1)"
                    >
                        close
                    </button>
                </div>
            </div>
        </div>

        <div class="chart">
            <h2 class="h4 heading d-flex justify-content-between">
                Time per day
                <button
                    class="btn"
                    @click="
                        downloadData(
                            analyticsStore.durationPerDay,
                            'Time-per-day'
                        )
                    "
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 384 512"
                        width="18"
                        height="18"
                    >
                        <!-- Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                        <path
                            d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"
                        />
                    </svg>
                </button>
            </h2>
            <TenantDurationPerDayLineChart
                v-if="analyticsStore.durationPerDay.length > 0"
                :data="analyticsStore.durationPerDay"
                colour="#5f31dd"
                class="mb-5"
            />
            <div v-else style="height: 500px">No data yet</div>
        </div>
        <hr class="mt-5 mb-5" />
        <div class="row">
            <h2 class="h4 heading d-flex justify-content-between">
                Average interaction time per skill
                <button
                    class="btn"
                    @click="
                        downloadData(
                            analyticsStore.avgTimeOnSkills,
                            'Avg-time-per-skill'
                        )
                    "
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 384 512"
                        width="18"
                        height="18"
                    >
                        <!-- Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                        <path
                            d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"
                        />
                    </svg>
                </button>
            </h2>
            <TenantAvgInteractionTimePerSkillHorizontalBarChart
                v-if="analyticsStore.avgTimeOnSkills.length > 0"
                :data="analyticsStore.avgTimeOnSkills"
                colour="purple"
                class=""
            />
            <p v-else>No data yet</p>
        </div>
        <hr class="mt-5 mb-5" />
        <div class="row">
            <h2 class="h4 heading d-flex justify-content-between">
                Students who completed at least one skill
                <button
                    class="btn"
                    @click="
                        downloadData(
                            analyticsStore.percentageStudentsMasteredOneSkill,
                            'Percentage-students-completed-one-skill'
                        )
                    "
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 384 512"
                        width="18"
                        height="18"
                    >
                        <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                        <path
                            d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"
                        />
                    </svg>
                </button>
            </h2>
            <TenantPercentageStudentsMasteredAtLeastOneSkillPieChart
                v-if="
                    analyticsStore.percentageStudentsMasteredOneSkill.length > 0
                "
                :data="analyticsStore.percentageStudentsMasteredOneSkill"
                class="mb-5"
            />
            <p v-else class="mb-5">No data yet</p>
        </div>
    </div>
</template>

<style scoped>
/* Modals */
.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 2000;
    /* Sit on top */
    left: 0;
    top: 0;
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    overflow: auto;
    /* Enable scroll if needed */
    background-color: rgb(0, 0, 0);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
}

/* Modal Content/Box */
.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 520px;
    font-size: 18px;
    /* Could be more or less, depending on screen size */
}

/* Specific phone view css */
@media (max-width: 576px) {
    .modal-content {
        margin-top: 100%;
        width: 90%;
    }
}

/* ************************* */
/* Tablet Styling */
@media (min-width: 577px) and (max-width: 1023px) {
    .modal-content {
        width: 70%;
    }

    .modal-btn {
        width: fit-content;
    }
}

/* Small devices (portrait phones) */
@media (max-width: 480px) {
    /* Modal Content/Box */
    .modal-content {
        width: 90% !important;
        margin: auto;
        margin-top: 30%;
    }
}
/* Main Tab Styling */
.tab-btn {
    background-color: #f8f9fa;
    color: #6c757d;
    border: 1px solid #dee2e6;
    border-bottom-color: transparent;
    font-weight: 500;
    opacity: 0.8;
    transition: all 0.3s ease;
    position: relative;
}

.tab-btn:hover {
    background-color: #e9ecef;
    color: #495057;
    opacity: 1;
    transform: translateY(-1px);
    /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); */
}

.tab-btn.active {
    background-color: var(--primary-color);
    color: var(--primary-contrast-color);
    border-color: var(--primary-color) var(--primary-color) #fff;
    opacity: 1;
    /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25); */
}

/* Filter Button Styling */
.filter-btn {
    transition: all 0.2s ease;
}

.filter-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-check:checked + .filter-btn {
    background-color: #495057;
    border-color: #495057;
    color: white;
    box-shadow: 0 2px 6px rgba(73, 80, 87, 0.25);
}

/* Touch Device Optimizations */
@media (hover: none) and (pointer: coarse) {
    .tab-btn:hover,
    .filter-btn:hover {
        transform: none;
        box-shadow: none;
    }

    .tab-btn,
    .filter-btn {
        min-height: 44px;
    }
}

/* Mobile Responsive */
@media (max-width: 576px) {
    .nav.nav-tabs {
        flex-direction: column;
        border-bottom: none;
    }

    .tab-btn {
        width: 100%;
        margin-bottom: 0.25rem;
        border-radius: 0.5rem;
        border-bottom-color: #dee2e6;
        text-align: center;
    }

    .tab-btn.active {
        border-color: var(--primary-color);
    }
}

/* Tooltips */
.hovering-info-panel {
    position: absolute;
    z-index: 100;
    /* border-color: var(--primary-color);
    border-width: 2px;
    border-style: solid; */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    width: fit-content;
    margin-bottom: 0 !important; /* Remove any margin that might push content */
}

.narrow-info-panel {
    width: 300px;
}
</style>
