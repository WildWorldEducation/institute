<script>
// Joystick library.
import nipplejs from 'nipplejs';
export default {
    setup() {},
    data() {
        return {
            holdTime: 1,
            interval: null,
            panData: null,
            isPanning: true,
            direction: '',
            distanceMultiplier: 3
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

        panJoystick
            .on(
                'dir:up plain:up dir:left plain:left dir:down ' +
                    'plain:down dir:right plain:right',
                (evt, data) => {
                    switch (data.direction.angle) {
                        case 'right':
                            this.direction = 'right';
                            break;
                        case 'left':
                            this.direction = 'left';
                            break;
                        case 'up':
                            this.direction = 'up';
                            break;
                        case 'down':
                            this.direction = 'down';
                        default:
                            break;
                    }
                }
            )
            .on('end', (evt, data) => {});

        panJoystick
            .on('start', (evt, data) => {
                this.interval = setInterval(() => {
                    this.holdTime += 1;
                }, 1000);
            })
            .on('end', (evt, data) => {
                clearInterval(this.interval);
                console.log('scale: ' + this.$parent.scale);
                switch (this.direction) {
                    case 'right':
                        this.$parent.panX =
                            (((this.$parent.panX - 20) *
                                this.distanceMultiplier) /
                                this.$parent.scale) *
                            this.holdTime;
                        break;
                    case 'left':
                        this.$parent.panX =
                            (((this.$parent.panX + 20) *
                                this.distanceMultiplier) /
                                this.$parent.scale) *
                            this.holdTime;
                        break;
                    case 'up':
                        this.$parent.panY =
                            (((this.$parent.panY + 20) *
                                this.distanceMultiplier) /
                                this.$parent.scale) *
                            this.holdTime;
                        break;
                    case 'down':
                        this.$parent.panY =
                            (((this.$parent.panY - 20) *
                                this.distanceMultiplier) /
                                this.$parent.scale) *
                            this.holdTime;
                    default:
                        break;
                }
                console.log(
                    'PanX: ' +
                        this.$parent.panX +
                        ' || ' +
                        'PanY: ' +
                        this.$parent.panY
                );

                this.$parent.drawTree();
                this.holdTime = 1;
            });

        // Zoom range slider.
        let zoomSlider = document.getElementById('zoomRange');
        zoomSlider.step = '0.1';
        // Mouse.
        zoomSlider.addEventListener('mouseup', () => {
            this.$parent.scale = zoomSlider.value;
            this.$parent.drawTree();
        });

        // Touch.
        zoomSlider.addEventListener('touchend', () => {
            this.scale = zoomSlider.value;
            this.drawTree();
        });
    },
    watch: {
        isPanning: {
            handler(oldVal, newVal) {
                // if (newVal) {
                //     this.interval = setInterval(() => {
                //         console.log('new val: ' + newVal);
                //         console.log('old val: ' + oldVal);
                //         console.log('Pandata: ');
                //         console.log(this.panData);
                //         // if (this.panData.direction.angle == 'right')
                //         //     this.$parent.panX =
                //         //         (this.$parent.panX - 20) / this.$parent.scale;
                //         // else if (this.panData.direction.angle == 'left')
                //         //     this.$parent.panX =
                //         //         (this.$parent.panX + 20) / this.$parent.scale;
                //         // else if (this.panData.direction.angle == 'up')
                //         //     this.$parent.panY =
                //         //         (this.$parent.panY + 20) / this.$parent.scale;
                //         // else if (this.panData.direction.angle == 'down')
                //         //     this.$parent.panY =
                //         //         (this.$parent.panY - 20) / this.$parent.scale;
                //     }, 1000);
                // } else {
                //     clearInterval(this.interval);
                //     this.$parent.drawTree();
                // }
            }
        }
    },
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
                value="0.5"
                class="slider"
                id="zoomRange"
                step="0.05"
            />
        </div>
    </div>
</template>

<style scoped>
/* ___________ Button Style ___________ */
#controlsWrapper {
    position: absolute;
    width: 200px;
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
