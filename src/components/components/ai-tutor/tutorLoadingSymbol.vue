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
    width: 120px;
    height: 15px;
    -webkit-mask: radial-gradient(circle closest-side, #000 94%, #0000) left/20%
        100%;
    background: linear-gradient(#000 0 0) left/0% 100% no-repeat #ddd;
    animation: l17 2s infinite steps(6);
}
@keyframes l17 {
    100% {
        background-size: 120% 100%;
    }
}
</style>
