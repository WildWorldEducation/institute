<script>
export default {
    props: ['width', 'height', 'color', 'borderWidth'],
    data: () => {
        const defaultHeight = '48px';
        const defaultWidth = '48px';
        const defaultColor = '#a48be6';
        const defaultBorderWidth = '5px';
        return {
            widthCss: defaultWidth,
            heightCss: defaultHeight,
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
/* HTML: <div class="loader"></div> */
.loader {
    width: 25px;
    aspect-ratio: 1;
    --g1: conic-gradient(from 90deg at 1px 1px, #0000 90deg, #fff 0);
    --g2: conic-gradient(from -90deg at 11px 11px, #0000 90deg, #fff 0);
    background: var(--g1), var(--g1), var(--g1), var(--g2), var(--g2), var(--g2);
    background-size: 12px 12px;
    background-repeat: no-repeat;
    animation: l7 1.5s infinite;
}
@keyframes l7 {
    0% {
        background-position: 0 0, 0 100%, 100% 100%;
    }
    25% {
        background-position: 100% 0, 0 100%, 100% 100%;
    }
    50% {
        background-position: 100% 0, 0 0, 100% 100%;
    }
    75% {
        background-position: 100% 0, 0 0, 0 100%;
    }
    100% {
        background-position: 100% 100%, 0 0, 0 100%;
    }
}
</style>
