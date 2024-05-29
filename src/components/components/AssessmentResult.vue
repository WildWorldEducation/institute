<script>
// Import

export default {
    setup() {},
    data() {
        return {
            assessmentResult: '',
            finishDate: '',
            finishTime: '',
            parent: '',
            score: 0,
            // number of mc question is total score, default value to 1 to avoid divine with 0
            totalScore: 1,
            scorePercent: 0,
            mcQuestions: []
        };
    },
    mounted() {
        this.assessmentResult = this.$parent.assessmentStatus;

        // convert the date time string to readable format
        // pass undefined in first argument to make the function working with all language
        this.finishDate = this.$parent.finishTime.toLocaleString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        this.finishTime = this.$parent.finishTime.toLocaleTimeString();

        this.score = this.$parent.score;
        this.totalScore = this.$parent.numMCQuestions;
        this.scorePercent = Math.floor((this.score / this.totalScore) * 100);

        // only get mc question
        this.mcQuestions = this.$parent.questions.filter(
            (question) => question.questionType === 'mc'
        );
        console.log(this.mcQuestions);
    },
    methods: {}
};
</script>

<template>
    <div class="container mt-3">
        <div class="page-tile">Assessment Result</div>
        <!-- Assessment Info -->
        <div class="assessment-info">
            <div>
                <span class="info-label">Result:</span>
                <span
                    :class="
                        assessmentResult == 'pass'
                            ? 'student-pass'
                            : 'student-fail'
                    "
                    >{{ assessmentResult }}
                    <!-- failed icon -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 64 512"
                        fill="red"
                        height="14"
                        width="14"
                        class="status-icon"
                        v-if="assessmentResult === 'failed'"
                    >
                        <path
                            d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64V320c0 17.7 14.3 32 32 32s32-14.3 32-32V64zM32 480a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"
                        />
                    </svg>
                    <!-- pass icon -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                        fill="green"
                        height="14"
                        width="14"
                        class="status-icon"
                        v-if="assessmentResult === 'pass'"
                    >
                        <path
                            d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
                        />
                    </svg>
                </span>
            </div>
            <div>
                <span class="info-label">Finish Date: </span>
                <span class="info-value">
                    {{ finishDate }}
                    <span id="finish-time"> at {{ finishTime }}</span>
                </span>
            </div>
            <div
                class="hover-cursor"
                b-on-hover
                title="you need to score above 80% to pass the assessment"
            >
                <span class="info-label">Score: </span>
                <span class="info-value">{{ score }} out {{ totalScore }}</span>
                ( {{ scorePercent }}%)
                <span>*</span>
            </div>
        </div>
        <!-- Question list include right answer and explain -->
        <div class="mc-question-result" v-for="question of mcQuestions">
            <div>
                {{ question.question }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.hover-cursor:hover {
    cursor: pointer;
}

.page-tile {
    color: #8f7bd6;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
    font-size: 1.75rem;
}

.assessment-info {
    padding: 15px 20px;
    background-color: rgba(255, 255, 255, 0.692);
    border-radius: 5px;
    border: #8f7bd6 1px solid;
    margin: 10px 0px;
    width: fit-content;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.info-label {
    font-size: 16px;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    color: rgb(94, 93, 93);
    margin-right: 10px;
}

.info-value {
    font-size: 16px;
    font-family: 'Poppins', sans-serif;
}

#finish-time {
    font-size: 12px;
    color: rgb(65, 61, 61);
}

.status-icon {
    margin-left: -4px;
    margin-bottom: 4px;
}

.student-pass {
    color: rgb(6, 219, 6);
    font-weight: 600;
    font-size: 16px;
}

.student-fail {
    color: red;
    font-weight: 600;
    font-size: 16px;
}
</style>
