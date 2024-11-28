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
    <div
        id="legend"
        class="collapsible-tree-legend container-fluid p-2 position-relative"
    >
        <div class="position-absolute legend-div">
            <div class="mobile-legend">
                <div class="legend row">
                    <div class="col-8">
                        <div class="col">
                            <button class="btn">
                                <span class="grade-school"></span>Grade school
                            </button>
                        </div>
                        <div class="col">
                            <button class="btn">
                                <span class="middle-school"></span> Middle
                                school
                            </button>
                        </div>
                        <div class="col">
                            <button class="btn">
                                <span class="high-school"></span> High school
                            </button>
                        </div>
                        <div class="col">
                            <button class="btn">
                                <span class="college"></span> College
                            </button>
                        </div>
                        <div class="col">
                            <button class="btn">
                                <span class="phd"></span> PHD
                            </button>
                        </div>
                    </div>
                    <div class="col-4 d-flex flex-column align-items-end">
                        <button
                            id="print-btn"
                            class="btn btn-info"
                            @click="$refs.childComponent.printPDF()"
                        >
                            Print
                        </button>
                        <button
                            id="reset-btn"
                            class="btn btn-primary"
                            @click="resetPos()"
                        >
                            Reset
                        </button>
                    </div>
                </div>
                <div class="search-mobile-row">
                    <!-- Search Feature -->
                    <SkillTreeSearchBar
                        :findNode="handleChooseResult"
                        :clearResults="clearResult"
                    />
                </div>
            </div>
            <div class="tablet-and-up-legend">
                <div class="legend row">
                    <div class="col d-flex align-items-center">
                        <button class="btn">
                            <span class="grade-school"></span>Grade school
                        </button>
                    </div>
                    <div class="col d-flex align-items-center">
                        <button class="btn">
                            <span class="middle-school"></span> Middle school
                        </button>
                    </div>
                    <div class="col d-flex align-items-center">
                        <button class="btn">
                            <span class="high-school"></span> High school
                        </button>
                    </div>
                    <div class="col d-flex align-items-center">
                        <button class="btn">
                            <span class="college"></span> College
                        </button>
                    </div>
                    <div class="col d-flex align-items-center">
                        <button class="btn">
                            <span class="phd"></span> PHD
                        </button>
                    </div>

                    <div
                        class="col-12 col-lg-4 d-flex justify-content-end align-items-center gap-2 mt-0 mt-md-2 mt-lg-0"
                    >
                        <!-- Search Feature -->
                        <SkillTreeSearchBar
                            :findNode="handleChooseResult"
                            :clearResults="clearResult"
                        />
                        <button
                            id="print-btn"
                            class="btn btn-info me-3"
                            @click="$refs.childComponent.printPDF()"
                        >
                            Print
                        </button>
                    </div>
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
</template>

<style>
#legend {
    height: 60px;
}

#legend .btn {
    color: white;
}

.legend-div {
    height: auto;
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

#thin-purple-banner {
    height: 2px;
    background-color: #a48be640;
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

#print-btn {
    background-color: #184e80;
    border: #184e80;
    color: white;
    width: 70px;
    max-height: 40px;
}

#print-btn:hover {
    background-color: #133b61;
}

#reset-btn {
    background-color: #c4d2df;
    border-color: #c4d2df;
    color: black;
    width: 70px;
    max-height: 40px;
}

#reset-btn:hover {
    background-color: #9da7b1;
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
        display: block;
    }

    .tablet-and-up-legend {
        display: none;
    }

    #print-btn {
        margin-bottom: 5px;
    }

    #legend {
        height: 180px;
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

    #legend {
        height: 90px;
    }

    .tablet-and-up-legend {
        display: block;
    }
    .legend {
        align-items: center;
    }

    .legend .col {
        display: flex;
    }
    .legend span {
        flex-shrink: 0;
    }

    .search-bar {
        width: 100%;
    }
}
</style>
