<script>
import { useSessionDetailsStore } from '../../stores/SessionDetailsStore.js';
import TidyTree from '../components/skilltrees/TidyTree.vue';
import TidyTreeNoAccount from '../components/skilltrees/TidyTreeNoAccount.vue';

export default {
    setup() {
        const sessionDetailsStore = useSessionDetailsStore();

        return {
            sessionDetailsStore
        };
    },
    data() {
        return {};
    },
    created() {},
    components: { TidyTree, TidyTreeNoAccount },
    methods: {
        resetPos() {
            this.$refs.childComponent.resetPos();
        }
    }
};
</script>

<template>
    <div id="legend" class="collapsible-tree-legend container-fluid p-2">
        <div id="mobile-legend">
            <div class="legend row">
                <div class="col-8">
                    <div class="col">
                        <span class="grade-school"></span>Grade school
                    </div>
                    <div class="col">
                        <span class="middle-school"></span> Middle school
                    </div>
                    <div class="col">
                        <span class="high-school"></span> High school
                    </div>
                    <div class="col"><span class="college"></span> College</div>
                    <div class="col"><span class="phd"></span> PHD</div>
                </div>
                <div class="col-4 d-flex flex-column align-items-end">
                    <button
                        v-if="sessionDetailsStore.isLoggedIn"
                        id="print-btn"
                        class="btn btn-info"
                        @click="$refs.childComponent.printPDF()"
                    >
                        Print
                    </button>
                    <button
                        id="reset-btn"
                        class="btn btn-primary"
                        @click="resetPos()"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
        <div id="tablet-and-up-legend">
            <div class="legend row">
                <div class="col">
                    <span class="grade-school"></span>Grade school
                </div>
                <div class="col">
                    <span class="middle-school"></span> Middle school
                </div>
                <div class="col">
                    <span class="high-school"></span> High school
                </div>
                <div class="col"><span class="college"></span> College</div>
                <div class="col"><span class="phd"></span> PHD</div>

                <div class="col d-flex justify-content-end">
                    <button
                        v-if="sessionDetailsStore.isLoggedIn"
                        id="print-btn"
                        class="btn btn-info me-3"
                        @click="$refs.childComponent.printPDF()"
                    >
                        Print
                    </button>
                    <button
                        id="reset-btn"
                        class="btn btn-primary"
                        @click="resetPos()"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    </div>
    <!-- Display loading screen while asynchronous call is made. -->
    <Suspense>
        <template #default>
            <TidyTree
                v-if="sessionDetailsStore.isLoggedIn"
                ref="childComponent"
            />
            <TidyTreeNoAccount v-else ref="childComponent" />
        </template>
        <template #fallback>
            <span>Loading...</span>
        </template>
    </Suspense>
</template>

<style>
#legend {
    display: block;
    overflow-x: hidden;
    border-bottom: 2px #a48be640 solid;
}

#info-button {
    width: 50px;
    height: 20px;
    padding: 0px;
    float: right;
}

#info-button svg {
    width: 25px;
    height: 15px;
    margin-bottom: 8px;
}

#thin-purple-banner {
    height: 2px;
    background-color: #a48be640;
}

/* Grade level legend */

.collapsible-tree-legend {
    width: 100%;
}

/* Small devices (portrait phones) */
@media (max-width: 800px) {
    #mobile-legend {
        display: block;
    }

    #tablet-and-up-legend {
        display: none;
    }

    #print-btn {
        margin-bottom: 5px;
    }
}

/* Bigger devices */
@media (min-width: 801px) {
    #mobile-legend {
        display: none;
    }

    #tablet-and-up-legend {
        display: block;
    }
    .legend {
        align-items: center;
    }

    .legend .col {
        display: flex;
    }
    .legend span {
        flex-shrink: 0;
    }
}

.legend span {
    float: left;
    width: 20px;
    height: 20px;
    margin: 2px;
    border-radius: 50%;
}
/* Level colors */
.legend .grade-school {
    background-color: #40e0d0;
}
.legend .middle-school {
    background-color: #33a133;
}
.legend .high-school {
    background-color: #ffd700;
}
.legend .college {
    background-color: #ffa500;
}
.legend .phd {
    background-color: #ff0000;
}

#print-btn {
    background-color: #184e80;
    border: #184e80;
    color: white;
    width: 70px;
    max-height: 40px;
}

#print-btn:hover {
    background-color: #133b61;
}

#reset-btn {
    background-color: #c4d2df;
    border-color: #c4d2df;
    color: black;
    width: 70px;
    max-height: 40px;
}

#reset-btn:hover {
    background-color: #9da7b1;
}

/*---*/
</style>
