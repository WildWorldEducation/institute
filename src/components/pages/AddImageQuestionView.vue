<script>
import TooltipBtn from '../components/share-components/TooltipBtn.vue';

export default {
    data() {
        return {
            skillId: this.$route.params.skillId,
            question: {
                name: '',
                question: '',
                numImagesRequired: 1
            },
            // validate object
            validate: {
                violated: false,
                name: false,
                question: false
            }
        };
    },
    components: {
        TooltipBtn
    },
    methods: {
        Submit() {
            // reset the validate flag before re-validate
            this.validate.violated = false;
            // Checking data before make POST request
            if (this.question.name === '' || this.question.name === null) {
                this.validate.name = true;
                this.validate.violated = true;
            }

            if (this.question.question === '' || this.question.name === null) {
                this.validate.question = true;
                this.validate.violated = true;
            }

            if (this.validate.violated) {
                return;
            }

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: this.question.name,
                    question: this.question.question,
                    skill_id: this.skillId,
                    num_images_required: this.question.numImagesRequired
                })
            };
            var url = '/questions/image-questions/add';
            fetch(url, requestOptions)
                .then(() => {
                    alert('Question added');
                })
                .then(() => {
                    this.$router.go(-1);
                });
        }
    }
};
</script>

<template>
    <div class="container p-3 bg-light rounded">
        <div
            class="d-flex flex-lg-row flex-column align-items-start align-items-lg-center gap-2"
        >
            <h1 class="heading">Add Image Question</h1>
            <TooltipBtn
                trianglePosition="left"
                absoluteTop="37px"
                toolTipText="A question that requires uploading an image for the answer, often to prove that a task in the real world has been completed."
            />
        </div>

        <div class="main-content-container container-fluid">
            <div class="row">
                <div id="form-container" class="col-lg-6 p-4">
                    <div class="mb-3">
                        <label for="first_name" class="form-label"
                            >Question Name</label
                        >
                        <input
                            v-model="question.name"
                            type="text"
                            class="form-control"
                        />
                        <div
                            v-if="
                                validate.name &&
                                (question.name === '' || question.name === null)
                            "
                            class="form-validate"
                        >
                            please enter a name for question !
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="last_name" class="form-label"
                            >Question</label
                        >
                        <textarea
                            v-model="question.question"
                            rows="5"
                            class="form-control"
                        >
                        </textarea>
                        <div
                            v-if="
                                validate.question &&
                                (question.question === '' ||
                                    question.question === null)
                            "
                            class="form-validate"
                        >
                            please enter question&CloseCurlyQuote;s content !
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label"
                            >Number of Images Required
                        </label>
                        <select
                            class="form-control"
                            v-model="question.numImagesRequired"
                        >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>
                    </div>

                    <div class="d-flex justify-content-end gap-4">
                        <a class="btn red-btn" @click="$router.go(-1)"
                            >Cancel</a
                        >
                        <button class="btn primary-btn" @click="Submit()">
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
#header-tile {
    color: #667085;
    font-family: 'Poppins' sans-serif;
    font-size: 2.375rem;
    font-weight: 900;
    line-height: 41px;
    letter-spacing: 0em;
    text-align: left;
    margin-top: auto;
    margin-bottom: 0px;
}

#header-icon {
    margin-left: 10px;
    width: 108px;
    height: 61px;
}

#form-container {
    background-color: #e4ecf4;
    border-radius: 12px;
}

.form-label {
    color: #344054;
    font-family: 'Poppins' sans-serif;
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: 0em;
    text-align: left;
}

.form-validate {
    font-size: 0.75rem;
    color: red;
    font-weight: 300;
}

.form-control:focus {
    border-color: white;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
        0 0 12px var(--primary-color);
}
</style>
