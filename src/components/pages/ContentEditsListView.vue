<script>
export default {
    setup() {},
    data() {
        return {
            skillEdits: [],
            mcQuestionEdits: [],
            essayQuestionEdits: []
        };
    },
    async created() {
        await this.getSkillEditsSubmittedForReview();
        await this.getMCQuestionEditsSubmittedForReview();
        await this.getEssayQuestionEditsSubmittedForReview();
    },
    methods: {
        // Get the skill edits that have been submitted for review.
        async getSkillEditsSubmittedForReview() {
            await fetch('/skills/submitted-for-review/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].date = this.formatDate(data[i].date);
                        this.skillEdits.push(data[i]);
                    }
                });
        },
        // Get the multiple choice question edits that have been submitted for review.
        async getMCQuestionEditsSubmittedForReview() {
            await fetch('/questions/mc/submitted-for-review/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].date = this.formatDate(data[i].date);
                        this.mcQuestionEdits.push(data[i]);
                    }
                });
        },
        // Get the multiple choice question edits that have been submitted for review.
        async getEssayQuestionEditsSubmittedForReview() {
            await fetch('/questions/essay/submitted-for-review/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].date = this.formatDate(data[i].date);
                        this.essayQuestionEdits.push(data[i]);
                    }
                });
        },
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
    <div class="container">
        <div class="mt-4 mb-4">
            <h1 class="page-title">List of edits</h1>
            <h2>Skills</h2>
            <ul>
                <li v-for="skillEdit in skillEdits">
                    <router-link
                        :to="'/content-edit/' + skillEdit.id + '/comparison'"
                        >User: {{ skillEdit.user_id }}, Skill:
                        {{ skillEdit.content_id }}, Date:
                        {{ skillEdit.date }}</router-link
                    >
                </li>
            </ul>
            <h2>Multiple Choice Questions</h2>
            <ul>
                <li v-for="mcQuestionEdit in mcQuestionEdits">
                    <router-link
                        :to="
                            '/content-edit/' + mcQuestionEdit.id + '/comparison'
                        "
                        >User: {{ mcQuestionEdit.user_id }}, Question:
                        {{ mcQuestionEdit.content_id }}, Date:
                        {{ mcQuestionEdit.date }}</router-link
                    >
                </li>
            </ul>
            <h2>Written Questions</h2>
            <ul>
                <li v-for="essayQuestionEdit in essayQuestionEdits">
                    <router-link
                        :to="
                            '/content-edit/' +
                            essayQuestionEdit.id +
                            '/comparison'
                        "
                        >User: {{ essayQuestionEdit.user_id }}, Question:
                        {{ essayQuestionEdit.content_id }}, Date:
                        {{ essayQuestionEdit.date }}</router-link
                    >
                </li>
            </ul>
        </div>
    </div>
</template>

<style>
.page-title {
    color: #a48be7;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
}
</style>
