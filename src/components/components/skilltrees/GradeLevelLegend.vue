<script>
export default {
    setup() {},
    data() {
        return {};
    },

    methods: {
        // Toggle sidebar button.
        ToggleSidebar() {
            if (document.getElementById('sidebar').style.display == 'none') {
                document.getElementById('sidebar').style.display = 'block';
            } else {
                document.getElementById('sidebar').style.display = 'none';
            }
        }
    }
};
</script>

<template>
    <!-- <ul class="legend">
        <li class=""><span class="grade-school"></span>Grade school</li>
        <li class=""><span class="middle-school"></span> Middle school</li>
        <li class=""><span class="high-school"></span> High school</li>
        <li class=""><span class="college"></span> College</li>
        <li class=""><span class="phd"></span> PHD</li>
    </ul> -->
    <!-- Sidebar -->
    <button class="sidebar-btn btn" @click="ToggleSidebar()">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 192 512"
            height="24"
            width="24"
        >
            <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
            <path
                d="M144 80c0 26.5-21.5 48-48 48s-48-21.5-48-48s21.5-48 48-48s48 21.5 48 48zM0 224c0-17.7 14.3-32 32-32H96c17.7 0 32 14.3 32 32V448h32c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H64V256H32c-17.7 0-32-14.3-32-32z"
                fill="black"
            />
        </svg>
    </button>
    <div class="sidebar sidebar-animate-right" id="sidebar">
        <h4 class="pe-3">Cheat Sheet</h4>
        <p class="pe-3"><em>(Case doesn't matter)</em></p>
        <h5 class="mt-2">Left Task</h5>
        <ul>
            <li>High : w</li>
            <li>Medium : s</li>
            <li>Low : x</li>
        </ul>
        <h5 class="mt-2">Right Task</h5>
        <ul>
            <li>a : m</li>
            <li>b : ,</li>
            <li>c : .</li>
        </ul>
        <p>&nbsp;</p>
    </div>
</template>

<style scoped>
/* Game page */
.sidebar-btn {
    position: absolute;
    top: 150px;
    right: 0px;
    z-index: 1;
}

.sidebar {
    height: 100%;
    width: 200px;
    background-color: #fff;
    position: absolute !important;
    z-index: 1;
    overflow: auto;
    top: 200px;
    right: 0px;
    border-radius: 10px;
    padding: 10px;
}

.sidebar-animate-right {
    position: relative;
    animation: animateright 0.4s;
}

/* basic positioning */
.legend {
    list-style: none;
}
.legend li {
    margin-right: 0px;
    margin-top: 5px;
    font-size: 14px;
    text-align: start;
}
.legend span {
    border: 1px solid #ccc;
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
</style>
