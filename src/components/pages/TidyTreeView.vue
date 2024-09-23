<script>
import { useSessionDetailsStore } from '../../stores/SessionDetailsStore.js';
import TidyTree from '../components/skilltrees/TidyTree.vue';
import TidyTreeNoAccount from '../components/skilltrees/TidyTreeNoAccount.vue';

export default {
    setup() {
        const sessionDetailsStore = useSessionDetailsStore();

        return {
            sessionDetailsStore
        };
    },
    data() {
        return {
            searchText: '',
            lastChooseResult: '',
            showResult: false
        };
    },
    created() {},
    components: { TidyTree, TidyTreeNoAccount },
    methods: {
        resetPos() {
            this.$refs.childComponent.resetPos();
        },
        handleChooseResult(node) {
            this.searchText = node.data.skill_name;
            this.lastChooseResult = node.data.skill_name;
            // go to the skill position
            this.$refs.childComponent.goToLocation(node);
            // also open the skill requirement mastery div
            this.$refs.childComponent.showSkillPanelComponent(node);
        }
        // // Toggle info bar.
        // ToggleInfobar() {
        //     if (document.getElementById('legend').style.display == 'none') {
        //         document.getElementById('legend').style.display = 'block';
        //     } else {
        //         document.getElementById('legend').style.display = 'none';
        //     }
        // }
    },
    computed: {
        findNodeResults() {
            if (this.lastChooseResult === this.searchText) {
                return [];
            }
            // close the mastery requirement panel when showing search result
            this.$refs.childComponent.showSkillPanel = false;
            const results = this.$refs.childComponent.findNodeWithName(
                this.searchText.toLocaleLowerCase()
            );
            return results;
        }
    },
    watch: {
        searchText: {
            handler(newVal) {
                if (newVal === '') {
                    this.$refs.childComponent.showSkillPanel = false;
                    this.$refs.childComponent.resetPos();
                }
            }
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
            <div id="mobile-legend">
                <div class="legend row">
                    <div class="col-8">
                        <div class="col">
                            <span class="grade-school"></span>Grade school
                        </div>
                        <div class="col">
                            <span class="middle-school"></span> Middle school
                        </div>
                        <div class="col">
                            <span class="high-school"></span> High school
                        </div>
                        <div class="col">
                            <span class="college"></span> College
                        </div>
                        <div class="col"><span class="phd"></span> PHD</div>
                    </div>
                    <div class="col-4 d-flex flex-column align-items-end">
                        <button
                            v-if="sessionDetailsStore.isLoggedIn"
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
            </div>
            <div id="tablet-and-up-legend">
                <div class="legend row">
                    <div class="col">
                        <span class="grade-school"></span>Grade school
                    </div>
                    <div class="col">
                        <span class="middle-school"></span> Middle school
                    </div>
                    <div class="col">
                        <span class="high-school"></span> High school
                    </div>
                    <div class="col"><span class="college"></span> College</div>
                    <div class="col"><span class="phd"></span> PHD</div>
                    <div
                        class="col d-flex justify-content-end align-items-center gap-2"
                    >
                        <!-- Search Feature -->
                        <div
                            :class="[
                                'search-bar',
                                searchText.length > 0 && 'have-results'
                            ]"
                        >
                            <div class="d-flex align-items-center p-1">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    width="15"
                                    height="15"
                                    fill="#5f6368"
                                    class="me-2"
                                >
                                    <path
                                        d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
                                    />
                                </svg>
                                <input
                                    id="skill-tree-search-text"
                                    type="text"
                                    class="skill-tree-input"
                                    placeholder="Skill Name"
                                    v-model="searchText"
                                />
                            </div>
                            <div class="position-relative">
                                <div
                                    v-if="searchText.length"
                                    class="search-results"
                                >
                                    <div
                                        @click="handleChooseResult(result)"
                                        class="result-row"
                                        v-for="result in findNodeResults"
                                    >
                                        {{ result.data.skill_name }}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            v-if="sessionDetailsStore.isLoggedIn"
                            id="print-btn"
                            class="btn btn-info me-3"
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
            </div>
        </div>
    </div>
    <!-- Display loading screen while asynchronous call is made. -->
    <Suspense>
        <template #default>
            <TidyTree
                v-if="sessionDetailsStore.isLoggedIn"
                ref="childComponent"
            />
            <TidyTreeNoAccount v-else ref="childComponent" />
        </template>
        <template #fallback>
            <span>Loading...</span>
        </template>
    </Suspense>
</template>

<style>
#legend {
    height: 60px;
    border-bottom: 2px #a48be640 solid;
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
}

.result-row:hover {
    background-color: #f3f5f6;
}

/* Small devices (portrait phones) */
@media (max-width: 800px) {
    #mobile-legend {
        display: block;
    }

    #tablet-and-up-legend {
        display: none;
    }

    #print-btn {
        margin-bottom: 5px;
    }
}

/* Bigger devices */
@media (min-width: 801px) {
    #mobile-legend {
        display: none;
    }

    #tablet-and-up-legend {
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
}

.legend span {
    float: left;
    width: 20px;
    height: 20px;
    margin: 2px;
    border-radius: 50%;
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

/*---*/
</style>
