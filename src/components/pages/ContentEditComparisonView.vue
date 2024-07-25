<script>
export default {
    setup() {},
    data() {
        return {
            id: this.$route.params.id,
            skillId: null,
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
                });
        },
        async getSkill()
        {
            
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
            <div></div>
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
