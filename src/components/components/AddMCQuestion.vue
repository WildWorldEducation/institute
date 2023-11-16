<script>
export default {
    data() {
        return {
            skillId: this.$route.params.id,
            questionCSVFile: '',
            questionsArray: [],
        }
    },
    async created() {

    },
    mounted: function () {

    },
    methods: {
        OnFileChange(e) {
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length)
                return;

            this.ReadFile(files[0])
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
                    this.questionsArray[i] = CSVArray[i].split('|');
                }

            };
            reader.readAsText(file);
        },
        Submit() {
            const questionArray = []
            // For each question.
            for (let i = 0; i < this.questionsArray.length; i++) {
                const questionObject = {};
                questionObject.name = this.questionsArray[i][0]
                questionObject.question = this.questionsArray[i][1]
                questionObject.answer_1 = this.questionsArray[i][2]
                questionObject.answer_2 = this.questionsArray[i][3]
                questionObject.answer_3 = this.questionsArray[i][4]
                questionObject.answer_4 = this.questionsArray[i][5]
                questionObject.answer_5 = this.questionsArray[i][6]
                questionObject.correct_answer = this.questionsArray[i][7]
                questionObject.explanation = this.questionsArray[i][8]

                questionArray.push(questionObject)
            }

            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    questionArray
                })
            };
            var url = "/skills/" + this.skillId + "/mc-questions/add";

            fetch(url, requestOptions
            ).then(() => {
                this.$router.push("/skills/" + this.skillId + "/question-bank");
            });
        }
    }
} 
</script>

<template>
    <div class="container mt-3">
        <h1>Add Multiple Choice Question</h1>
        <div class="row">
            <div class="col-sm-4">
                <div v-if="!questionCSVFile">
                    <input class="form-control" type="file" accept=".csv" id="csvFile" @change="OnFileChange">
                    <p style="font-size: 14px"><em>Maximum file size 15mb</em></p>
                </div>
                <div v-else>
                    <p><button class="btn btn-warning" @click="removeImage">Remove file</button></p>
                </div>
                <button class="btn btn-dark" @click="Submit()">Submit</button>
            </div>
        </div>
    </div>
</template> 

<style scoped></style>