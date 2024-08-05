<script>
import RadialTree from '../components/skilltrees/RadialTree.vue';

export default {
    setup() {},
    data() {
        return {};
    },
    components: { RadialTree },
    methods: {
        // Toggle info bar.
        ToggleInfobar() {
            if (document.getElementById('legend').style.display == 'none') {
                document.getElementById('legend').style.display = 'block';
            } else {
                document.getElementById('legend').style.display = 'none';
            }
        }
    }
};
</script>

<template>
    <div id="legend" class="collapsible-tree-legend container-fluid p-2">
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
    <div id="thin-purple-banner">
        <button
            id="info-button"
            class="sidebar-btn btn"
            @click="ToggleInfobar()"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 192 512"
                height="12"
                width="12"
            >
                <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
                <path
                    d="M144 80c0 26.5-21.5 48-48 48s-48-21.5-48-48s21.5-48 48-48s48 21.5 48 48zM0 224c0-17.7 14.3-32 32-32H96c17.7 0 32 14.3 32 32V448h32c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H64V256H32c-17.7 0-32-14.3-32-32z"
                    fill="black"
                />
            </svg>
        </button>
    </div>
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
#legend {
    display: block;
    overflow-x: hidden;
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

    #print-btn {
        margin-bottom: 5px;
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
/* Level colors */
.legend .grade-school {
    background-color: #3ecd14;
}
.legend .middle-school {
    background-color: #b9db42;
}
.legend .high-school {
    background-color: #f5e379;
}
.legend .college {
    background-color: #f1a335;
}
.legend .phd {
    background-color: #e42b24;
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
