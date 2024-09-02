<script>
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
            questionId: this.$route.params.id,
            question: {},
            // validate object
            validate: {
                validated: false,
                name: false,
                question: false
            },
            comment: '',
            originalQuestion: {}
        };
    },
    created() {
        this.getQuestion();
    },
    methods: {
        getQuestion() {
            fetch('/questions/essay/show/' + this.questionId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.question = data;
                    this.originalQuestion = { ...data };
                    console.log(this.question);
                });
        },
        // If edit is from an admin or editor.
        Submit() {
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: this.question.name,
                    question: this.question.question
                })
            };

            var url = '/questions/essay/' + this.questionId + '/edit';
            fetch(url, requestOptions).then(() => {
                this.$router.back();
            });
        },
        // If edit is from a student or instructor.
        SubmitForReview() {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userDetailsStore.userId,
                    name: this.question.name,
                    question: this.question.question,
                    comment: this.comment
                })
            };

            var url =
                '/questions/essay/' + this.questionId + '/edit-for-review';
            fetch(url, requestOptions).then(() => {
                alert(
                    `This edit is being submitted for review.\nWe do this to prevent misinformation and sloppy wording from being added. If you would like to become an editor and help with this, please reach out.`
                );
                this.$router.back();
            });
        },
        ValidateForm(submissionType) {
            // reset validate flag before checking
            this.validate.validated = false;

            if (this.question.name === '' || this.question.name === null) {
                this.validate.name = true;
                this.validate.validated = true;
            }

            if (
                this.question.question === '' ||
                this.question.question === null
            ) {
                this.validate.question = true;
                this.validate.validated = true;
            }

            if (this.validate.validated) {
                return;
            }

            if (submissionType == 'submission') {
                this.Submit();
            } else if (submissionType == 'submissionForReview') {
                this.SubmitForReview();
            }
        }
    },
    computed: {
        isFormChanged() {
            return (
                this.question.name !== this.originalQuestion.name ||
                this.question.question !== this.originalQuestion.question ||
                this.comment != ''
            );
        }
    }
};
</script>

<template>
    <div id="banner">
        <img
            src="/images/banners/edit-mastery-skill-banner.png"
            class="image-fluid"
        />
    </div>
    <div class="container mt-3">
        <div class="row">
            <div class="col-10 d-flex align-items-end">
                <h2 id="header-tile">Edit Question</h2>
                <img src="/images/recurso-69.png" id="header-icon" />
            </div>
        </div>
        <div class="main-content-container container-fluid mt-4">
            <div class="row p-0">
                <div id="form-container" class="col-lg-7 p-4">
                    <div class="mb-3">
                        <label class="form-label">Name</label>
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
                            please enter a question name !
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Question</label>
                        <textarea
                            v-model="question.question"
                            rows="3"
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
                            please enter question content !
                        </div>
                    </div>

                    <!--Optional comment if this is a student/instructor submitting an edit for review --->
                    <div
                        v-if="
                            userDetailsStore.role == 'instructor' ||
                            userDetailsStore.role == 'student'
                        "
                        class="mb-3"
                    >
                        <label class="form-label"
                            >Optional: explain this edit</label
                        >
                        <textarea
                            v-model="comment"
                            class="form-control"
                            rows="3"
                        ></textarea>
                    </div>

                    <div class="mb-3 d-flex justify-content-end">
                        <button
                            v-if="
                                userDetailsStore.role == 'admin' ||
                                userDetailsStore.role == 'editor'
                            "
                            @click="ValidateForm('submission')"
                            class="btn purple-btn"
                            :disabled="!isFormChanged"
                        >
                            Submit
                        </button>
                        <button
                            v-else-if="
                                userDetailsStore.role == 'instructor' ||
                                userDetailsStore.role == 'student'
                            "
                            class="btn purple-btn"
                            @click="ValidateForm('submissionForReview')"
                            :disabled="!isFormChanged"
                        >
                            <div class="d-none d-md-block">
                                Submit for review
                            </div>
                            <!-- Pencil Into Square Icon -->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                fill="white"
                                height="20"
                                width="20"
                                class="d-md-none"
                            >
                                <path
                                    d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
#banner {
    width: 100%;
    height: fit-content;
}

.image-fluid {
    width: 100%;
    height: auto;
}

.red-btn {
    background-color: #e24d4d;
    color: white;
    border: 1px solid #d33622;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
}

.red-btn:hover {
    background-color: #cc3535;
}

.purple-btn {
    background-color: #a48be6;
    color: white;
    border: 1px solid #7f56d9;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
}

.purple-btn:hover {
    background-color: #7f56d9;
    color: white;
}

.purple-btn:focus {
    background-color: #7f56d9;
    color: white;
}

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
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 12px #a48be6;
}
</style>
