<script>
export default {
    data() {
        return {
            questionCSVFile: '',
            questionsArray: []
        };
    },
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
                var CSVString = e.target.result;
                // Break CSV into individual questions.
                var CSVArray = CSVString.split(/\r?\n|\r|\n/g);

                // Break individual questions into arrays.
                for (let i = 0; i < CSVArray.length; i++) {
                    // Remove any empty lines.
                    if (CSVArray[i] == '') {
                        CSVArray.splice(i, 1);
                    }
                    this.questionsArray[i] = CSVArray[i].split('|');

                    // Validation - checking for missing fields.
                    if (this.questionsArray[i].length != 8) {
                        alert(
                            'Please check your CSVs. There are fields missing.'
                        );
                        this.questionsArray = [];
                        return;
                    }
                }
            };
            reader.readAsText(file);
        },
        Submit() {
            const questionArray = [];
            // For each question.
            for (let i = 0; i < this.questionsArray.length; i++) {
                const questionObject = {};
                questionObject.name = this.questionsArray[i][0];
                questionObject.question = this.questionsArray[i][1];
                questionObject.correct_answer = this.questionsArray[i][2];
                questionObject.incorrect_answer_1 = this.questionsArray[i][3];
                questionObject.incorrect_answer_2 = this.questionsArray[i][4];
                questionObject.incorrect_answer_3 = this.questionsArray[i][5];
                questionObject.incorrect_answer_4 = this.questionsArray[i][6];
                questionObject.explanation = this.questionsArray[i][7];

                questionArray.push(questionObject);
            }

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionArray
                })
            };
            var url = '/skills/' + this.skillId + '/mc-questions/add';

            fetch(url, requestOptions).then(() => {
                this.$router.push('/skills/' + this.skillId + '/question-bank');
            });
        }
    }
};
</script>

<template>
    <div class="container mt-3 pb-5 px-3 px-lg-0">
        <hr />
        <h1>Add MC Questions in Bulk</h1>
        <div class="row">
            <div class="col-sm-4">
                <div v-if="!questionCSVFile">
                    <input
                        class="form-control"
                        type="file"
                        accept=".csv,.txt"
                        id="csvFile"
                        @change="OnFileChange"
                    />
                    <p style="font-size: 14px">
                        <em>Maximum file size 15mb</em>
                    </p>
                </div>
                <div v-else>
                    <p>
                        <button class="btn btn-warning" @click="removeImage">
                            Remove file
                        </button>
                    </p>
                </div>
                <button class="btn green-btn" @click="Submit()">Submit</button>
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
</style>
