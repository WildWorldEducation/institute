<script>
import router from '../../router';

export default {
    data() {
        return {
            questionId: this.$route.params.id,
            question: {},
            // validate object
            validate: {
                validated: false,
                name: false,
                question: false
            }
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
                .then((data) => (this.question = data));
        },
        Submit() {
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
                            please enter question contend !
                        </div>
                    </div>
                    <div class="mb-3 d-flex justify-content-end">
                        <button @click="Submit()" class="btn purple-btn">
                            Submit
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
