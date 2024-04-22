<script>
export default {
    data() {
        return {
            numOfSourcesPerSkill: 3
        };
    },
    methods: {
        async GenerateSources() {
            alert(
                'Sources will now be generated for all skills. This will take some time.'
            );
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
            <div class="col">
                <label for="numSourcesPerSkill" class="form-label"
                    >Number of sources per skill to generate (max 10):</label
                >
                <input
                    v-model="numOfSourcesPerSkill"
                    type="number"
                    id="numSourcesPerSkill"
                    min="1"
                    max="10"
                    step="1"
                    class="form-control"
                    aria-describedby="numSourcesPerSkill"
                    onkeypress="return event.charCode >= 48 && event.charCode <= 57"
                />
                <button class="btn green-btn mt-3" @click="GenerateSources">
                    Generate Sources
                </button>
                <p style="font-size: 14px">
                    <em>Warning, this can cost a lot each time.</em>
                </p>
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
