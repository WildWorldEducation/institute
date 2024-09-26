<script>
import SkillsListParent from '../components/SkillsListParent.vue';

// Import the store
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';

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
            findNodeLoading: null
        };
    },
    components: {
        SkillsListParent
    },
    created() {
        // Check if the view is in instructor mode (a student's skills being viewed by an instructor or admin)
        this.isInstructorMode = typeof this.$route.params.studentId == 'string';
    },
    methods: {
        async getFullTextResult() {
            const url = `/skills/full-text-search?searchText=${this.searchText}`;
            const res = await fetch(url);
            const results = await res.json();
            this.resultsSkills = results;
            this.updateChooseResult = true;
        },
        handleChooseResult(result) {
            this.resultsSkills = [];
            this.searchText = result.name;
            this.chooseResult = result;
            this.$refs.skillList.findNode(result.name);
        },
        clearResults() {
            this.$refs.skillList.path = [];
        }
    },
    watch: {
        // We use watcher instead of compute because we made API call
        searchText: {
            handler(newVal) {
                // if
                if (this.chooseResult) {
                    this.chooseResult = false;
                } else {
                    if (newVal.length > 3) {
                        this.getFullTextResult();
                    }
                }
                if (newVal.length === 0) {
                    this.clearResults();
                }
            }
        }
    }
};
</script>

<template>
    <div id="banner">
        <img
            src="/images/banners/edit-mastery-skill-banner.png"
            class="img-fluid"
        />
    </div>
    <div
        v-if="userDetailsStore.role == 'admin' && !isInstructorMode"
        class="topnav"
        id="skill-nav"
    >
        <router-link class="btn purple-btn" to="/skills/add"
            >Add&nbsp;
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
        <div class="d-flex gap-2">
            <router-link class="btn purple-btn" to="/tags"
                >Skill Filters</router-link
            >
        </div>
    </div>
    <div class="collapsible-tree-legend container-fluid p-2">
        <div class="legend row">
            <div class="col-md col-6">
                <span class="grade-school"></span>Grade school
            </div>
            <div class="col-md col-6">
                <span class="middle-school"></span> Middle school
            </div>
            <div class="col-md col-6">
                <span class="high-school"></span> High school
            </div>
            <div class="col-md col-6">
                <span class="college"></span> College
            </div>
            <div class="col-md col-6"><span class="phd"></span> PHD</div>
        </div>
    </div>
    <div class="d-flex flex-row-reverse me-3">
        <!-- Search Feature -->
        <div
            :class="['search-bar', resultsSkills.length > 0 && 'have-results']"
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
                <div v-if="resultsSkills.length" class="search-results">
                    <div
                        @click="handleChooseResult(result)"
                        class="result-row"
                        v-for="result in resultsSkills"
                    >
                        {{ result.name }}
                    </div>
                </div>
            </div>
        </div>
    </div>
    <SkillsListParent ref="skillList" />
</template>

<style scoped>
.topnav {
    padding: 5px 10px;
}
/* Grade level legend */

.collapsible-tree-legend {
    width: 100%;
}

/* basic positioning */
.legend {
    list-style: none;
    width: 100%;
}

.legend span {
    border: 1px solid #ccc;
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

/*---*/

#skill-nav {
    display: flex;
    justify-content: space-between;
}

.img-fluid {
    width: 100% !important;
    height: auto;
}

.purple-btn {
    background-color: #a48be6;
    color: white;
    border: 1px solid #7f56d9;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
}

.grade-level-legend {
    position: absolute;
    margin-top: 10px;
    right: 10px;
}

.search-bar {
    display: flex;
    flex-direction: column;
    border: 1px solid #989ba1;
    border-radius: 8px;
    background-color: white;
    width: 15%;
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
    width: 101%;
}

.result-row {
    padding: 4px;
    cursor: pointer;
}

.result-row:hover {
    background-color: #f3f5f6;
}
</style>
