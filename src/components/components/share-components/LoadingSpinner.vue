<script>
export default {
    props: ['width', 'height', 'color', 'borderWidth'],
    data: () => {
        const defaultHeight = '48px';
        const defaultWidth = '48px';
        const defaultColor = '#a48be6';
        const defaultBorderWidth = '5px';
        return {
            widthCss: defaultHeight,
            heightCss: defaultWidth,
            colorCss: defaultColor,
            borderWidthCss: defaultBorderWidth
        };
    },
    created() {
        if (this.width) {
            this.widthCss = this.width;
        }

        if (this.height) {
            this.heightCss = this.height;
        }

        if (this.color) {
            this.colorCss = this.color;
        }

        if (this.borderWidth) {
            this.borderWidthCss = this.borderWidth;
        }
    }
};
</script>

<template>
    <span class="loader"></span>
</template>

<style scoped>
.loader {
    width: v-bind(widthCss);
    height: v-bind(heightCss);
    /* Observatory scan-ring: gold head, cyan ghost, delay-gated. */
    border: v-bind(borderWidthCss) solid rgba(69, 216, 226, 0.15);
    border-top-color: var(--obs-gold, #ffc857);
    border-right-color: rgba(69, 216, 226, 0.55);
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    box-shadow: 0 0 10px rgba(255, 200, 87, 0.25);
    animation: rotation 0.9s linear infinite,
        obsFadeIn 0.15s ease 0.2s backwards;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
