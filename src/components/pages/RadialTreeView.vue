<script>
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';
import SkillTreeSearchBar from '../components/skills-tree-search-bar/SkillTreeSearchBar.vue';
import RadialTree from '../components/skilltrees/RadialTree.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    data() {
        return {
            gradeFilter: this.userDetailsStore.skillTreeLevel
        };
    },
    created() {
        console.log(this.userDetailsStore.skillTreeLevel);
    },
    components: { RadialTree, SkillTreeSearchBar },
    methods: {
        handleChooseResult(resultName) {
            // Find the node with name
            const node = this.$refs.childComponent.findNodeWithName(
                resultName.toLowerCase()
            );
            if (!node) {
                console.error('Cannot find node with name: ' + resultName);
                return false;
            }
            // go to the skill position
            this.$refs.childComponent.goToLocation(node);
        },
        clearResult() {
            this.$refs.childComponent.resetPos();
        }
    }
};
</script>

<template>
    <div class="container-fluid position-absolute legend-div">
        <div class="mobile-legend">
            <div class="search-mobile-row me-2">
                <!-- Search Feature -->
                <SkillTreeSearchBar
                    :findNode="handleChooseResult"
                    :clearResults="clearResult"
                />
            </div>
            <div class="d-flex justify-content-end">
                <!-- <button
                    class="btn legend-btn me-2"
                    @click="$refs.childComponent.printPDF()"
                >
                    Print
                </button> -->
                <button class="btn primary-btn" @click="resetPos()">
                    Reset
                </button>
            </div>
        </div>
        <div class="tablet-and-up-legend">
            <div class="d-flex justify-content-between">
                <!-- Search bar, reset, expand all, print buttons -->
                <div class="d-flex col-lg justify-content-between">
                    <!-- Search Feature -->
                    <SkillTreeSearchBar
                        class="me-2"
                        :findNode="handleChooseResult"
                        :clearResults="clearResult"
                    />
                    <!-- Print Button -->
                    <button
                        class="btn primary-btn me-2"
                        @click="$refs.childComponent.printPDF()"
                    >
                        Print
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Display loading screen while asynchronous call is made. -->
    <Suspense>
        <template #default>
            <RadialTree ref="childComponent" />
        </template>
        <template #fallback>
            <span>Loading...</span>
        </template>
    </Suspense>
    <div class="position-absolute bottom-legend-div">
        <div class="tablet-and-up-legend">
            <div class="d-flex legend">
                <!-- Grade buttons -->
                <button
                    class="btn grade-school me-2"
                    :class="{
                        'active-grade-filter': gradeFilter == 'grade_school'
                    }"
                    @click="
                        this.gradeFilter = 'grade_school';
                        $refs.childComponent.truncateToGradeLevel(
                            'grade_school'
                        );
                    "
                >
                    Grade school
                </button>
                <button
                    class="btn middle-school me-2"
                    :class="{
                        'active-grade-filter': gradeFilter == 'middle_school'
                    }"
                    @click="
                        this.gradeFilter = 'middle_school';
                        $refs.childComponent.truncateToGradeLevel(
                            'middle_school'
                        );
                    "
                >
                    Middle school
                </button>
                <button
                    class="btn high-school me-2"
                    :class="{
                        'active-grade-filter': gradeFilter == 'high_school'
                    }"
                    @click="
                        this.gradeFilter = 'high_school';
                        $refs.childComponent.truncateToGradeLevel(
                            'high_school'
                        );
                    "
                >
                    High school
                </button>
                <button
                    class="btn college me-2"
                    :class="{
                        'active-grade-filter': gradeFilter == 'college'
                    }"
                    @click="
                        this.gradeFilter = 'college';
                        $refs.childComponent.truncateToGradeLevel('college');
                    "
                >
                    College
                </button>
                <button
                    class="btn phd me-2"
                    :class="{
                        'active-grade-filter': gradeFilter == 'phd'
                    }"
                    @click="
                        this.gradeFilter = 'phd';
                        $refs.childComponent.truncateToGradeLevel('phd');
                    "
                >
                    PHD
                </button>
            </div>
        </div>
    </div>
</template>

<style>
/*
 * Filters 
 */

/* Grade level filter */
.grade-school {
    background-color: #40e0d0;
    opacity: 0.5;
    color: black;
}
.grade-school:hover,
.grade-school:active,
.grade-school:focus {
    background-color: #40e0d0;
    opacity: 1;
    color: black !important;
}
.grade-school.active-grade-filter {
    opacity: 1;
}

.middle-school {
    background-color: #33a133;
    opacity: 0.5;
}
.middle-school:hover,
.middle-school:active,
.middle-school:focus {
    background-color: #33a133;
    opacity: 1;
    color: black !important;
}
.middle-school.active-grade-filter {
    opacity: 1;
}

.high-school {
    background-color: #ffd700;
    opacity: 0.5;
    color: black;
}
.high-school:hover,
.high-school:active,
.high-school:focus {
    background-color: #ffd700;
    opacity: 1;
    color: black !important;
}
.high-school.active-grade-filter {
    opacity: 1;
}

.college {
    background-color: #ffa500;
    opacity: 0.5;
}
.college:hover,
.college:active,
.college:focus {
    background-color: #ffa500;
    opacity: 1;
    color: black !important;
}
.college.active-grade-filter {
    opacity: 1;
}

.phd {
    background-color: #ff0000;
    opacity: 0.5;
}
.phd:hover,
.phd:active,
.phd:focus {
    background-color: #ff0000;
    opacity: 1;
    color: black !important;
}
.phd.active-grade-filter {
    opacity: 1;
}

.switch-btn {
    max-height: 38px;
    margin: auto;
}

.bottom-legend-div {
    left: 50%;
    transform: translateX(-50%);
    bottom: 10px;
}

.bottom-legend-div .btn {
    color: black;
}

.legend-div {
    z-index: 2;
    width: 100%;
    top: 70px;
}

#info-button {
    width: 50px;
    height: 20px;
    padding: 0px;
    float: right;
}

#info-button svg {
    width: 25px;
    height: 15px;
    margin-bottom: 8px;
}

.collapsible-tree-legend {
    width: 100%;
}

.legend span {
    float: left;
    width: 20px;
    height: 20px;
    margin: 2px;
    border-radius: 50%;
}

.hightLight {
    font-weight: 500;
    color: #9985d1;
    float: none !important;
    width: auto !important;
    height: auto !important;
    margin: 0px !important;
    border-radius: 0px !important;
    border: 0px !important;
}

.legend .btn {
    color: black;
    font-weight: 500;
    border: 1px solid black;
}

.legend {
    align-items: center;
    justify-content: center;
}

.search-bar {
    display: flex;
    flex-direction: column;
    border: 1px solid #dce2f2;
    border-radius: 8px;
}

.have-results {
    border-bottom: 0px !important ;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
}
.skill-tree-input {
    outline: none;
    border: 0px;
}

.search-results {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 0;
    left: -1px;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    border-bottom: 1px solid #dce2f2;
    border-right: 1px solid #dce2f2;
    border-left: 1px solid #dce2f2;
    background-color: white;
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;
    width: 101%;
}

.result-row {
    padding: 4px;
    cursor: pointer;
    color: #6e6e6e;
    background-color: inherit;
    border: 0px;
    text-align: left;
}

.result-row:hover,
.result-row:focus {
    background-color: #f3f5f6;
    color: black;
}

.mobile-legend {
    display: none;
}

.skill-tree-input {
    width: 100%;
}

/* X-Small devices (portrait phones, less than 576px) */
@media (max-width: 480px) {
    .mobile-legend {
        display: flex;
        width: 100%;
        justify-content: space-between;
    }

    .tablet-and-up-legend {
        display: none;
    }

    .search-mobile-row {
        width: 96%;
        margin-left: 0px;
        margin-right: auto;
    }
}

/* Bigger devices */
@media (min-width: 481px) and (max-width: 1024px) {
    .mobile-legend {
        display: none;
    }

    .tablet-and-up-legend {
        display: block;
    }

    .legend .col {
        display: flex;
    }
    .legend span {
        flex-shrink: 0;
    }

    .search-bar {
    }
}
</style>
