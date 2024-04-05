<script>
export default {
    setup() {},
    data() {
        return {
            // we store old scale value for zooming function
            oldScale: 0
        };
    },
    computed: {},
    async mounted() {
        // Zoom range slider.
        let zoomSlider = document.getElementById('zoomRange');
        zoomSlider.step = '0.1';

        // store initial scale value
        this.oldScale = this.$parent.scale;

        // Mouse.
        zoomSlider.addEventListener('mouseup', () => {
            // calculate the proportion of new scale and ole scale
            const scaleProportion = this.oldScale / this.$parent.scale;
            // just like the panning we have to multiple the pan value when scale is smaller than 0
            // because in the d3 handler we divide the value with scale
            let panX =
                zoomSlider.value >= 1
                    ? this.$parent.panX
                    : this.$parent.panX * zoomSlider.value;
            let panY =
                zoomSlider.value >= 1
                    ? this.$parent.panY
                    : this.$parent.panY * zoomSlider.value;
            // calculate pan value so we can zoom into center of the screen
            panX = panX * scaleProportion;
            panY = panY * scaleProportion;
            this.$parent.scale = zoomSlider.value;
            // store new scale value
            this.oldScale = zoomSlider.value;
            this.$parent.zoomInD3(zoomSlider.value, panX, panY);
        });

        // Touch.
        zoomSlider.addEventListener('touchend', () => {
            // calculate the proportion of new scale and ole scale
            const scaleProportion = zoomSlider.value / this.$parent.scale;
            // just like the panning we have to multiple the pan value when scale is smaller than 0
            // because in the d3 handler we divide the value with scale
            let panX =
                zoomSlider.value >= 1
                    ? this.$parent.panX
                    : this.$parent.panX * zoomSlider.value;
            let panY =
                zoomSlider.value >= 1
                    ? this.$parent.panY
                    : this.$parent.panY * zoomSlider.value;
            // calculate pan value so we can zoom into center of the screen
            panX = panX * scaleProportion;
            panY = panY * scaleProportion;
            this.$parent.scale = zoomSlider.value;
            this.$parent.zoomInD3(zoomSlider.value, panX, panY);
        });
    },
    methods: {}
};
</script>

<template>
    <div id="sliderWrapper">
        <div class="slideContainer">
            <input
                type="range"
                min="0.05"
                max="2"
                v-model="this.$parent.scale"
                id="zoomRange"
                step="0.01"
                orient="vertical"
            />
        </div>
    </div>
</template>

<style scoped>
/* ___________ Button Style ___________ */
#sliderWrapper {
    position: absolute;
    width: 16px;
    bottom: 15px;
    right: 18px;
}

.slideContainer {
    width: 100%; /* Width of the outside container */
    height: 200px;
}

/** custom slider style */

input[type='range'] {
    margin: 10px 0;
    width: 100%;
    appearance: slider-vertical !important;
    -webkit-appearance: none;
    height: 200px;
}
input[type='range']:focus {
    outline: none;
}

/* Chrome Style */
input[type='range']::-webkit-slider-runnable-track {
    -webkit-appearance: none;
    width: 100%;
    height: 200px;
    cursor: pointer;
    animate: 0.2s;
    background: #c4d2df;
    border-radius: 29px;
}
input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    box-shadow: 0px 0px 1px #ffffff;
    border: 1px solid #ffffff;
    height: 30px;
    width: 30px;
    border-radius: 50px;
    background: #5fb5d4;
    margin-top: -1px;
    cursor: pointer;
}
input[type='range']:focus::-webkit-slider-runnable-track {
    background: #c4d2df;
}

/* Fire Fox Style  */
input[type='range']::-moz-range-track {
    width: 100%;
    height: 200px;
    cursor: pointer;
    animate: 0.2s;
    background: #c4d2df;
    border-radius: 29px;
    margin: 10px 0;
}
input[type='range']::-moz-range-thumb {
    height: 0px;
    width: 0px;
    border-radius: 50px;
    border-width: 0px;
    background: #184e80;
    cursor: pointer;
    pointer-events: all;
}

input[type='range']::-moz-range-progress {
    background-color: #184e80;
    width: 100%;
    cursor: pointer;
    border-radius: 50px;
}

/* internet browser and edge styling */
input[type='range']::-ms-track {
    width: 100%;
    height: 200px;
    cursor: pointer;
    animate: 0.2s;
    background: transparent;
    border-color: transparent;
    color: transparent;
}
input[type='range']::-ms-fill-lower {
    background: #c4d2df;
    border: 0px solid #f3efef;
    border-radius: 58px;
}
input[type='range']::-ms-fill-upper {
    background: #c4d2df;
    border-radius: 58px;
}
input[type='range']::-ms-thumb {
    box-shadow: 0px 0px 1px #ffffff;
    border: 1px solid #ffffff;
    height: 30px;
    width: 30px;
    border-radius: 50px;
    background: #5fb5d4;
    cursor: pointer;
}
input[type='range']:focus::-ms-fill-lower {
    background: #184e80;
}
input[type='range']:focus::-ms-fill-upper {
    background: #c4d2df;
}

/* ___________ End of Button Style ___________ */
</style>
