<script>
export default {
    setup() {},
    data() {
        return {
            skillId: this.$route.params.contentId,
            userId: this.$route.params.userId,
            skill: {},
            skillEdit: {},
            comment: ''
        };
    },
    async created() {
        await this.getSkillEdit();
        await this.getSkill();

        // Render the Summernote content.
        $('#summernote').summernote(
            'code',
            this.skillEdit.mastery_requirements
        );
        // Disable editing.
        $('#summernote')
            .next()
            .find('.note-editable')
            .attr('contenteditable', false);
    },
    methods: {
        async getSkillEdit() {
            await fetch(
                '/skills/submitted-for-review/' +
                    this.skillId +
                    '/' +
                    this.userId
            )
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.skillEdit = data;
                    this.comment = data.comment;
                });
        },
        async getSkill() {
            await fetch('/skills/show/' + this.skillId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.skill = data.mastery_requirements;
                });
        },
        dismissEdit() {
            if (confirm('Delete this edit?')) {
                const result = fetch(
                    '/skills/submitted-for-review/' +
                        this.skillId +
                        '/' +
                        this.userId,
                    {
                        method: 'DELETE'
                    }
                );

                if (result.error) {
                    console.log(result.error);
                }

                // Return to hub page.
                this.$router.back();
            }
        },
        edit() {
            $('#summernote')
                .next()
                .find('.note-editable')
                .attr('contenteditable', true);
        },
        saveEdit() {
            // Update this content, in case it has been changed.
            this.skillEdit.mastery_requirements =
                $('#summernote').summernote('code');

            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mastery_requirements: this.skillEdit.mastery_requirements,
                    comment: this.comment
                })
            };

            var url =
                '/skills/' + this.skillEdit.skill_id + '/edit-for-review/save';
            fetch(url, requestOptions).then(() => {
                this.$router.back();
            });

            // Delete it afterwards.
            const result = fetch(
                '/skills/submitted-for-review/' +
                    this.skillId +
                    '/' +
                    this.userId,
                {
                    method: 'DELETE'
                }
            );

            if (result.error) {
                console.log(result.error);
            }
        }
    }
};
</script>

<template>
    <div class="container mt-4 mb-4">
        <h1 class="page-title">Comparison</h1>
        <div class="row">
            <div class="col">
                <h2>Change</h2>
                <h5>Mastery Requirements</h5>
                <textarea
                    class="form-control"
                    v-model="skillEdit.mastery_requirements"
                    id="summernote"
                    rows="3"
                ></textarea>
                <h3 class="mt-2">Comment</h3>
                <p>{{ comment }}</p>
            </div>
            <div class="col">
                <h2>Original</h2>
                <h5>Mastery Requirements</h5>
                <div v-html="skill"></div>
            </div>
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
