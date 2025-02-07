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
        // store initial scale value
        this.oldScale = this.$parent.scale;
    },
    methods: {
        scaleTree(step) {
            const canvaCenterX = this.$parent.context.canvas.width / 2;
            const canvaCenterY = this.$parent.context.canvas.height / 2;
            const newScale = this.$parent.scale + step;

            // calculate the proportion of new scale and ole scale
            const scaleProportion = newScale / this.$parent.scale;

            // Calculate the appropriate panning after scaling to maintain the canvas center
            let panX =
                canvaCenterX +
                (this.$parent.panX - canvaCenterX) * scaleProportion;
            let panY =
                canvaCenterY +
                (this.$parent.panY - canvaCenterY) * scaleProportion;

            this.$parent.scale = newScale;
            // store new scale value
            this.oldScale = newScale;
            this.$parent.zoomInD3(newScale, panX, panY);
            // we re-calculate scale percent to dynamic change the backgrounds
        },
        zoomIn() {
            if (this.$parent.scale < 2) {
                this.scaleTree(0.1);
            }
        },
        zoomOut() {
            if (this.$parent.scale > 0.3) {
                this.scaleTree(-0.1);
            }
        }
    }
};
</script>

<template>
    <div id="zoomcontrols">
        <!-- Zoom In button -->
        <div @click="zoomIn" class="zoom-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                <path
                    d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"
                />
            </svg>
        </div>
        <div class="divider"></div>
        <!-- Zoom Out button -->
        <div @click="zoomOut" class="zoom-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                <path
                    d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                />
            </svg>
        </div>
    </div>
</template>

<style scoped>
#zoomcontrols {
    position: fixed;
    right: 15px;
    bottom: 15px;
    border-radius: 10px;
    background-color: #fff;
    box-shadow: 0px 0px 10px #c6c6c6;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
}
.zoom-button {
    padding: 11px;
    cursor: pointer;
}
.zoom-button:active {
    background-color: #f5f2ff;
}
.zoom-button svg {
    width: 20px;
    height: 20px;
}
.divider {
    height: 1px;
    width: 75%;
    background-color: #c6c6c6;
}
@media screen and (max-width: 480px) {
    #zoomcontrols {
        display: none;
    }
}
</style>
