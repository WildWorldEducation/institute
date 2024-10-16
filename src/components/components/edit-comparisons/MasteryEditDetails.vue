<script>
import { diffWords } from 'diff';
export default {
    setup() {},
    data() {
        return {
            showDetails: false,
            addedWords: '',
            removedWords: '',
            addedWordsCount: 0,
            removedWordsCount: 0
        };
    },
    props: ['skill', 'skillEdited'],
    computed: {},
    mounted() {
        this.getDiffDetails(
            this.skillEdited.mastery_requirements,
            this.skill.mastery_requirements
        );
    },
    methods: {
        getDiffDetails(newMastery, oldMastery) {
            const masteryDiff = diffWords(
                this.extractContent(oldMastery),
                this.extractContent(newMastery)
            );
            masteryDiff.forEach((element, index) => {
                if (element.added && !element.removed) {
                    this.addedWordsCount++;
                    this.addedWords = this.addedWords + element.value;
                    if (index + 1 !== masteryDiff.length) {
                        this.addedWords = this.addedWords + ', ';
                    }
                }

                if (element.removed && !element.added) {
                    this.removedWordsCount++;
                    this.removedWords = this.removedWords + element.value;
                    if (index + 1 !== masteryDiff.length) {
                        this.removedWords = this.removedWords + ', ';
                    }
                }
            });
        },
        extractContent(html) {
            return new DOMParser().parseFromString(html, 'text/html')
                .documentElement.textContent;
        }
    }
};
</script>

<template>
    <div class="details-btn">
        <div
            @click="showDetails = !showDetails"
            class="d-flex align-items-center details-btn-text"
        >
            <div>See Details</div>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                width="20"
                height="20"
                class="ms-1"
                fill="#a48be7"
            >
                <path
                    d="M512 256A256 256 0 1 0 0 256a256 256 0 1 0 512 0zM271 135c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-87 87 87 87c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L167 273c-9.4-9.4-9.4-24.6 0-33.9L271 135z"
                />
            </svg>
        </div>
        <Transition name="diffDetails">
            <div v-if="showDetails" class="diff-details-container">
                <div class="d-flex flex-column details-row">
                    <div class="d-flex">
                        <div class="add-color">
                            Add:
                            <span class="add-color"
                                >+{{ addedWordsCount }}</span
                            >
                        </div>
                    </div>
                    <div class="words-add-div details-row">
                        [ {{ addedWords }} ]
                    </div>
                </div>
                <hr />
                <div class="d-flex flex-column">
                    <div class="remove-color">
                        Removed: -{{ removedWordsCount }}
                    </div>
                    <div class="words-removed-div details-row">
                        [ {{ removedWords }} ]
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.add-color {
    color: #81d5b9;
}

.remove-color {
    color: #faa5a5;
}

.details-btn {
    width: fit-content;
    margin-left: auto;
    margin-right: 15px;
    margin-top: 5px;
    display: flex;
    flex-direction: row;
}

.details-btn-text {
    color: #a48be7;
}

.details-btn-text:hover {
    text-decoration: underline;
    cursor: pointer;
}

.diff-details-container {
    display: flex;
    flex-direction: column;
    top: 0px;
    right: 0px;
    border: 1px solid #a48be7;
    border-radius: 5px;
    padding: 5px 10px;
    margin-left: -8px;
    margin-top: 5px;
}

.words-row {
    display: flex;
    flex-direction: row;
    overflow-wrap: break-all;
    word-break: break-all;
    inline-size: 350px;
}

.words-add-div {
    background-color: #81d5b980;
    padding: 3px;
    border-radius: 5px;
    width: 300px;
}

.words-removed-div {
    background-color: #faa5a5a9;
    padding: 3px;
    border-radius: 5px;
    width: 300px;
}
</style>
