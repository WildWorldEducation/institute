<script>
export default {
    props: {
        questions: {
            type: Array,
            required: true
        }
    },
    methods: {
        formatDate(unformattedDate) {
            // Prep the date and time data ---------------
            // Split timestamp into [ Y, M, D, h, m, s ]
            var date = unformattedDate.replace('T', ' ');
            date = date.replace('Z', ' ');
            let newDate = date.split(/[- :]/);
            // Apply each element to the Date function
            var finalDate = new Date(
                Date.UTC(
                    newDate[0],
                    newDate[1] - 1,
                    newDate[2],
                    newDate[3],
                    newDate[4],
                    newDate[5]
                )
            );
            var options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            };
            finalDate = finalDate.toLocaleDateString('en-US', options);
            return finalDate;
        }
    }
};
</script>

<template>
    <div class="container-fluid">
        <h2 class="secondary-heading h4">Check New Questions</h2>

        <div class="list-body pt-2">
            <div v-if="questions.length > 0">
                <div class="question" v-for="question in questions">
                    <RouterLink
                        class="question-link"
                        :to="`/check-student-question/${question.id}`"
                    >
                        <span class="student-name">
                            {{ question.student }},
                        </span>
                        <span class="skill-name">
                            {{ question.skillname }},
                        </span>
                        <span class="date">{{
                            formatDate(question.create_date)
                        }}</span>
                    </RouterLink>
                </div>
            </div>
            <div v-else class="empty-message">
                There are no student submitted questions to be checked
                currently.
            </div>
        </div>
    </div>
</template>

<style scoped>
.table-div {
    padding-left: 15px;
    padding-right: 15px;
}

.question-link {
    font-family: 'Poppins';
    font-size: 16px;
    font-weight: 500;
    line-height: 28px;
    letter-spacing: 0em;
    text-align: left;
    text-decoration: none;
    color: #667085;
}

.question {
    border: 1px solid #dbd0f9;
    margin: 0px;
    padding: 10px 6px;
}

.student-name {
    color: #8f7bd6;
}

.list-body {
    overflow: auto;
}
.empty-message {
    color: #667085;
}
</style>
