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
        },
        expandAllNodes() {
            this.$refs.childComponent.expandAllChildren();
        }
    },
    computed: {
        findNodeResults() {
            if (
                this.lastChooseResult === this.searchText ||
                this.searchText.length === 0
            ) {
                return [];
            }
            this.$refs.childComponent.showSkillPanel = false;
            const results = this.$refs.childComponent.findNodeWithName(
                this.searchText.toLocaleLowerCase()
            );

            const capitalizeText = (text, charIndex) =>
                text &&
                text.slice(0, charIndex) +
                    text[charIndex].toUpperCase() +
                    text.slice(charIndex + 1);

            const highlightedResult = results.map((result) => {
                const hightLightedText = result.data.skill_name
                    .toLocaleLowerCase()
                    .replace(
                        this.searchText.toLocaleLowerCase(),
                        `<span class="hightLight">${this.searchText}</span>`
                    );

                // index of first character if we have span at the head of the string is 25
                const indexOfFirstChar = hightLightedText[0] === '<' ? 25 : 0;

                return {
                    ...result,
                    // capitalize text better ui and ux
                    highlightedResult: capitalizeText(
                        hightLightedText,
                        indexOfFirstChar
                    )
                };
            });
            return highlightedResult;
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
                            id="reset-btn"
                            class="btn btn-primary me-3"
                            @click="resetPos()"
                        >
                            Reset
                        </button>
                        <button
                            v-if="sessionDetailsStore.isLoggedIn"
                            class="btn legend-btn me-3 mt-1"
                            @click="expandAllNodes()"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                                width="20"
                                height="20"
                            >
                                <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                <path
                                    d="M32 32C14.3 32 0 46.3 0 64l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96z"
                                    fill="white"
                                />
                            </svg>
                        </button>
                        <button
                            v-if="sessionDetailsStore.isLoggedIn"
                            class="legend-btn btn mt-1 me-3"
                            @click="$refs.childComponent.printPDF()"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                width="19"
                                height="18"
                            >
                                <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                <path
                                    d="M128 0C92.7 0 64 28.7 64 64l0 96 64 0 0-96 226.7 0L384 93.3l0 66.7 64 0 0-66.7c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0L128 0zM384 352l0 32 0 64-256 0 0-64 0-16 0-16 256 0zm64 32l32 0c17.7 0 32-14.3 32-32l0-96c0-35.3-28.7-64-64-64L64 192c-35.3 0-64 28.7-64 64l0 96c0 17.7 14.3 32 32 32l32 0 0 64c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-64zM432 248a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"
                                    fill="white"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="search-mobile-row">
                    <!-- Search feature -->
                    <div
                        :class="[
                            'search-bar mt-3',
                            findNodeResults.length > 0 && 'have-results'
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
                                v-if="findNodeResults.length > 0"
                                class="search-results"
                            >
                                <button
                                    @click="handleChooseResult(result)"
                                    class="result-row"
                                    v-for="result in findNodeResults"
                                    v-html="result.highlightedResult"
                                ></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="tablet-and-up-legend">
                <div class="legend row">
                    <div class="col d-flex align-items-center">
                        <span class="grade-school"></span>Grade school
                    </div>
                    <div class="col d-flex align-items-center">
                        <span class="middle-school"></span> Middle school
                    </div>
                    <div class="col d-flex align-items-center">
                        <span class="high-school"></span> High school
                    </div>
                    <div class="col d-flex align-items-center">
                        <span class="college"></span> College
                    </div>
                    <div class="col d-flex align-items-center">
                        <span class="phd"></span> PHD
                    </div>
                    <div
                        class="col-12 col-lg-4 d-flex justify-content-end align-items-center gap-2 mt-0 mt-md-2 mt-lg-0"
                    >
                        <!-- Search Feature -->
                        <div
                            :class="[
                                'search-bar w-100',
                                findNodeResults.length > 0 && 'have-results'
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
                                    v-if="findNodeResults.length > 0"
                                    class="search-results"
                                >
                                    <button
                                        @click="handleChooseResult(result)"
                                        class="result-row"
                                        v-for="result in findNodeResults"
                                        v-html="result.highlightedResult"
                                    ></button>
                                </div>
                            </div>
                        </div>

                        <button
                            id="reset-btn"
                            class="btn btn-primary me-1"
                            @click="resetPos()"
                        >
                            Reset
                        </button>
                        <button
                            v-if="sessionDetailsStore.isLoggedIn"
                            class="btn legend-btn me-1"
                            @click="expandAllNodes()"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                                width="20"
                                height="20"
                            >
                                <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                <path
                                    d="M32 32C14.3 32 0 46.3 0 64l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96z"
                                    fill="white"
                                />
                            </svg>
                        </button>
                        <button
                            v-if="sessionDetailsStore.isLoggedIn"
                            class="btn legend-btn me-3"
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
    /* extremely  weird things when 100% does not match the parent div*/
    width: 100.3%;
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

.result-row:focus {
    border: 1px solid #133b61;
}

#legend {
    height: 60px;
}

#mobile-legend {
    display: none;
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

.legend-btn {
    background-color: #184e80;
    border: #184e80;
    color: white;
    max-height: 40px;
}

.legend-btn:hover {
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

.skill-tree-input {
    width: 100%;
}

/* Small devices (portrait phones) */
@media (max-width: 480px) {
    #mobile-legend {
        display: block;
    }

    #tablet-and-up-legend {
        display: none;
    }

    #legend {
        height: 190px;
    }

    .search-mobile-row {
        width: 96%;
        margin-left: 0px;
        margin-right: auto;
    }
}

/* Bigger devices ( Tablet ) */
@media (min-width: 481px) and (max-width: 1024px) {
    #legend {
        height: 90px;
    }

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

    .search-bar {
        width: 100%;
    }
}
/*---*/
</style>
