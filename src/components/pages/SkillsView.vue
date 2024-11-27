<script>
import SkillsListParent from '../components/SkillsListParent.vue';

// Import the store
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';
import SkillTreeSearchBar from '../components/skills-tree-search-bar/SkillTreeSearchBar.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();

        return {
            userDetailsStore
        };
    },
    data() {
        return {
            isInstructorMode: false,
            searchText: '',
            resultsSkills: [],
            chooseResult: null,
            // flag to make watcher do not react when user choose a result
            updateChooseResult: false,
            nameList: []
        };
    },
    components: {
        SkillsListParent,
        SkillTreeSearchBar
    },

    methods: {
        clearResults() {
            this.$refs.skillList.path = [];
        },
        findNode(skillName) {
            this.$refs.skillList.findNode(skillName);
        }
    }
};
</script>

<template>
    <div v-if="!isInstructorMode" class="topnav" id="skill-nav">
        <router-link class="btn primary-btn" to="/skills/add"
            ><span v-if="userDetailsStore.role == 'admin'">Add&nbsp;</span>
            <span v-else>Submit new skill for review&nbsp;</span>
            <!-- Plus sign -->
            <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M6.34811 20.0423L6.34811 13.6494L-0.0358702 13.6583C-0.320945 13.6579 -0.594203 13.5444 -0.795782 13.3428C-0.997361 13.1412 -1.11082 12.868 -1.11132 12.5829L-1.11729 7.41477C-1.1168 7.1297 -1.00334 6.85644 -0.801757 6.65486C-0.600179 6.45328 -0.326921 6.33982 -0.0418461 6.33933L6.3481 6.34231L6.3481 -0.0506238C6.34659 -0.193451 6.3736 -0.335145 6.42756 -0.467396C6.48152 -0.599646 6.56134 -0.719794 6.66234 -0.820794C6.76334 -0.921794 6.88349 -1.00161 7.01574 -1.05557C7.14799 -1.10953 7.28969 -1.13655 7.43251 -1.13503L12.5827 -1.12308C12.8678 -1.12259 13.141 -1.00913 13.3426 -0.807549C13.5442 -0.60597 13.6577 -0.332713 13.6582 -0.047637L13.6552 6.34231L20.0481 6.34231C20.3325 6.34248 20.6052 6.45552 20.8063 6.65661C21.0074 6.8577 21.1204 7.13039 21.1206 7.41477L21.1325 12.565C21.1324 12.8494 21.0193 13.122 20.8182 13.3231C20.6171 13.5242 20.3444 13.6373 20.0601 13.6374L13.6552 13.6494L13.6641 20.0334C13.6636 20.3184 13.5502 20.5917 13.3486 20.7933C13.147 20.9948 12.8738 21.1083 12.5887 21.1088L7.43252 21.1267C7.28969 21.1282 7.148 21.1012 7.01575 21.0473C6.88349 20.9933 6.76335 20.9135 6.66235 20.8125C6.56135 20.7115 6.48153 20.5913 6.42757 20.4591C6.37361 20.3268 6.34659 20.1851 6.34811 20.0423Z"
                    fill="white"
                />
            </svg>
        </router-link>
        <div v-if="userDetailsStore.role == 'admin'" class="d-flex gap-2">
            <router-link class="btn primary-btn" to="/tags"
                >Skill Filters</router-link
            >
        </div>
    </div>
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
                </div>
                <div class="search-mobile-row">
                    <!-- Search Feature -->
                    <!-- <CollapsibleTreeSearchBar
                        :findNode="findNode"
                        :nameList="nameList"
                        :clearResults="clearResults"
                    /> -->
                    <SkillTreeSearchBar
                        :findNode="findNode"
                        :clearResults="clearResults"
                    />
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
                        class="col-12 col-lg-3 d-flex justify-content-center align-items-center gap-2 mt-0 mt-md-2 mt-lg-0"
                    >
                        <!-- Search Feature -->
                        <!-- <CollapsibleTreeSearchBar
                            :findNode="findNode"
                            :nameList="nameList"
                            :clearResults="clearResults"
                        /> -->
                        <SkillTreeSearchBar
                            :findNode="findNode"
                            :clearResults="clearResults"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>

    <SkillsListParent ref="skillList" />
</template>

<style scoped>
#legend {
    height: 60px;
    border-bottom: 2px #a48be640 solid;
    background-color: white;
}

.legend-div {
    height: auto;
    width: 100%;
}

.topnav {
    padding: 5px 10px;
}
/* Grade level legend */

.collapsible-tree-legend {
    width: 100%;
}

.collapsible-tree-legend {
    width: 100%;
}

.search-bar {
    display: flex;
    flex-direction: column;
    border: 1px solid #dce2f2;
    border-radius: 8px;
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

/* Small devices (portrait phones) */
@media (max-width: 480px) {
    #mobile-legend {
        display: block;
    }

    #tablet-and-up-legend {
        display: none;
    }

    #print-btn {
        margin-bottom: 5px;
    }

    #legend {
        height: 190px;
    }

    .search-mobile-row {
        width: 96%;
        margin-left: 0px;
        margin-right: auto;
        margin-top: 15px;
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

/*---*/

#skill-nav {
    display: flex;
    justify-content: space-between;
}

.img-fluid {
    width: 100% !important;
    height: auto;
}

.grade-level-legend {
    position: absolute;
    margin-top: 10px;
    right: 10px;
}

.have-results {
    border-bottom: 0px !important ;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
}

.loadingNode {
    background-color: #989ba1;
}

.skill-tree-input {
    outline: none;
    border: 0px;
    width: 100%;
}

.search-results {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 0;
    left: -1px;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    border-bottom: 1px solid #989ba1;
    border-right: 1px solid #989ba1;
    border-left: 1px solid #989ba1;
    background-color: white;
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;
    width: 100.5%;
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

:deep(.hightLight) {
    font-weight: 500;
    color: #9985d1;
    float: none !important;
    width: auto !important;
    height: auto !important;
    margin: 0px !important;
    border-radius: 0px !important;
    border: 0px !important;
}

/* Mobile view style */
@media (max-width: 480px) {
    .skill-tree-input {
        width: 100%;
    }
}

/* Tablet view style */
@media (min-width: 481px) and (max-width: 1024px) {
    .search-bar {
        width: 80%;
        margin-left: auto;
        margin-right: auto;
    }
}
</style>
