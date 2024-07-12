<script setup>
import RadialTree from '../components/skilltrees/RadialTree.vue';
</script>

<template>
    <div class="collapsible-tree-legend container-fluid p-2">
        <div class="mobile-legend">
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
        <div class="tablet-and-up-legend">
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
                        id="print-btn"
                        class="btn btn-info me-3"
                        @click="$refs.childComponent.printPDF()"
                    >
                        Print
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div id="thin-purple-banner"></div>
    <!-- Display loading screen while asynchronous call is made. -->
    <Suspense>
        <template #default>
            <RadialTree ref="childComponent" />
        </template>
        <template #fallback>
            <span>Loading...</span>
        </template>
    </Suspense>
</template>

<style>
#thin-purple-banner {
    height: 20px;
    background-color: #a48be640;
}

/* Grade level legend */

.collapsible-tree-legend {
    width: 100%;
}

/* X-Small devices (portrait phones, less than 576px) */
@media (max-width: 575.98px) {
    .mobile-legend {
        display: block;
    }

    .tablet-and-up-legend {
        display: none;
    }
}

/* Bigger devices */
@media (min-width: 576px) {
    .mobile-legend {
        display: none;
    }

    .tablet-and-up-legend {
        display: block;
    }
}

.legend span {
    float: left;
    width: 20px;
    height: 20px;
    margin: 2px;
    border-radius: 50%;
}
/* your colors */
.legend .grade-school {
    background-color: #36bbaa;
}
.legend .middle-school {
    background-color: #97c8f7;
}
.legend .high-school {
    background-color: #3983dd;
}
.legend .college {
    background-color: #ab94e3;
}
.legend .phd {
    background-color: #a48be5;
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
</style>
