<script>
// Joystick library.
import nipplejs from 'nipplejs';
export default {
    setup() {},
    data() {
        return {
            // the time user hold the joystick in second
            holdTime: 1,
            // we store interval id to clear it later
            interval: null,
            // fps is a constant to determine how many time the tree will re-draw each second
            fps: 10,
            // another interval to calculate holdTime
            holdTimeInterval: null
        };
    },
    computed: {},
    async mounted() {
        // Panning, using NippleJS.
        var panJoystick = nipplejs.create({
            zone: document.getElementById('panJoystick'),
            mode: 'static',
            position: { left: '25%', top: '25%' },
            color: 'blue'
        });

        // we calculate the interval time with fps
        const intervalTime = Math.floor(1000 / this.fps) + 1;

        panJoystick
            .on(
                'dir:up plain:up dir:left plain:left dir:down ' +
                    'plain:down dir:right plain:right',
                (evt, data) => {
                    // if a new direction is fired we clear the old interval
                    clearInterval(this.interval);
                    // if the scale < 0 we panning further
                    const panAddition =
                        /**
                         * by divide with scale we can add more when the scale get smaller thus we will panning more
                         */
                        this.$parent.scale >= 1
                            ? this.$parent.scale
                            : 50 / this.$parent.scale;

                    // call new interval with new direction
                    switch (data.direction.angle) {
                        /**
                         * we add more panning base on the zoom scale and hold time
                         */
                        case 'right':
                            this.interval = setInterval(() => {
                                this.$parent.panX =
                                    this.$parent.panX -
                                    panAddition -
                                    (this.holdTime * 100 - panAddition);
                                this.$parent.drawTree();
                            }, intervalTime);
                            break;
                        case 'left':
                            this.interval = setInterval(() => {
                                this.$parent.panX =
                                    this.$parent.panX +
                                    panAddition +
                                    (this.holdTime * 100 + panAddition);
                                this.$parent.drawTree();
                            }, intervalTime);
                            break;
                        case 'up':
                            this.interval = setInterval(() => {
                                this.$parent.panY =
                                    this.$parent.panY +
                                    panAddition +
                                    (this.holdTime * 100 + panAddition);
                                this.$parent.drawTree();
                            }, intervalTime);
                            break;
                        case 'down':
                            this.interval = setInterval(() => {
                                this.$parent.panY =
                                    this.$parent.panY -
                                    panAddition -
                                    (this.holdTime * 100 - panAddition);
                                this.$parent.drawTree();
                            }, intervalTime);
                            break;
                        default:
                            break;
                    }
                }
            )
            .on('end', (evt, data) => {
                clearInterval(this.interval);
            });

        /**
         * Listen to joystick start and end event to calculate hold time
         */
        panJoystick
            .on('start', (evt, data) => {
                this.holdTimeInterval = setInterval(() => {
                    this.holdTime += 1;
                }, 1000);
            })
            .on('end', (evt, data) => {
                clearInterval(this.holdTimeInterval);
                this.holdTime = 0;
            });

        // panJoystick
        //     .on('start', (evt, data) => {
        //         this.interval = setInterval(() => {
        //             this.holdTime += 1;
        //         }, 500);
        //     })
        //     .on('end', (evt, data) => {
        //         clearInterval(this.interval);

        //         switch (this.direction) {
        //             case 'right':
        //                 this.$parent.panX =
        //                     (this.$parent.panX -
        //                         20 -
        //                         this.holdTime * this.distanceMultiplier) /
        //                     1;

        //                 break;
        //             case 'left':
        //                 this.$parent.panX =
        //                     (this.$parent.panX +
        //                         20 +
        //                         this.holdTime * this.distanceMultiplier) /
        //                     1;
        //                 break;
        //             case 'up':
        //                 this.$parent.panY =
        //                     (this.$parent.panY +
        //                         20 +
        //                         this.holdTime * this.distanceMultiplier) /
        //                     1;
        //                 break;
        //             case 'down':
        //                 this.$parent.panY =
        //                     (this.$parent.panY -
        //                         20 -
        //                         this.holdTime * this.distanceMultiplier) /
        //                     1;
        //             default:
        //                 break;
        //         }
        //         this.$parent.drawTree();
        //         this.holdTime = 1;
        //     });

        // Zoom range slider.
        let zoomSlider = document.getElementById('zoomRange');
        zoomSlider.step = '0.1';
        // Mouse.
        zoomSlider.addEventListener('mouseup', () => {
            this.$parent.scale = zoomSlider.value;
            // we store a special flag to tell the D3 zoom listener to scroll along side the sliders
            this.$parent.zoomWithWheel = false;
            this.$parent.drawTree();
        });

        // Touch.
        zoomSlider.addEventListener('touchend', () => {
            this.$parent.scale = zoomSlider.value;
            // we store a special flag to tell the D3 zoom listener to scroll along side the sliders
            this.$parent.zoomWithWheel = false;
            this.$parent.drawTree();
        });
    },
    watch: {},
    methods: {}
};
</script>

<template>
    <div id="controlsWrapper">
        <div id="panJoystick"></div>
        <div class="slidecontainer">
            <input
                type="range"
                min="0.008"
                max="2"
                v-model="this.$parent.scale"
                class="slider"
                id="zoomRange"
                step="0.008"
            />
        </div>
    </div>
</template>

<style scoped>
/* ___________ Button Style ___________ */
#controlsWrapper {
    position: absolute;
    width: 500px;
    bottom: 2px;
    left: 2px;
}

#panJoystick {
    width: 100px;
    height: 100px;
}

.slidecontainer {
    width: 100%; /* Width of the outside container */
}

.slider {
    -webkit-appearance: none;
    width: 100%;
    height: 15px;
    border-radius: 5px;
    background: #d3d3d3;
    outline: none;
    opacity: 0.7;
    -webkit-transition: 0.2s;
    transition: opacity 0.2s;
}

.slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #04aa6d;
    cursor: pointer;
}

.slider::-moz-range-thumb {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #04aa6d;
    cursor: pointer;
}
/* Mouse-over effects */
.slider:hover {
    opacity: 1; /* Fully shown on mouse-over */
}

#wrapper {
    width: 100%;
    height: 100%;
    height: calc(100% - 86px);
    overflow: hidden;
    position: relative;
}

#buttonWrapper {
    position: absolute;
    width: 30px;
    top: 90px;
    right: 2px;
}

input[type='button'] {
    padding: 5px;
    width: 30px;
    margin: 0px 0px 2px 0px;
}

/* ___________ End of Button Style ___________ */
</style>
