<script>
export default {
    setup() {},
    data() {
        return {};
    },
    computed: {},
    async mounted() {
        // Zoom range slider.
        let zoomSlider = document.getElementById('zoomRange');
        zoomSlider.step = '0.1';
        // Mouse.
        zoomSlider.addEventListener('mouseup', () => {
            // just like the panning we have to multiple the pan value when scale is smaller than 0
            // because in the d3 handler we divide the value with scale
            const panX =
                zoomSlider.value >= 1
                    ? this.$parent.panX
                    : this.$parent.panX * zoomSlider.value;
            const panY =
                zoomSlider.value >= 1
                    ? this.$parent.panY
                    : this.$parent.panY * zoomSlider.value;
            this.$parent.scale = zoomSlider.value;
            this.$parent.zoomInD3(zoomSlider.value, panX, panY);
        });

        // Touch.
        zoomSlider.addEventListener('touchend', () => {
            // just like the panning we have to multiple the pan value when scale is smaller than 0
            // because in the d3 handler we divide the value with scale
            const panX =
                zoomSlider.value >= 1
                    ? this.$parent.panX
                    : this.$parent.panX * zoomSlider.value;
            const panY =
                zoomSlider.value >= 1
                    ? this.$parent.panY
                    : this.$parent.panY * zoomSlider.value;

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
                class="verticalSlider"
                id="zoomRange"
                step="0.01"
            />
        </div>
    </div>
</template>

<style scoped>
/* ___________ Button Style ___________ */
#sliderWrapper {
    position: absolute;
    width: 40px;
    bottom: 2px;
    right: 2px;
}

.slideContainer {
    width: 100%; /* Width of the outside container */
    height: 500px;
}

input[type='range'] {
    appearance: slider-vertical;
}

.verticalSlider {
    -webkit-appearance: none;
    width: 100%;
    height: 500px;
    border-radius: 5px;
    background: #d3d3d3;
    outline: none;
    opacity: 0.7;
    -webkit-transition: 0.2s;
    transition: opacity 0.2s;
}

.verticalSlider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #04aa6d;
    cursor: pointer;
}

.verticalSlider::-moz-range-thumb {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #04aa6d;
    cursor: pointer;
}
/* Mouse-over effects */
.verticalSlider:hover {
    opacity: 1; /* Fully shown on mouse-over */
}

/* ___________ End of Button Style ___________ */
</style>
