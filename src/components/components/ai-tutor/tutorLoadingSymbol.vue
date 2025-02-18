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
/* HTML: <div class="loader"></div> */
.loader {
    width: 60px;
    height: 10px;
    aspect-ratio: 4;
    background: radial-gradient(circle closest-side, #acacac 90%, #0000) 0 /
        calc(100% / 3) 100% space;
    clip-path: inset(0 100% 0 0);
    animation: l1 1.5s steps(4) infinite;
}
@keyframes l1 {
    to {
        clip-path: inset(0 -34% 0 0);
    }
}
</style>
