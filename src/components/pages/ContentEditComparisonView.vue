<script>
export default {
    setup() {},
    data() {
        return {
            id: this.$route.params.id,
            skillId: null,
            skill: {},
            contentEdit: {}
        };
    },
    async created() {
        await this.getContentEdit();
    },
    methods: {
        async getContentEdit() {
            await fetch('/content-edits/' + this.id)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.contentEdit = data;
                    console.log(this.contentEdit);
                    if (
                        this.contentEdit.content_type ==
                        'skill_mastery_requirements'
                    ) {
                        this.getSkill();
                    }
                });
        },
        async getSkill() {
            this.skillId = this.contentEdit.content_id;
            await fetch('/skills/show/' + this.skillId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.skill = data;
                    console.log(this.skill);
                });
        }
    }
};
</script>

<template>
    <div class="container">
        <div class="mt-4 mb-4">
            <h1 class="page-title">Comparison</h1>
            <h2>Change</h2>
            <div v-html="this.contentEdit.updated_content"></div>
            <h2>Original</h2>
            <div v-html="this.skill.mastery_requirements"></div>
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
