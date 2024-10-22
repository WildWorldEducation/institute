<script>
import diff from 'fast-diff';
import { diffWords } from 'diff';
import CompareString from './CompareString.vue';
import DiffWordsDropDown from './DiffWordsDropDown.vue';
import ComparisonContainer from './ComparisonContainer.vue';
import { nextTick } from 'vue';

export default {
    setup() {},
    data() {
        return {
            essayQuestionId: this.$route.params.contentId,
            userId: this.$route.params.userId,
            essayQuestion: {},
            essayQuestionEdit: {},
            comment: '',
            isEditMode: false,
            edited: false,
            showHighLight: true,
            showQuestionChange: true,
            showNameChange: true,
            changed: {
                name: false,
                question: false
            },
            changeCount: {
                questionAdd: 0,
                questionRemove: 0,
                nameAdd: 0,
                nameRemove: 0
            },
            tempEssayEdit: null
        };
    },
    components: { CompareString, DiffWordsDropDown, ComparisonContainer },
    async created() {
        await this.getEssayQuestionEdit();
        await this.getEssayQuestion();
        this.compareEdit();
        // Auto size text area to show all text without scroll bar.
        const tx = document.getElementsByTagName('textarea');
        for (let i = 0; i < tx.length; i++) {
            tx[i].setAttribute(
                'style',
                'height:' + tx[i].scrollHeight + 'px;overflow-y:hidden;'
            );
            tx[i].addEventListener('input', OnInput, false);
        }

        function OnInput() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        }
    },
    methods: {
        toTileCase(string) {
            if (string) {
                const tileCase = string
                    .replace(/^[-_]*(.)/, (_, c) => c.toUpperCase()) // Initial char (after -/_)
                    .replace(/[-_]+(.)/g, (_, c) => ' ' + c.toUpperCase()); // First char after each -/_
                return tileCase;
            }
        },
        async getEssayQuestionEdit() {
            await fetch(
                '/questions/essay/submitted-for-review/' +
                    this.essayQuestionId +
                    '/' +
                    this.userId
            )
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.essayQuestionEdit = data;
                    this.comment = data.comment;
                });
        },
        async getEssayQuestion() {
            await fetch('/questions/essay/show/' + this.essayQuestionId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.essayQuestion = data;
                });
        },
        edit() {
            // initiate a temp data of mc question edit
            this.tempEssayEdit = this.essayQuestionEdit;
            this.isEditMode = true;
            this.$parent.disableBtn = true;
            // Auto size text area to show all text without scroll bar in next tick where the text area will appear.
            nextTick(() => {
                const tx = document.getElementsByTagName('textarea');
                for (let i = 0; i < tx.length; i++) {
                    tx[i].setAttribute(
                        'style',
                        'height:' + tx[i].scrollHeight + 'px;overflow-y:hidden;'
                    );
                    tx[i].addEventListener('input', OnInput, false);
                }

                function OnInput() {
                    this.style.height = 'auto';
                    this.style.height = this.scrollHeight + 'px';
                }
            });

            // Scroll to page tile header
            const el = this.$refs.pageTile;

            if (el) {
                // Use el.scrollIntoView() to instantly scroll to the element
                el.scrollIntoView({ behavior: 'smooth' });
            }
        },
        dismissEdit() {
            if (confirm('Delete this edit?')) {
                const result = fetch(
                    '/questions/essay/submitted-for-review/' +
                        this.essayQuestionId +
                        '/' +
                        this.userId,
                    {
                        method: 'DELETE'
                    }
                );

                if (result.error) {
                    console.log(result.error);
                }

                // Return to hub page.
                this.$router.back();
            }
        },
        updateTempData(type, value) {
            switch (type) {
                case 'essay_name':
                    this.tempEssayEdit.name = value;
                    break;
                case 'essay_question':
                    this.tempEssayEdit.question = value;
                default:
                    break;
            }
        },
        editMode() {
            this.isEditMode = true;
        },
        saveEdit() {
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: this.essayQuestionEdit.name,
                    question: this.essayQuestionEdit.question,
                    edit: this.edited
                })
            };

            var url =
                '/questions/essay/' +
                this.essayQuestionEdit.essay_question_id +
                '/approve-edits';
            fetch(url, requestOptions).then(() => {
                this.$router.back();
            });

            // Delete it afterwards.
            const result = fetch(
                '/questions/essay/submitted-for-review/' +
                    this.essayQuestionEdit.essay_question_id +
                    '/' +
                    this.userId,
                {
                    method: 'DELETE'
                }
            );

            if (result.error) {
                console.log(result.error);
            }
        },

        applyEditChange() {
            this.isEditMode = false;
            this.$parent.disableBtn = false;
            this.edited = true;
            this.essayQuestionEdit = this.tempEssayEdit;
        },

        cancelEditChange() {
            this.isEditMode = false;
            this.$parent.disableBtn = false;
        }
    }
};
</script>

<template>
    <div class="container mt-4 mb-4">
        <h1 class="page-title">Comparison Essay Question</h1>
        <div class="my-3">
            <hr />
        </div>
        <!-- General Skill Info -->
        <div class="d-flex flex-column gap-2 mb-3">
            <h1 class="d-flex gap-2 align-items-center header-tile">
                <div class="major-text">Skill:</div>
                <div class="minor-text">{{ essayQuestion.skill_name }}</div>
            </h1>
            <h1 class="d-flex gap-2 align-items-center header-tile">
                <div class="major-text">Level:</div>
                <div class="minor-text capitalize">
                    {{ toTileCase(essayQuestion.skill_level) }}
                </div>
            </h1>
        </div>
        <!-- Show / Hide hight light button -->
        <div class="d-flex flex-row-reverse my-3">
            <div
                class="btn green-btn d-flex align-items-center"
                @click="showHighLight = !showHighLight"
            >
                {{ showHighLight ? 'Hide' : 'Show' }} Hight Light
                <svg
                    v-if="showHighLight"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 576 512"
                    width="30"
                    height="30"
                    fill="white"
                    class="ms-2"
                >
                    <path
                        d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"
                    />
                </svg>
                <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 512"
                    width="30"
                    height="30"
                    fill="white"
                    class="ms-2"
                >
                    <path
                        d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 97.7 269.5 80 320 80c65.2 0 118.8 29.6 159.9 67.7C518.4 183.5 545 226 558.6 256c-12.6 28-36.6 66.8-70.9 100.9l-53.8-42.2c9.1-17.6 14.2-37.5 14.2-58.7c0-70.7-57.3-128-128-128c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1zM394.9 284.2l-81.5-63.9c4.2-8.5 6.6-18.2 6.6-28.3c0-5.5-.7-10.9-2-16c.7 0 1.3 0 2 0c44.2 0 80 35.8 80 80c0 9.9-1.8 19.4-5.1 28.2zm9.4 130.3C378.8 425.4 350.7 432 320 432c-65.2 0-118.8-29.6-159.9-67.7C121.6 328.5 95 286 81.4 256c8.3-18.4 21.5-41.5 39.4-64.8L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5l-41.9-33zM192 256c0 70.7 57.3 128 128 128c13.3 0 26.1-2 38.2-5.8L302 334c-23.5-5.4-43.1-21.2-53.7-42.3l-56.1-44.2c-.2 2.8-.3 5.6-.3 8.5z"
                    />
                </svg>
            </div>
        </div>
        <!-- ----| Question Name |---- -->
        <ComparisonContainer
            :showHighlight="showHighLight"
            containerName="Name"
            :originalData="essayQuestion.name"
            :newData="essayQuestionEdit.name"
            :isEditMode="isEditMode"
            type="essay_name"
            :updateTempData="updateTempData"
        />

        <!-- ----| Question Content Container |---- -->
        <ComparisonContainer
            class="mt-4"
            :showHighlight="showHighLight"
            containerName="Question"
            :originalData="essayQuestion.question"
            :newData="essayQuestionEdit.question"
            :isEditMode="isEditMode"
            type="essay_question"
            :updateTempData="updateTempData"
        />

        <!-- ----| Buttons Only Shows when User Edit question |---- -->
        <div v-if="isEditMode" class="d-flex flex-row-reverse gap-3">
            <div
                class="btn green-btn d-flex align-items-center my-3"
                @click="applyEditChange"
            >
                Apply
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 576 512"
                    width="22"
                    heigh="22"
                    fill="white"
                    class="ms-2"
                >
                    <path
                        d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 125.7-86.8 86.8c-10.3 10.3-17.5 23.1-21 37.2l-18.7 74.9c-2.3 9.2-1.8 18.8 1.3 27.5L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128zM549.8 235.7l14.4 14.4c15.6 15.6 15.6 40.9 0 56.6l-29.4 29.4-71-71 29.4-29.4c15.6-15.6 40.9-15.6 56.6 0zM311.9 417L441.1 287.8l71 71L382.9 487.9c-4.1 4.1-9.2 7-14.9 8.4l-60.1 15c-5.5 1.4-11.2-.2-15.2-4.2s-5.6-9.7-4.2-15.2l15-60.1c1.4-5.6 4.3-10.8 8.4-14.9z"
                    />
                </svg>
            </div>
            <div
                class="btn red-btn d-flex align-items-center my-3"
                @click="cancelEditChange"
            >
                Cancel
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    width="22"
                    heigh="22"
                    fill="white"
                    class="ms-2"
                >
                    <path
                        d="M64 80c-8.8 0-16 7.2-16 16l0 320c0 8.8 7.2 16 16 16l384 0c8.8 0 16-7.2 16-16l0-320c0-8.8-7.2-16-16-16L64 80zM0 96C0 60.7 28.7 32 64 32l384 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zm175 79c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"
                    />
                </svg>
            </div>
        </div>
        <!-- User Comment -->
        <div class="mt-5 w-lg-50 w-md-75 w-100 compare-container">
            <div class="d-flex flex-md-row flex-column gap-2">
                <h2 class="compare-container-tile mb-3">Comment:</h2>
                <div class="comment-text">
                    {{ essayQuestionEdit.comment }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page-title {
    color: #a48be7;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
}
.compare-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 5px;
    padding: 10px 15px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.header-tile {
    color: #475569;
    font-size: 18px;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
}

.major-text {
    color: #a48be7;
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

/* Rotate animation */
@keyframes rotation {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(180deg);
    }
}

@keyframes rotationBack {
    from {
        transform: rotate(180deg);
    }

    to {
        transform: rotate(0deg);
    }
}

.comment-text {
    background-color: #f1f5f9;
    border-radius: 5px;
    padding: 15px;
    width: 100%;
}
</style>
