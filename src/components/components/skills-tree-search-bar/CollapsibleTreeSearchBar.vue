<script>
import { mode } from 'd3';
import LoadingSpinner from '../share-components/LoadingSpinner.vue';

export default {
    props: ['handleChooseResult'],
    data: () => {
        return {
            resultsSkills: [],
            searchMode: 'key word'
        };
    },
    methods: {
        getKeyWordResults(searchText) {
            let results = [];

            this.nameList.forEach((element) => {
                // search only first work match if search text is less than three
                if (searchText.length < 3) {
                    if (
                        element.name
                            .toLowerCase()
                            .substring(0, searchText.length) === searchText
                    ) {
                        results.push(element);
                    }
                }
                // search for all word in skill name string if search text is greater than three
                else {
                    if (element.name.toLowerCase().includes(searchText)) {
                        results.push(element);
                    }
                }
            });

            // we highlight the part that match search text
            const highlightedResult = results.map((result) => {
                const matchedRegex = new RegExp(`(${this.searchText})`, 'gi');
                const newText = result.name.replace(
                    matchedRegex,
                    '<span class="hightLight">$1</span>'
                );
                return { ...result, highlightedResult: newText };
            });
            this.resultsSkills = highlightedResult;
        },
        handleSearchTextChange(searchText) {
            if (mode === 'key word') {
                this.getResults(searchText.toLowerCase());
            }
        }
    },
    components: {
        LoadingSpinner
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
