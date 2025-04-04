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
    <div class="playing">
        <span class="playing__bar playing__bar1"></span>
        <span class="playing__bar playing__bar2"></span>
        <span class="playing__bar playing__bar3"></span>
    </div>
</template>

<style scoped>
.playing {
    background: rgba(255, 255, 255, 0.1);
    width: 2rem;
    height: 2rem;
    border-radius: 0.2rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 0.2rem;
    box-sizing: border-box;
}

.playing__bar {
    display: inline-block;
    background: white;
    width: 30%;
    height: 100%;
    animation: up-and-down 1.3s ease infinite alternate;
}

.playing__bar1 {
    height: 60%;
}

.playing__bar2 {
    height: 30%;
    animation-delay: -2.2s;
}

.playing__bar3 {
    height: 75%;
    animation-delay: -3.7s;
}

@keyframes up-and-down {
    10% {
        height: 30%;
    }

    30% {
        height: 100%;
    }

    60% {
        height: 50%;
    }

    80% {
        height: 75%;
    }

    100% {
        height: 60%;
    }
}

body {
    background: #222;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    font-family: sans-serif;
    color: white;
}
</style>
