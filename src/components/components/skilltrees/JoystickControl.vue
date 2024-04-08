<script>
// Joystick library.
import nipplejs from 'nipplejs';
export default {
    setup() {},
    data() {
        return {
            // the time user hold the joystick in second
            holdTime: 0,
            // we store interval id to clear it later
            interval: null,
            // fps is a constant to determine how many time the tree will re-draw each second
            fps: 10,
            // another interval to calculate holdTime
            holdTimeInterval: null,
            // press state of cntrl and shift key
            fnZoomKey: false,
            // also store the left mouse click state
            lefClick: false,
            // old mouse y position
            oldMY: 0,
            // old scale value
            oldScale: 0
        };
    },
    computed: {},
    async mounted() {
        // store initial scale
        this.oldScale = this.$parent.scale;
        // Panning, using NippleJS.
        var panJoystick = nipplejs.create({
            zone: document.getElementById('panJoystick'),
            mode: 'static',
            position: { right: '70%', bottom: '33%' },
            color: '#184e80'
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
                    this.interval = null;
                    // reset hold time
                    this.holdTime = 0;
                    // if the scale < 0 we panning further
                    const panAddition =
                        /**
                         * by divide with scale we can add more when the scale get smaller thus we will panning more
                         */
                        this.$parent.scale >= 1
                            ? this.$parent.scale * 10
                            : 20 / this.$parent.scale;

                    // hold time multiplier is scale with zoom too
                    const holdTimeMultiplier =
                        this.$parent.scale > 1
                            ? this.$parent.scale * 15
                            : 20 / this.$parent.scale;

                    // call new interval with new direction if there are no interval
                    if (this.interval == null) {
                        switch (data.direction.angle) {
                            /**
                             * we add more panning base on the zoom scale and hold time
                             */
                            case 'right':
                                this.interval = setInterval(() => {
                                    this.$parent.panX =
                                        this.$parent.panX -
                                        20 -
                                        (this.holdTime * holdTimeMultiplier +
                                            panAddition);
                                    this.$parent.panInD3(
                                        this.$parent.panX,
                                        this.$parent.panY
                                    );
                                }, intervalTime);
                                break;
                            case 'left':
                                this.interval = setInterval(() => {
                                    this.$parent.panX =
                                        this.$parent.panX +
                                        20 +
                                        (this.holdTime * holdTimeMultiplier +
                                            panAddition);
                                    this.$parent.panInD3(
                                        this.$parent.panX,
                                        this.$parent.panY
                                    );
                                }, intervalTime);
                                break;
                            case 'up':
                                this.interval = setInterval(() => {
                                    this.$parent.panY =
                                        this.$parent.panY +
                                        20 +
                                        (this.holdTime * holdTimeMultiplier +
                                            panAddition);
                                    this.$parent.panInD3(
                                        this.$parent.panX,
                                        this.$parent.panY
                                    );
                                }, intervalTime);
                                break;
                            case 'down':
                                this.interval = setInterval(() => {
                                    this.$parent.panY =
                                        this.$parent.panY -
                                        20 -
                                        (this.holdTime * holdTimeMultiplier +
                                            panAddition);
                                    this.$parent.panInD3(
                                        this.$parent.panX,
                                        this.$parent.panY
                                    );
                                }, intervalTime);
                                break;
                            default:
                                break;
                        }
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
                }, 300);
            })
            .on('end', (evt, data) => {
                clearInterval(this.holdTimeInterval);
                this.holdTime = 0;
                this.interval = null;
            });

        // Listen for the arrow key on canvas
        this.$parent.$refs.canvas.addEventListener(
            'keydown',
            (e) => {
                // Because this listener is hearing in interval so we just set interval once time
                if (this.interval == null) {
                    // We count the press down time of key down too
                    this.holdTimeInterval = setInterval(() => {
                        this.holdTime += 1;
                    }, 300);
                    const panAddition =
                        /**
                         * by divide with scale we can add more when the scale get smaller thus we will panning more
                         */
                        this.$parent.scale >= 1
                            ? this.$parent.scale / 10
                            : 50 / this.$parent.scale;

                    // hold time multiplier is scale with zoom too
                    const holdTimeMultiplier =
                        this.$parent.scale > 1
                            ? this.$parent.scale * 15
                            : 10 / this.$parent.scale;

                    switch (e.code) {
                        /**
                         * we add more panning base on the zoom scale and hold time
                         */
                        case 'ArrowRight':
                            this.interval = setInterval(() => {
                                this.$parent.panX =
                                    this.$parent.panX -
                                    20 -
                                    (this.holdTime * holdTimeMultiplier +
                                        panAddition);

                                this.$parent.panInD3(
                                    this.$parent.panX,
                                    this.$parent.panY
                                );
                            }, intervalTime);
                            break;
                        case 'ArrowLeft':
                            this.interval = setInterval(() => {
                                this.$parent.panX =
                                    this.$parent.panX +
                                    20 +
                                    (this.holdTime * holdTimeMultiplier +
                                        panAddition);
                                this.$parent.panInD3(
                                    this.$parent.panX,
                                    this.$parent.panY
                                );
                            }, intervalTime);
                            break;
                        case 'ArrowUp':
                            this.interval = setInterval(() => {
                                this.$parent.panY =
                                    this.$parent.panY +
                                    20 +
                                    (this.holdTime * holdTimeMultiplier +
                                        panAddition);
                                this.$parent.panInD3(
                                    this.$parent.panX,
                                    this.$parent.panY
                                );
                            }, intervalTime);
                            break;
                        case 'ArrowDown':
                            this.interval = setInterval(() => {
                                this.$parent.panY =
                                    this.$parent.panY -
                                    20 -
                                    (this.holdTime * holdTimeMultiplier +
                                        panAddition);
                                this.$parent.panInD3(
                                    this.$parent.panX,
                                    this.$parent.panY
                                );
                            }, intervalTime);
                            break;
                        // We also add page up and page down to zoom in and out
                        case 'PageUp':
                            this.interval = setInterval(() => {
                                this.$parent.scale = this.$parent.scale + 0.03;
                                // calculate the proportion of new scale and ole scale
                                const scaleProportion =
                                    this.oldScale / this.$parent.scale;
                                // just like the panning we have to multiple the pan value when scale is smaller than 0
                                // because in the d3 handler we divide the value with scale
                                let panX =
                                    this.$parent.scale >= 1
                                        ? this.$parent.panX
                                        : this.$parent.panX *
                                          this.$parent.scale;
                                let panY =
                                    this.$parent.scale >= 1
                                        ? this.$parent.panY
                                        : this.$parent.panY *
                                          this.$parent.scale;
                                // calculate pan value so we can zoom into center of the screen
                                panX = panX * scaleProportion;
                                panY = panY * scaleProportion;

                                // store new scale value
                                this.oldScale = this.$parent.scale;
                                this.$parent.zoomInD3(
                                    this.$parent.scale,
                                    panX,
                                    panY
                                );

                                e.preventDefault();
                            }, 50);
                            break;
                        case 'PageDown':
                            this.interval = setInterval(() => {
                                this.$parent.scale = this.$parent.scale - 0.03;
                                // calculate the proportion of new scale and ole scale
                                const scaleProportion =
                                    this.oldScale / this.$parent.scale;
                                // just like the panning we have to multiple the pan value when scale is smaller than 0
                                // because in the d3 handler we divide the value with scale
                                let panX =
                                    this.$parent.scale >= 1
                                        ? this.$parent.panX
                                        : this.$parent.panX *
                                          this.$parent.scale;
                                let panY =
                                    this.$parent.scale >= 1
                                        ? this.$parent.panY
                                        : this.$parent.panY *
                                          this.$parent.scale;
                                // calculate pan value so we can zoom into center of the screen
                                panX = panX * scaleProportion;
                                panY = panY * scaleProportion;

                                // store new scale value
                                this.oldScale = this.$parent.scale;
                                this.$parent.zoomInD3(
                                    this.$parent.scale,
                                    panX,
                                    panY
                                );
                            }, 50);
                            break;
                        default:
                            break;
                    }
                }

                /*
                 * This part is to handle zoom with Apple mouse
                 */
                if (e.code.includes('Shift') || e.code.includes('Control')) {
                    this.fnZoomKey = true;
                    e.preventDefault(); // move the prevent default here to make other key still function as default
                }

                // prevent default behavior of arrow keys
                if (e.code.includes('Arrow') || e.code.includes('Page')) {
                    e.preventDefault();
                }
            },
            false
        );

        // Listen for the keyup event to clear the interval
        this.$parent.$refs.canvas.addEventListener(
            'keyup',
            (e) => {
                clearInterval(this.interval);
                clearInterval(this.holdTimeInterval);
                // set this to null so next time a key is down it will set interval
                this.interval = null;
                this.holdTime = 0;
                if (e.code.includes('Shift') || e.code.includes('Control')) {
                    this.fnZoomKey = false;
                }
            },
            false
        );

        // listen to mouse move for zoom without wheel function
        this.$parent.$refs.canvas.addEventListener('mousemove', (e) => {
            // only zoom when cntrl or shift key is press and left click is press down
            if (this.fnZoomKey) {
                if (e.pageY < this.oldMY) {
                    this.$parent.scale += 0.005;
                    // calculate the proportion of new scale and ole scale
                    const scaleProportion = this.oldScale / this.$parent.scale;
                    // just like the panning we have to multiple the pan value when scale is smaller than 0
                    // because in the d3 handler we divide the value with scale
                    let panX =
                        this.$parent.scale >= 1
                            ? this.$parent.panX
                            : this.$parent.panX * this.$parent.scale;
                    let panY =
                        this.$parent.scale >= 1
                            ? this.$parent.panY
                            : this.$parent.panY * this.$parent.scale;
                    // calculate pan value so we can zoom into center of the screen
                    panX = panX * scaleProportion;
                    panY = panY * scaleProportion;

                    // store new scale value
                    this.oldScale = this.$parent.scale;
                    this.$parent.zoomInD3(this.$parent.scale, panX, panY);
                } else {
                    this.$parent.scale -= 0.005;
                    // calculate the proportion of new scale and ole scale
                    const scaleProportion = this.oldScale / this.$parent.scale;
                    // just like the panning we have to multiple the pan value when scale is smaller than 0
                    // because in the d3 handler we divide the value with scale
                    let panX =
                        this.$parent.scale >= 1
                            ? this.$parent.panX
                            : this.$parent.panX * this.$parent.scale;
                    let panY =
                        this.$parent.scale >= 1
                            ? this.$parent.panY
                            : this.$parent.panY * this.$parent.scale;
                    // calculate pan value so we can zoom into center of the screen
                    panX = panX * scaleProportion;
                    panY = panY * scaleProportion;

                    // store new scale value
                    this.oldScale = this.$parent.scale;
                    this.$parent.zoomInD3(this.$parent.scale, panX, panY);
                }
            }
            // re-assign the old-y
            this.oldMY = e.pageY;
        });
    },
    watch: {},
    methods: {}
};
</script>

<template>
    <div id="controlsWrapper">
        <div id="panJoystick"></div>
    </div>
</template>

<style scoped>
/* ___________ Button Style ___________ */
#controlsWrapper {
    position: absolute;
    width: 200px;
    bottom: 0px;
    left: 12px;
    display: flex;
    flex-direction: column;
    height: 160px;
}

#panJoystick {
    width: 100px;
    height: 100px;
    opacity: 0.7;
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
    width: 100%;
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
