<script>
export default {
    setup() {},
    data() {
        return {
            contentEdits: [],
            skillEdits: []
        };
    },
    async created() {
        await this.getSkillEditsSubmittedForReview();
    },
    methods: {
        async getSkillEditsSubmittedForReview() {
            await fetch('/skills/submitted-for-review/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        // Prep the date and time data ---------------
                        // Split timestamp into [ Y, M, D, h, m, s ]
                        var date = data[i].date.replace('T', ' ');
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
                        data[i].date = finalDate.toLocaleDateString(
                            'en-US',
                            options
                        );

                        this.skillEdits.push(data[i]);
                    }
                });
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
            <h2>Questions</h2>
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
