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
    display: inline-grid;
    width: 90px;
    aspect-ratio: 1;
    animation: l3-0 5s steps(10) infinite;
}
.loader:before,
.loader:after {
    content: '';
    grid-area: 1/1;
}
.loader:before {
    clip-path: polygon(
        100% 50%,
        90.45% 79.39%,
        65.45% 97.55%,
        34.55% 97.55%,
        9.55% 79.39%,
        0% 50%,
        9.55% 20.61%,
        34.55% 2.45%,
        65.45% 2.45%,
        90.45% 20.61%,
        100% 50%,
        85.6% 24.14%,
        63.6% 8.15%,
        36.4% 8.15%,
        14.4% 24.14%,
        6% 50%,
        14.4% 75.86%,
        36.4% 91.85%,
        63.6% 91.85%,
        85.6% 75.86%,
        94% 50%,
        85.6% 24.14%
    );
    background: #574951;
}
.loader:after {
    background: #83988e;
    clip-path: polygon(
        100% 50%,
        65.45% 97.55%,
        9.55% 79.39%,
        9.55% 20.61%,
        65.45% 2.45%
    );
    margin: 27%;
    translate: 46% 0;
    transform-origin: right;
    animation: l3-1 0.5s linear infinite;
}
@keyframes l3-0 {
    to {
        rotate: 1turn;
    }
}
@keyframes l3-1 {
    0% {
        rotate: 18deg;
    }
    to {
        rotate: -18deg;
    }
}
</style>
