<script>
import { useUserDetailsStore } from '../../stores/UserDetailsStore';
import TooltipBtn from './share-components/TooltipBtn.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    data() {
        return {
            skillId: this.$route.params.id,
            questionCSVFile: '',
            questionsArray: [],
            // flag state for dropdown zone
            isDragging: false,
            files_essay: [],
            // validate flag for same file name in drag and drop
            duplicates: [],
            // validate flag for missing fields in drag and drop
            missingFields: [],
            //  show modal flag
            showModal: false,
            // flag to handle user click on modal
            clickModal: false
        };
    },
    components: {
        TooltipBtn
    },
    mounted: function () {},
    methods: {
        OnFileChange(e) {
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length) return;
            this.ReadFile(files[0]);
        },
        // Convert file to string, and then to array.
        ReadFile(file) {
            var reader = new FileReader();
            reader.onload = (e) => {
                let incorrectlyFormattedQuestions = false;
                var CSVString = e.target.result;
                // Break CSV into individual questions.
                var CSVArray = CSVString.split(/\r?\n|\r|\n/g);

                // Break individual questions into arrays.
                // Validation.
                //reverse loop to not mess with splicing.
                for (let i = CSVArray.length - 1; i >= 0; i--) {
                    // Remove any empty lines.
                    if (CSVArray[i] === '') {
                        CSVArray.splice(i, 1);
                    }
                    let question;
                    if (CSVArray[i] !== undefined) {
                        question = CSVArray[i].split('|');
                    } else {
                        break;
                    }

                    // Validation - checking for missing fields.

                    if (question.length != 2) {
                        // line order of the CSVline that have missing field
                        const line = i + 1;
                        // Determine if this line has fewer of more field and number of difference in field
                        const missingType =
                            question.length - 2 > 0 ? 'more' : 'less';
                        // We calculate the absolute value of field the line is missing
                        const numberOfMissingField = Math.abs(
                            2 - question.length
                        );
                        const missingObj = {
                            fileName: file.name,
                            line: line,
                            missingType: missingType,
                            numberOfMissingField: numberOfMissingField
                        };
                        this.missingFields.push(missingObj);
                    } else {
                        // Add question that have correct format to the questions array
                        this.questionsArray.push(question);
                    }
                }
            };
            reader.readAsText(file);
        },
        async Submit() {
            const questionArray = [];
            // If validate condition are violated we stop the submit function
            // Now we only show the modal once and If user still want to upload question we will
            if (
                (this.missingFields.length || this.duplicates.length) &&
                !this.clickModal
            ) {
                this.showModal = true;
                return;
            }
            // For each question.
            for (let i = 0; i < this.questionsArray.length; i++) {
                const questionObject = {};
                questionObject.name = this.questionsArray[i][0];
                questionObject.question = this.questionsArray[i][1];
                questionArray.push(questionObject);
            }

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionArray
                })
            };
            var url = '/skills/' + this.skillId + '/essay-questions/add';
            fetch(url, requestOptions).then(() => {
                this.$router.push('/skills/' + this.skillId + '/question-bank');
            });
        },
        // --- ++ Drag and drop file relate feature ++ --- //
        onChange() {
            const inputFiles = [];
            inputFiles.push(...this.$refs.file_essay.files);
            this.files_essay.push(...this.$refs.file_essay.files);
            // Check if user add a file with name already in files
            // Get the list of file name for checking duplicate below
            const filesName = this.files_essay.map((file) => file.name);
            // We use filter to get the duplicates item for validate purpose
            this.duplicates = filesName.filter(
                /**
                 * - because index of will always return the first item that fit it arg So if
                 * the index of currently item not equal to the result of index of that mean there are another
                 * item that match indexof result => these two are the same and therefore array have duplicate
                 *
                 */
                (item, index) => filesName.indexOf(item) !== index
            );
            // ended the function here if we have duplicate file
            if (this.duplicates.length) {
                return;
            } else {
                // add file content to question array
                // we have to do this in onchange because I cant figure out a way to do this asynchronous in submit function
                inputFiles.forEach((file) => {
                    this.ReadFile(file);
                });
            }
        },
        dragover(e) {
            // have to prevent default in other to
            e.preventDefault();
            this.isDragging = true;
        },
        dragleave() {
            this.isDragging = false;
        },
        drop(e) {
            e.preventDefault();
            this.$refs.file_essay.files = e.dataTransfer.files;
            this.onChange();
            this.isDragging = false;
        },
        remove(i, name) {
            // remove object in array based on their index
            this.files_essay.splice(i, 1);
            // we remove in the duplicate array too to update the validate warning
            this.duplicates = [];
            //  we also remove the missing Fields array if user delete the file
            this.missingFields = [];
            /** Because we add file content to question array when input change
             *  So we have to update the question array whenever user delete a file in files
             */
            // empty the array question and update it again with new files array
            this.questionsArray = [];
            this.files_essay.forEach((file) => this.ReadFile(file));
        }
    }
};
</script>

<template>
    <div class="container mt-3">
        <!-- Drop down zone for csv file input -->
        <div v-if="userDetailsStore.role == 'platform_admin'">
            <div class="row mt-5">
                <div
                    class="dropzone-container"
                    @dragover="dragover"
                    @dragleave="dragleave"
                    @drop="drop"
                    :style="isDragging && 'border-color: #8f7bd6;'"
                >
                    <input
                        type="file"
                        multiple
                        name="file_essay"
                        id="fileInput_essay"
                        class="hidden-input"
                        @change="onChange"
                        ref="file_essay"
                        accept=".csv,.txt"
                    />
                    <label for="fileInput_essay" class="file-label">
                        <div v-if="isDragging">Release to drop files here.</div>
                        <div v-else>
                            Drop files here or
                            <span id="click-here-label">click here</span> to
                            upload CSV and TXT file.
                        </div>
                    </label>
                    <!-- List file that uploaded and their size -->
                    <!-- PC Styling -->
                    <div
                        class="preview-container mt-4 row gap-2 d-none d-lg-flex"
                        v-if="files_essay.length"
                    >
                        <div
                            v-for="file in files_essay"
                            :key="file.name"
                            class="preview-card col-3 d-flex justify-content-between"
                        >
                            <div>
                                <!-- For each type of file we will display difference icon -->
                                <!-- CSV ICON -->
                                <svg
                                    v-if="file.type == 'text/csv'"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    fill="green"
                                    width="60"
                                    height="60"
                                >
                                    <path
                                        d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V304H176c-35.3 0-64 28.7-64 64V512H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM200 352h16c22.1 0 40 17.9 40 40v8c0 8.8-7.2 16-16 16s-16-7.2-16-16v-8c0-4.4-3.6-8-8-8H200c-4.4 0-8 3.6-8 8v80c0 4.4 3.6 8 8 8h16c4.4 0 8-3.6 8-8v-8c0-8.8 7.2-16 16-16s16 7.2 16 16v8c0 22.1-17.9 40-40 40H200c-22.1 0-40-17.9-40-40V392c0-22.1 17.9-40 40-40zm133.1 0H368c8.8 0 16 7.2 16 16s-7.2 16-16 16H333.1c-7.2 0-13.1 5.9-13.1 13.1c0 5.2 3 9.9 7.8 12l37.4 16.6c16.3 7.2 26.8 23.4 26.8 41.2c0 24.9-20.2 45.1-45.1 45.1H304c-8.8 0-16-7.2-16-16s7.2-16 16-16h42.9c7.2 0 13.1-5.9 13.1-13.1c0-5.2-3-9.9-7.8-12l-37.4-16.6c-16.3-7.2-26.8-23.4-26.8-41.2c0-24.9 20.2-45.1 45.1-45.1zm98.9 0c8.8 0 16 7.2 16 16v31.6c0 23 5.5 45.6 16 66c10.5-20.3 16-42.9 16-66V368c0-8.8 7.2-16 16-16s16 7.2 16 16v31.6c0 34.7-10.3 68.7-29.6 97.6l-5.1 7.7c-3 4.5-8 7.1-13.3 7.1s-10.3-2.7-13.3-7.1l-5.1-7.7c-19.3-28.9-29.6-62.9-29.6-97.6V368c0-8.8 7.2-16 16-16z"
                                    />
                                </svg>
                                <!-- PLAIN TEXT ICON -->
                                <svg
                                    v-if="file.type == 'text/plain'"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    width="60"
                                    height="60"
                                    fill="grey"
                                >
                                    <path
                                        d="M64 464c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16H224v80c0 17.7 14.3 32 32 32h80V448c0 8.8-7.2 16-16 16H64zM64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V154.5c0-17-6.7-33.3-18.7-45.3L274.7 18.7C262.7 6.7 246.5 0 229.5 0H64zm56 256c-13.3 0-24 10.7-24 24s10.7 24 24 24H264c13.3 0 24-10.7 24-24s-10.7-24-24-24H120zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24H264c13.3 0 24-10.7 24-24s-10.7-24-24-24H120z"
                                    />
                                </svg>
                                <p class="input-file-name">
                                    {{ file.name }}
                                    ({{ Math.round(file.size / 1000) + 'kb' }})
                                </p>
                            </div>
                            <div>
                                <button
                                    class="ms-2 btn btn-danger"
                                    @click="
                                        remove(
                                            files_essay.indexOf(file),
                                            file.name
                                        )
                                    "
                                    title="Remove file"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 448 512"
                                        fill="white"
                                        width="16"
                                        height="16"
                                    >
                                        <path
                                            d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <!-- Warning for duplicate file -->
                        <div
                            class="validate-line mt-3"
                            v-if="duplicates.length"
                        >
                            You have add duplicate csv files. Please remove the
                            duplicate file for
                            <span v-for="file in duplicates" :key="file.name"
                                >{{ file }}, &ThinSpace;
                            </span>
                        </div>
                        <!-- warning for missing fields -->
                        <div
                            class="validate-line mt-3"
                            v-if="missingFields.length"
                        >
                            Please check your CSVs files:
                            <div v-for="file in missingFields" :key="file">
                                File: {{ file.fileName }} at Line
                                {{ file.line }} have
                                {{ file.numberOfMissingField }}
                                {{ file.missingType }} field than default.
                                &ThinSpace;
                            </div>
                        </div>
                    </div>
                    <!-- Phone view  -->
                    <div
                        class="preview-container mt-4 row gap-2 d-lg-none"
                        v-if="files_essay.length"
                    >
                        <div
                            v-for="file in files_essay"
                            :key="file.name"
                            class="preview-card col-10 d-flex justify-content-between"
                        >
                            <div>
                                <!-- For each type of file we will display difference icon -->
                                <!-- CSV ICON -->
                                <svg
                                    v-if="file.type == 'text/csv'"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    fill="green"
                                    width="60"
                                    height="60"
                                >
                                    <path
                                        d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V304H176c-35.3 0-64 28.7-64 64V512H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM200 352h16c22.1 0 40 17.9 40 40v8c0 8.8-7.2 16-16 16s-16-7.2-16-16v-8c0-4.4-3.6-8-8-8H200c-4.4 0-8 3.6-8 8v80c0 4.4 3.6 8 8 8h16c4.4 0 8-3.6 8-8v-8c0-8.8 7.2-16 16-16s16 7.2 16 16v8c0 22.1-17.9 40-40 40H200c-22.1 0-40-17.9-40-40V392c0-22.1 17.9-40 40-40zm133.1 0H368c8.8 0 16 7.2 16 16s-7.2 16-16 16H333.1c-7.2 0-13.1 5.9-13.1 13.1c0 5.2 3 9.9 7.8 12l37.4 16.6c16.3 7.2 26.8 23.4 26.8 41.2c0 24.9-20.2 45.1-45.1 45.1H304c-8.8 0-16-7.2-16-16s7.2-16 16-16h42.9c7.2 0 13.1-5.9 13.1-13.1c0-5.2-3-9.9-7.8-12l-37.4-16.6c-16.3-7.2-26.8-23.4-26.8-41.2c0-24.9 20.2-45.1 45.1-45.1zm98.9 0c8.8 0 16 7.2 16 16v31.6c0 23 5.5 45.6 16 66c10.5-20.3 16-42.9 16-66V368c0-8.8 7.2-16 16-16s16 7.2 16 16v31.6c0 34.7-10.3 68.7-29.6 97.6l-5.1 7.7c-3 4.5-8 7.1-13.3 7.1s-10.3-2.7-13.3-7.1l-5.1-7.7c-19.3-28.9-29.6-62.9-29.6-97.6V368c0-8.8 7.2-16 16-16z"
                                    />
                                </svg>
                                <!-- PLAIN TEXT ICON -->
                                <svg
                                    v-if="file.type == 'text/plain'"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    width="60"
                                    height="60"
                                    fill="grey"
                                >
                                    <path
                                        d="M64 464c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16H224v80c0 17.7 14.3 32 32 32h80V448c0 8.8-7.2 16-16 16H64zM64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V154.5c0-17-6.7-33.3-18.7-45.3L274.7 18.7C262.7 6.7 246.5 0 229.5 0H64zm56 256c-13.3 0-24 10.7-24 24s10.7 24 24 24H264c13.3 0 24-10.7 24-24s-10.7-24-24-24H120zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24H264c13.3 0 24-10.7 24-24s-10.7-24-24-24H120z"
                                    />
                                </svg>
                                <p class="input-file-name">
                                    {{ file.name }}
                                    ({{ Math.round(file.size / 1000) + 'kb' }})
                                </p>
                            </div>
                            <div>
                                <button
                                    class="ms-2 btn btn-danger"
                                    @click="
                                        remove(
                                            files_essay.indexOf(file),
                                            file.name
                                        )
                                    "
                                    title="Remove file"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 448 512"
                                        fill="white"
                                        width="12"
                                        height="12"
                                    >
                                        <path
                                            d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <!-- Warning for duplicate file -->
                        <div
                            class="validate-line mt-3"
                            v-if="duplicates.length"
                        >
                            You have add duplicate csv files. Please remove the
                            duplicate file for
                            <span v-for="file in duplicates" :key="file.name"
                                >{{ file }}, &ThinSpace;
                            </span>
                        </div>
                        <!-- warning for missing fields -->
                        <div
                            class="validate-line mt-3"
                            v-if="missingFields.length"
                        >
                            Please check your CSVs files:
                            <div v-for="file in missingFields" :key="file">
                                File: {{ file.fileName }} at Line
                                {{ file.line }} have
                                {{ file.numberOfMissingField }}
                                {{ file.missingType }} field than default.
                                &ThinSpace;
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col">
                    <div class="btn primary-btn" @click="Submit">Submit</div>
                </div>
            </div>
        </div>
        <div class="row mt-4">
            <div
                class="col-sm-4 d-flex flex-md-row flex-column gap-2 align-items-start align-items-md-end"
            >
                <router-link
                    class="btn green-btn"
                    :to="'/essay-questions/' + skillId + '/add'"
                    >Essay
                </router-link>
                <TooltipBtn
                    absoluteTop="37px"
                    trianglePosition="left"
                    toolTipText="A question that requires a detailed, written response. Use complete sentences to explain, analyze, or provide your perspective on the given topic. Answers are graded on content, clarity, and depth of understanding."
                />
            </div>
        </div>
    </div>
    <div v-if="showModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
                <!-- Show below waring if there are files have missing field  -->
                <p class="mb-3" v-if="missingFields.length">
                    Your files contain questions with incorrect formatting.
                    <span class="text-warning"
                        >If you still wish to submit them, the lines below will
                        not be created:
                    </span>
                </p>
                <div
                    class="modal-warning-line mb-3"
                    v-for="file in missingFields"
                    :key="file"
                >
                    File: {{ file.fileName }} at Line {{ file.line }} have
                    {{ file.numberOfMissingField }}
                    {{ file.missingType }} field than default.
                </div>
                <!-- Show below warning if there are duplicate files name -->
                <p v-if="duplicates.length">
                    Please remove any duplicate files that are submitted below:
                </p>
                <div
                    class="modal-warning-line mb-3"
                    v-for="file in duplicates"
                    :key="file"
                >
                    File: {{ file }}.
                </div>
                <div
                    class="mt-4"
                    style="display: flex; gap: 10px; justify-content: end"
                >
                    <button
                        type="button"
                        class="btn green-btn"
                        @click="
                            clickModal = true;
                            Submit();
                        "
                    >
                        Still Submit
                    </button>
                    <button
                        type="button"
                        class="btn red-btn"
                        @click="showModal = false"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    line-height: 24px;
    display: flex;
    align-items: center;
    height: auto;
    width: fit-content;
}

.green-btn:hover {
    background-color: #3eb3a3;
}

.validate-line {
    font-size: 0.75rem;
    color: red;
    font-weight: 300;
}

/** Drop Zone Styling */
.dropzone-container {
    padding: 4rem;
    background: #f7fafc;
    border: 1px solid #e2e8f0;
    border: 2px dashed;
    border-color: #9e9e9e;
    margin-left: 10px;
    margin-right: 10px;
}

.hidden-input {
    opacity: 0;
    overflow: hidden;
    position: absolute;
    width: 1px;
    height: 1px;
}

.file-label {
    font-size: 20px;
    display: block;
    cursor: pointer;
}

.preview-container {
    margin-top: 2rem;
}

.preview-card {
    padding-top: 10px;
    display: flex;
    border: 1px solid #a2a2a2;
}

#click-here-label {
    text-decoration: underline;
    font-weight: 500;
}

#click-here-label:hover {
    color: #8f7bd6;
}

/* End Of Drop Zone Styling */

/* The Warning Modal */
.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 1;
    /* Sit on top */
    left: 0;
    top: 0;
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    overflow: auto;
    /* Enable scroll if needed */
    background-color: rgb(0, 0, 0);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
}

.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 650px;
    /* Could be more or less, depending on screen size */
    display: flex;
    justify-content: end;
}

.modal-warning-line {
    font-size: 1rem;
    color: red;
    font-weight: 400;
}
/* | End Of Warning Model Styling | */

/* Mobile */
@media (max-width: 480px) {
    .preview-container {
        margin-top: 0.4rem;
    }
    .dropzone-container {
        padding: 1rem;
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border: 2px dashed;
        border-color: #9e9e9e;
        margin-right: 0px;
        margin-left: 0px;
    }
    .file-label {
        font-size: 12px;
        display: flex;
        flex-wrap: wrap;
        cursor: pointer;
    }

    .preview-card {
        flex-direction: row;
        justify-content: space-between;
        margin-left: 10px;
    }

    .input-file-name {
        font-size: 14px;
    }

    .modal-content {
        background-color: #fefefe;
        border: 1px solid #888;
        width: 100%;
        /* Could be more or less, depending on screen size */
        display: flex;
        justify-content: end;
    }
    .modal-content {
        width: 100%;
    }
}
</style>
