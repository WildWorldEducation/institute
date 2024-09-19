<script>
export default {
    setup() {},
    data() {
        return {
            sourceId: this.$route.params.sourceId,
            source: {},
            isNotFound: false
        };
    },
    async created() {
        await this.getSource();
    },
    methods: {
        async getSource() {
            fetch('/resources/user-activity-report/show/' + this.sourceId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.source = data.source;

                    if (this.source == 'not found') {
                        this.isNotFound = true;
                    }
                });
        }
    }
};
</script>

<template>
    <div class="container">
        <p v-if="isNotFound">Source not found</p>
        <div v-else>
            <h1>Source content</h1>
            <div class="source">
                <!-- Post Content -->
                <div class="forum-post w-auto" v-html="source.content"></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.source {
    background-color: #f2edff;
}
.forum-post {
    padding: 10px;
    border-radius: 5px;
    background-color: white;
}
</style>
