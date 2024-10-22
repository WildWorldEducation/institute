<script>
import CompareString from './CompareString.vue';
import DiffWordsDropDown from './DiffWordsDropDown.vue';
import { diffWords } from 'diff';

export default {
    setup() {},
    data() {
        return {
            show: true,

            addCount: 0,
            removeCount: 0,
            changedObject: null,
            changed: false,
            textEditData: null,
            changedWords: null
        };
    },
    components: {
        DiffWordsDropDown,
        CompareString
    },
    props: [
        'showHighlight',
        'containerName',
        'originalData',
        'newData',
        'isEditMode',
        'updateTempData',
        'type'
    ],
    async created() {},
    methods: {
        countChangedWords(wordsArray) {
            const returnObj = {
                added: 0,
                removed: 0
            };
            wordsArray.forEach((element) => {
                if (element.added && !element.removed) {
                    returnObj.added = returnObj.added + element.count;
                }

                if (!element.added && element.removed) {
                    returnObj.removed = returnObj.removed + element.count;
                }
            });

            return returnObj;
        },
        // --- Compare all aspect of two question --- //
        compareEdit() {
            this.changedWords = diffWords(this.originalData, this.newData);
            // counting add and remove token in string diff array
            const countObj = this.countChangedWords(this.changedWords);
            this.addCount = countObj.added;
            this.removeCount = countObj.removed;
            console.log(this.newData);
            console.log(countObj);
        }
    },
    computed: {
        showingData() {
            if (this.originalData !== this.newData) {
                this.compareEdit();
                this.changed = true;
            }

            return {
                changedObject: this.changedObject,
                originalData: this.originalData,
                newData: this.newData,
                removeCount: this.removeCount,
                addCount: this.addCount,
                diffString: this.changedWords,
                showHighLight: this.showHighlight,
                isEditMode: this.isEditMode
            };
        }
    },
    // Using watch because we need to bind text area to parent data
    watch: {}
};
</script>

<template>
    <div class="compare-container">
        <div class="d-flex align-items-center">
            <h2 class="compare-container-tile mb-3">{{ containerName }}</h2>
            <div
                @click="show = !show"
                :class="[show ? 'expand-arrow' : 'minimize-arrow']"
                b-on-hover
                :title="show ? 'minimize' : 'expand'"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    width="16"
                    heigh="16"
                    fill="#475569"
                >
                    <path
                        d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
                    />
                </svg>
            </div>
        </div>
        <!-- Compare Content -->
        <Transition name="dropdown">
            <div v-if="show && !isEditMode">
                <div class="d-flex flex-column">
                    <div class="d-flex flex-row-reverse gap-4 mb-3">
                        <div class="d-flex align-items-start">
                            <div class="add-count">
                                <span class="plus-icon">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 448 512"
                                        height="15"
                                        width="15"
                                        fill="#1aa375"
                                    >
                                        <path
                                            d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"
                                        />
                                    </svg>
                                </span>
                                {{ addCount }} addition
                            </div>
                            <DiffWordsDropDown
                                :diffObj="showingData.diffString"
                                type="add"
                            />
                        </div>
                        <div class="d-flex align-items-start">
                            <div class="remove-count">
                                <span class="minus-icon">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 448 512"
                                        height="15"
                                        width="15"
                                        fill="#ea6c6c"
                                    >
                                        <path
                                            d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                                        />
                                    </svg>
                                </span>
                                {{ removeCount }} removal
                            </div>
                            <DiffWordsDropDown
                                :diffObj="showingData.diffString"
                                type="remove"
                            />
                        </div>
                    </div>
                    <div class="d-flex flex-lg-row flex-column">
                        <!-- Old Data -->
                        <div class="old-container general-container">
                            <div class="container-tile">Original</div>
                            <div class="container-content">
                                {{ showingData.originalData }}
                            </div>
                        </div>
                        <!-- Long arrow pointing right -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            width="50"
                            height="50"
                            fill="#ac90e8"
                            class="d-none d-lg-block my-auto mx-1"
                        >
                            <path
                                d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"
                            />
                        </svg>
                        <!-- Long arrow pointing down on tablet and mobile-->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 320 512"
                            fill="#ac90e8"
                            height="50"
                            width="50"
                            class="mx-auto my-2 d-lg-none"
                        >
                            <path
                                d="M2 334.5c-3.8 8.8-2 19 4.6 26l136 144c4.5 4.8 10.8 7.5 17.4 7.5s12.9-2.7 17.4-7.5l136-144c6.6-7 8.4-17.2 4.6-26s-12.5-14.5-22-14.5l-72 0 0-288c0-17.7-14.3-32-32-32L128 0C110.3 0 96 14.3 96 32l0 288-72 0c-9.6 0-18.2 5.7-22 14.5z"
                            />
                        </svg>
                        <div class="new-container general-container">
                            <div class="container-tile">Changed</div>
                            <div class="container-content">
                                <CompareString
                                    v-if="changed && showingData.showHighLight"
                                    :diffString="changedWords"
                                />
                                <div
                                    v-else-if="
                                        changed && !showingData.showHighLight
                                    "
                                >
                                    {{ showingData.newData }}
                                </div>
                                <div v-else>No changed Happened</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
        <!-- Editable Text area -->
        <Transition name="dropdown">
            <div v-if="show && showingData.isEditMode">
                <div class="d-flex flex-column">
                    <textarea
                        class="editable-text-area"
                        v-model="textEditData"
                        @input="updateTempData(this.type, this.textEditData)"
                    ></textarea>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.compare-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 5px;
    padding: 10px 15px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.expand-arrow {
    margin-left: 5px;
    margin-right: auto;
    margin-bottom: 10px;
    animation: rotation 0.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
    cursor: pointer;
}

.minimize-arrow {
    margin-left: 5px;
    margin-right: auto;
    margin-bottom: 20px;
    animation: rotationBack 0.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
    cursor: pointer;
}

.general-container {
    width: 100%;
    height: 400;
    display: flex;
    justify-content: center;
}

.old-container {
    position: relative;
    background-color: white;
    border: 1px solid rgb(163, 42, 42);
    border-radius: 10px;
    padding: 10px 15px;
    color: rgb(163, 42, 42);
}

.new-container {
    position: relative;
    background-color: white;
    border: 1px solid rgb(46, 126, 38);
    border-radius: 10px;
    padding: 10px 15px;
    color: rgb(46, 126, 38);
}

.add-count {
    color: #157a6e;
    font-size: 16px;
    font-weight: 500;
    display: flex;
    gap: 5px;
}

.plus-icon {
    background-color: #ccebe0;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px 5px;
}

.remove-count {
    color: #b12c2b;
    font-size: 16px;
    font-weight: 500;
    display: flex;
    gap: 5px;
}

.container-tile {
    position: absolute;
    top: -15px;
    font-size: 18px;
    left: 20px;
    padding-left: 5px;
    padding-right: 5px;
    background-color: white;
}

.container-content {
    color: black;
    text-align: left;
    width: 100%;
    margin-top: 5px;
    margin-left: 9px;
}

.editable-text-area {
    border-radius: 5px;
    border: 1px solid rgb(46, 126, 38);
    padding: 5px 10px;
}

.editable-text-area:focus {
    outline: none;
}

.minus-icon {
    background-color: #f9d2d2;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px 5px;
}

/* Slide down animation */
@keyframes slide {
    0% {
        opacity: 0;
        transform: scaleY(0);
    }

    100% {
        opacity: 1;
        transform: scaleY(1);
    }
}
.dropdown-enter-active {
    transform-origin: top center;
    animation: slide 0.4s;
}
.dropdown-leave-active {
    transform-origin: top center;
    animation: slide 0.4s reverse;
}
</style>
