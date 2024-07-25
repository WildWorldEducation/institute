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
        await this.getContentEdits();
    },
    methods: {
        async getContentEdits() {
            await fetch('/content-edits/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.contentEdits = data;

                    for (let i = 0; i < this.contentEdits.length; i++) {
                        // Prep the date and time data ---------------
                        // Split timestamp into [ Y, M, D, h, m, s ]
                        var date = this.contentEdits[i].date.replace('T', ' ');
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
                        this.contentEdits[i].date =
                            finalDate.toLocaleDateString('en-US', options);

                        if (
                            this.contentEdits[i].content_type ==
                            'skill_mastery_requirements'
                        ) {
                            this.skillEdits.push(this.contentEdits[i]);
                        }
                    }
                    console.log(this.skillEdits);
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
