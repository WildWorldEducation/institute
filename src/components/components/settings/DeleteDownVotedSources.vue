<script>
// Import the stores.

export default {
    setup() {},
    data() {
        return {
            totalDownVotedSources: 0
        };
    },
    async created() {
        await this.getTotalDownvotedSources();
    },
    methods: {
        async getTotalDownvotedSources() {
            fetch('/resources/downvoted')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    console.log(data);
                    this.totalDownVotedSources = data;
                });
        },
        async deleteSources() {
            await fetch('/resources/downvoted', {
                method: 'DELETE'
            });

            alert('all gone');
        }
    }
};
</script>

<template>
    <div class="container pb-3 px-3 px-lg-0">
        <section>
            <hr />
            <h2 class="title">Downvoted Sources</h2>
            <p>Number of downvoted sources: {{ totalDownVotedSources }}</p>
            <button
                type="button"
                @click="deleteSources"
                class="btn btn-danger delete-btn"
            >
                Delete them
            </button>
        </section>
    </div>
</template>

<style scoped>
.title {
    font-family: 'Poppins' sans-serif;
    color: #8f7bd6;
    font-weight: 600;
    line-height: 28px;
    letter-spacing: 0em;
}
</style>
