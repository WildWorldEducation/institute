<script>
import LoadingSpinner from '../share-components/LoadingSpinner.vue';
import AiExplainToolTip from './AiExplainToolTip.vue';
import AiSearchSuggestToolTip from './AiSearchSuggestToolTip.vue';

export default {
    props: ['findNode', 'nameList', 'clearResults'],
    data: () => {
        return {
            resultsSkills: [],
            searchMode: 'key word',
            searchText: '',
            chooseResult: null,
            waitForSever: false,
            showAiToolTip: false,
            showSuggestAiSearchToolTip: false,
            toolTipStillShowing: false
        };
    },
    methods: {
        getKeyWordResults(searchText) {
            let results = [];
            // search only first work match if search text is less than three
            if (searchText.length < 3) {
                this.searchFirstWord(results, searchText);
            }
            // search for all word in skill name string if search text is greater than three
            else {
                this.searchWholeString(results, searchText);
            }
            this.resultsSkills = this.highlightingResult(results);
            if (this.resultsSkills.length === 0 && !this.toolTipStillShowing) {
                this.handleShowAISuggestion();
            }
        },
        handleShowAISuggestion() {
            this.toolTipStillShowing = true;
            setTimeout(() => {
                this.showSuggestAiSearchToolTip = true;
                setTimeout(() => {
                    this.showSuggestAiSearchToolTip = false;
                    this.toolTipStillShowing = false;
                }, 8000);
            }, 300);
        },
        searchFirstWord(results, searchText) {
            this.nameList.forEach((element) => {
                if (
                    element.name
                        .toLowerCase()
                        .substring(0, searchText.length) === searchText
                ) {
                    results.push(element);
                }
            });
        },
        searchWholeString(results, searchText) {
            this.nameList.forEach((element) => {
                if (element.name.toLowerCase().includes(searchText)) {
                    results.push(element);
                }
            });
        },
        highlightingResult(results) {
            // we highlight the part that match search text
            const highlightedResult = results.map((result) => {
                const matchedRegex = new RegExp(`(${this.searchText})`, 'gi');
                const newText = result.name.replace(
                    matchedRegex,
                    '<span class="hightLight">$1</span>'
                );
                return { ...result, highlightedResult: newText };
            });
            return highlightedResult;
        },
        async getContextResults(searchText) {
            this.waitForSever = true;
            // const url = `/skills//find-with-context`;
            // const requestOption = {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         input: searchText
            //     })
            // };
            // const res = await fetch(url, requestOption);
            // const ResResults = await res.json();
            // // We have to change the field in context result to match the key word results
            // const matchedResult = ResResults.map((resResult) => {
            //     return {
            //         id: resResult.skill_id,
            //         name: resResult.skill_name
            //     };
            // });
            // this.resultsSkills = this.highlightingResult(matchedResult);
            // this.waitForSever = false;
        },
        handleSearchTextChange(searchText) {
            if (this.searchMode === 'key word') {
                this.getKeyWordResults(searchText.toLowerCase());
            }
        },
        handleChooseResult(result) {
            this.resultsSkills = [];
            this.searchText = result.name;
            this.chooseResult = result;
            this.findNode(result.name);
        }
    },
    components: {
        LoadingSpinner,
        AiExplainToolTip,
        AiSearchSuggestToolTip
    },

    watch: {
        // We use watcher instead of compute because we made API call
        searchText: {
            handler(newVal) {
                // if
                if (this.chooseResult) {
                    this.chooseResult = null;
                } else {
                    this.handleSearchTextChange(newVal);
                }
                if (newVal.length === 0) {
                    this.resultsSkills = [];
                    this.clearResults();
                }
            }
        }
    }
};
</script>

<template>
    <!-- Search Feature -->
    <div :class="['search-bar', resultsSkills.length > 0 && 'have-results']">
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
            <button
                class="robot-icon"
                @click="getContextResults(searchText)"
                @mouseover="showAiToolTip = true"
                @mouseleave="showAiToolTip = false"
            >
                <svg
                    v-if="!waitForSever"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 512"
                    height="20"
                    width="20"
                    fill="#0f172a"
                >
                    <path
                        d="M320 0c17.7 0 32 14.3 32 32l0 64 120 0c39.8 0 72 32.2 72 72l0 272c0 39.8-32.2 72-72 72l-304 0c-39.8 0-72-32.2-72-72l0-272c0-39.8 32.2-72 72-72l120 0 0-64c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224l16 0 0 192-16 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-16 0 0-192 16 0z"
                    />
                </svg>
                <div class="loading-spinner-div">
                    <LoadingSpinner
                        v-if="waitForSever"
                        height="22px"
                        width="22px"
                        borderWidth="3px"
                    />
                </div>
            </button>
        </div>
        <div class="position-relative">
            <AiExplainToolTip v-if="showAiToolTip" />
            <AiSearchSuggestToolTip v-if="showSuggestAiSearchToolTip" />
        </div>
        <div class="position-relative">
            <div v-if="resultsSkills.length" class="search-results">
                <button
                    @click="handleChooseResult(result)"
                    class="result-row"
                    v-for="result in resultsSkills"
                    v-html="result.highlightedResult"
                ></button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.search-bar {
    display: flex;
    flex-direction: column;
    border: 1px solid #dce2f2;
    border-radius: 8px;
    width: 450px;
    margin-right: 35px;
}

.have-results {
    border-bottom: 0px !important ;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
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
    border-bottom: 1px solid #dce2f2;
    border-right: 1px solid #dce2f2;
    border-left: 1px solid #dce2f2;
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

.robot-icon {
    margin-left: auto;
    margin-right: 5px;
    background-color: inherit;
    border: none;
}

.robot-icon:hover {
    cursor: pointer;
}

.loading-spinner-div {
    height: fit-content !important;
}

/* Bigger devices ( Tablet ) */
@media (min-width: 481px) and (max-width: 1024px) {
    .search-bar {
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
