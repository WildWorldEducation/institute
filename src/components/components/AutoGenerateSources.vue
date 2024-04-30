<script>
export default {
    data() {
        return {
            numOfSourcesPerSkill: 3,
            rootDomain: null,
            blockedRootDomains: []
        };
    },
    created() {
        this.ListBlockedRootDomains();
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
        },
        DeleteSourcesByRootDomain() {
            let text = 'Are you sure?';
            if (confirm(text) == true) {
                var url = '/resources/delete-domain';
                fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        rootDomain: this.rootDomain
                    })
                });
            }
        },
        async ListBlockedRootDomains() {
            const result = await fetch('/resources/list-blocked-domains');
            const data = await result.json();
            this.blockedRootDomains = data;
        },
        UnBlockRootDomain(rootDomainId) {
            const result = fetch('/resources/unblock-domain/' + rootDomainId, {
                method: 'DELETE'
            });

            if (result.error) {
                console.log(result.error);
            }

            this.ListBlockedRootDomains();
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
        <h4>Delete All Sources and Block the Following Root Domain:</h4>
        <div class="mb-3">
            <label class="form-label">Domain:</label>
            <input type="text" v-model="rootDomain" class="form-control" />
            <button
                class="btn green-btn mt-3"
                @click="DeleteSourcesByRootDomain"
            >
                Delete
            </button>
        </div>
        <h4>Blocked Domains:</h4>
        <li v-for="domain in blockedRootDomains" class="d-flex">
            <span>{{ domain.root_domain }}&nbsp;</span>
            <button class="btn red-btn" @click="UnBlockRootDomain(domain.id)">
                <!-- X icon -->
                <svg
                    width="13"
                    height="13"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0.312625 14.5205L4.83312 9.99999L0.312625 5.49218C0.111396 5.29025 -0.00159545 5.0168 -0.00159545 4.73172C-0.00159545 4.44665 0.111396 4.17319 0.312625 3.97126L3.96282 0.312625C4.16474 0.111396 4.4382 -0.00159545 4.72327 -0.00159545C5.00835 -0.00159545 5.2818 0.111396 5.48373 0.312625L9.99999 4.83312L14.5205 0.312625C14.6204 0.21056 14.7397 0.12947 14.8714 0.0741101C15.003 0.0187502 15.1444 -0.00976563 15.2873 -0.00976562C15.4301 -0.00976563 15.5715 0.0187502 15.7032 0.0741101C15.8349 0.12947 15.9541 0.21056 16.0541 0.312625L19.6874 3.96282C19.8886 4.16474 20.0016 4.4382 20.0016 4.72327C20.0016 5.00835 19.8886 5.2818 19.6874 5.48373L15.1669 9.99999L19.6874 14.5205C19.8883 14.7217 20.0012 14.9944 20.0012 15.2788C20.0012 15.5632 19.8883 15.836 19.6874 16.0372L16.0541 19.6874C15.8529 19.8883 15.5801 20.0012 15.2957 20.0012C15.0113 20.0012 14.7386 19.8883 14.5374 19.6874L9.99999 15.1669L5.49218 19.6874C5.29025 19.8886 5.0168 20.0016 4.73172 20.0016C4.44665 20.0016 4.17319 19.8886 3.97126 19.6874L0.312625 16.0541C0.21056 15.9541 0.12947 15.8349 0.0741101 15.7032C0.0187502 15.5715 -0.00976563 15.4301 -0.00976562 15.2873C-0.00976563 15.1444 0.0187502 15.003 0.0741101 14.8714C0.12947 14.7397 0.21056 14.6204 0.312625 14.5205Z"
                        fill="white"
                    />
                </svg>
            </button>
        </li>
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

.red-btn {
    background-color: #da7033;
    color: white;
    border: 1px solid #7f56d9;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
}

.red-btn:hover {
    background-color: rgb(209, 96, 15);
}
</style>
