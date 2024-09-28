<script>
export default {
    data() {
        return {
            numOfSourcesPerSkill: 3,
            blockedRootDomain: null,
            blockedRootDomains: [],
            whiteListedRootDomain: null,
            whiteListedRootDomains: []
        };
    },
    created() {
        this.ListBlockedRootDomains();
        this.ListWhiteListedRootDomains();
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
                        blockedRootDomain: this.blockedRootDomain
                    })
                });
            }
        },
        async ListBlockedRootDomains() {
            const result = await fetch('/resources/list-blocked-domains');
            const data = await result.json();
            this.blockedRootDomains = data;
        },
        async UnBlockRootDomain(rootDomainId) {
            const result = await fetch(
                '/resources/unblock-domain/' + rootDomainId,
                {
                    method: 'DELETE'
                }
            );

            if (result.error) {
                console.log(result.error);
            }

            this.ListBlockedRootDomains();
        },
        AddRootDomainToWhiteList() {
            var url = '/resources/add-domain-to-whitelist';
            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    whiteListedRootDomain: this.whiteListedRootDomain
                })
            }).then(() => {
                this.ListWhiteListedRootDomains();
            });
        },
        async ListWhiteListedRootDomains() {
            const result = await fetch('/resources/list-whitelisted-domains');
            const data = await result.json();
            this.whiteListedRootDomains = data;
        },
        async RemoveFromWhiteList(rootDomainId) {
            const result = await fetch(
                '/resources/remove-domain-from-whitelist/' + rootDomainId,
                {
                    method: 'DELETE'
                }
            );

            if (result.error) {
                console.log(result.error);
            }

            this.ListWhiteListedRootDomains();
        },
        DeleteDuplicateSources() {
            const result = fetch('/resources/delete-duplicate-sources', {
                method: 'DELETE'
            });

            if (result.error) {
                console.log(result.error);
            }
        },
        DeleteBrokenSources() {
            const result = fetch('/resources/delete-broken-sources', {
                method: 'DELETE'
            });

            if (result.error) {
                console.log(result.error);
            }
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
                <button  class="btn green-btn mt-3" @click="GenerateSources">
                    Generate Sources
                </button>
                <p style="font-size: 14px" class="mt-2">
                    <strong>Notes:</strong>
                    <ul>
                        <li><em>To be done by devs and not admins.</em></li>
                        <li><em>It can cost a lot each time.</em></li>
                        <li><em>It runs for all ~3700 relevant skills.</em></li>                        
                        <li><em>It crashes frequently.</em></li>                        
                    </ul>
                </p>
            </div>
        </div>
        <h2 class="mt-3">Blacklist Domain</h2>
        <div class="mb-4">
            <input
                type="text"
                v-model="blockedRootDomain"
                class="form-control"
            />
            <button class="btn red-btn mt-3" @click="DeleteSourcesByRootDomain">
                Delete & Block
            </button>
            <p style="font-size: 14px">
                <em>This will also delete sources using these domains.</em>
            </p>
        </div>
        <h3>Blacklisted Domains:</h3>
        <ul class="mb-5">
            <li v-for="domain in blockedRootDomains">
                <span class="d-flex"
                    ><span>{{ domain.root_domain }}&nbsp;</span>
                    <button
                        class="btn red-btn red-mini-btn"
                        @click="UnBlockRootDomain(domain.id)"
                    >
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
                        </svg></button
                ></span>
            </li>
        </ul>
        <h2>Whitelist Domain:</h2>
        <div class="mb-3">
            <input
                type="text"
                v-model="whiteListedRootDomain"
                class="form-control"
            />
            <button
                class="btn green-btn mt-3"
                @click="AddRootDomainToWhiteList()"
            >
                Add
            </button>
            <p style="font-size: 14px">
                <em>The AI will preference these domains.</em>
            </p>
        </div>
        <h3 class="mt-4">Whitelisted Domains:</h3>
        <ul>
            <li v-for="domain in whiteListedRootDomains">
                <span class="d-flex"
                    ><span>{{ domain.root_domain }}&nbsp;</span>
                    <button
                        class="btn red-btn red-mini-btn"
                        @click="RemoveFromWhiteList(domain.id)"
                    >
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
                        </svg></button
                ></span>
            </li>
        </ul>
        <h2 class="mt-5">Delete Duplicate Sources</h2>
        <button class="btn red-btn mt-3" @click="DeleteDuplicateSources">
            Delete
        </button>
        <p style="font-size: 14px">
            <ul>
                <li><em>To be done by devs and not admins.</em></li>
                <li><em>To search for and delete duplicate urls for the same skill.</em></li>
            </ul>            
        </p>
        <h2 class="mt-5">Scan For and Delete Sources with Broken Links</h2>
        <button class="btn red-btn mt-3" @click="DeleteBrokenSources">
            Scan and Delete
        </button>
        <div style="font-size: 14px" class="mt-2">
            <strong>Notes:</strong>
            <ul>
                <li><em>To be done by devs and not admins.</em></li>
                <li><em>To search for sources containing broken urls.</em></li>                        
                <li><em>Need to be deleted manually.</em></li>                        
                <li><em>Need to check them manually first.</em></li>                        
            </ul>            
        </div>
    </div>
</template>

<style scoped>
.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    font-size: 1rem;
    line-height: 24px;
    display: flex;
    align-items: center;
    height: auto;
    width: fit-content;
    font-weight: 400;
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
    height: auto;
}

.red-btn:hover {
    background-color: rgb(209, 96, 15);
}

.red-mini-btn {
    height: 22px;
}
</style>
