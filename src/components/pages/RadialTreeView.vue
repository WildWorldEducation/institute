<script>
import SkillTreeSearchBar from '../components/skills-tree-search-bar/SkillTreeSearchBar.vue';
import RadialTree from '../components/skilltrees/RadialTree.vue';

export default {
    setup() {},
    data() {
        return {};
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
            <div class="search-mobile-row">
                <!-- Search Feature -->
                <SkillTreeSearchBar
                    :findNode="handleChooseResult"
                    :clearResults="clearResult"
                />
            </div>
            <div class="d-flex justify-content-end">
                <button
                    class="btn legend-btn me-2"
                    @click="$refs.childComponent.printPDF()"
                >
                    Print
                </button>
                <button class="btn legend-btn me-2" @click="resetPos()">
                    Reset
                </button>
            </div>
        </div>
        <div class="tablet-and-up-legend">
            <div class="legend d-flex justify-content-between row">
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
                        class="btn legend-btn me-2"
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
        <div class="mobile-legend">
            <div class="legend d-flex">
                <div>
                    <button
                        class="btn grade-school me-1"
                        @click="
                            $refs.childComponent.truncateToGradeLevel(
                                'grade_school'
                            )
                        "
                    >
                        GS
                    </button>
                    <button
                        class="btn middle-school me-1"
                        @click="
                            $refs.childComponent.truncateToGradeLevel(
                                'middle_school'
                            )
                        "
                    >
                        MS
                    </button>
                </div>
                <div>
                    <button
                        class="btn high-school me-1"
                        @click="
                            $refs.childComponent.truncateToGradeLevel(
                                'high_school'
                            )
                        "
                    >
                        HS
                    </button>
                    <button
                        class="btn college me-1"
                        @click="
                            $refs.childComponent.truncateToGradeLevel('college')
                        "
                    >
                        C
                    </button>
                    <button
                        @click="
                            $refs.childComponent.truncateToGradeLevel('phd')
                        "
                        class="btn phd"
                    >
                        PHD
                    </button>
                </div>
            </div>
        </div>
        <div class="tablet-and-up-legend">
            <div class="d-flex legend">
                <!-- Grade buttons -->
                <button
                    class="btn grade-school me-2"
                    @click="
                        $refs.childComponent.truncateToGradeLevel(
                            'grade_school'
                        )
                    "
                >
                    Grade school
                </button>
                <button
                    class="btn middle-school me-2"
                    @click="
                        $refs.childComponent.truncateToGradeLevel(
                            'middle_school'
                        )
                    "
                >
                    Middle school
                </button>
                <button
                    class="btn high-school me-2"
                    @click="
                        $refs.childComponent.truncateToGradeLevel('high_school')
                    "
                >
                    High school
                </button>
                <button
                    class="btn college me-2"
                    @click="
                        $refs.childComponent.truncateToGradeLevel('college')
                    "
                >
                    College
                </button>
                <button
                    class="btn phd me-2"
                    @click="$refs.childComponent.truncateToGradeLevel('phd')"
                >
                    PHD
                </button>
            </div>
        </div>
    </div>
</template>

<style>
.bottom-legend-div {
    width: 100%;
    bottom: 10px;
}

#legend .btn {
    color: white;
}

.legend-div {
    z-index: 2;
    width: 100%;
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

/* Grade level legend */

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

/* Level colors */
.legend .grade-school {
    background-color: #40e0d0;
}
.legend .middle-school {
    background-color: #33a133;
}
.legend .high-school {
    background-color: #ffd700;
}
.legend .college {
    background-color: #ffa500;
}
.legend .phd {
    background-color: #ff0000;
}

.legend .btn {
    color: white;
}

.legend {
    align-items: center;
    justify-content: center;
}

.legend-btn {
    background-color: #184e80;
    border: #184e80;
    color: white;
    max-height: 40px;
}

.legend-btn:hover {
    background-color: #133b61;
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
