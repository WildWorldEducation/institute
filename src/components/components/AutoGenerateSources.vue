<script>
export default {
    data() {
        return {
            numOfSourcesPerSkill: 7
        };
    },
    methods: {
        async GenerateSources() {
            var url = '/resources/generate-sources';
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    numSources: this.numOfSourcesPerSkill
                })
            });
        }
    }
};
</script>

<template>
    <div class="container mt-3 pb-5 px-3 px-lg-0">
        <hr />
        <h1>Auto Generate Sources</h1>
        <div class="row">
            <div class="col-sm-4">
                <p>Number of sources per skill to generate:</p>
                <button class="btn green-btn" @click="GenerateSources">
                    Generate Sources
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    line-height: 24px;
    display: flex;
    align-items: center;
    height: auto;
    width: fit-content;
}

.green-btn:hover {
    background-color: #3eb3a3;
}
</style>
