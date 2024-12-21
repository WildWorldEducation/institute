<script>
export default {
    props: ['toolTipText', 'bubbleWidth', 'absoluteTop', 'trianglePosition'],
    data: () => {
        const defaultAbsoluteTop = '15px';
        const defaultWidth = '500px';
        const defaultTrianglePosition = 'left';
        return {
            bubbleWidthCss: defaultWidth,
            absoluteTopCss: defaultAbsoluteTop,
            trianglePositionCss: defaultTrianglePosition,
            absoluteLeftCss: '0px',
            showToolTip: false
        };
    },
    created() {
        if (this.bubbleWidth) {
            this.bubbleWidthCss = this.bubbleWidth;
        }

        if (this.absoluteTop) {
            this.absoluteTopCss = this.absoluteTop;
        }
        if (this.trianglePosition) {
            this.trianglePositionCss = this.trianglePosition;
        }

        if (this.trianglePositionCss === 'left') {
            this.absoluteLeftCss = '-16px';
        }
    }
};
</script>

<template>
    <div class="position-relative">
        <button
            class="tooltip-btn"
            @mouseover="showToolTip = true"
            @mouseleave="showToolTip = false"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 192 512"
                width="12"
                height="12"
                fill="white"
            >
                <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                <path
                    d="M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 224 32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0 0-192-32 0c-17.7 0-32-14.3-32-32z"
                />
            </svg>
        </button>
        <div v-if="showToolTip" class="tool-tip-base">
            <div
                class="explain-tool-tip"
                :class="{
                    'triangle-top-left': trianglePositionCss === 'left',
                    'triangle-top-right': trianglePositionCss === 'right'
                }"
            >
                <div class="tool-tip-text">
                    <div>
                        {{ trianglePosition }}
                        {{ toolTipText }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.tooltip-btn {
    background-color: #8d6ce7;
    color: white;
    border: none;
    border-radius: 4px;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    line-height: 24px;
    display: flex;
    align-items: center;
    height: auto;
    width: fit-content;

    padding: 5px 3px;
}

.tooltip-btn:hover {
    cursor: help;
}

.tool-tip-base {
    position: absolute;
    top: v-bind(absoluteTopCss);
    left: v-bind(absoluteLeftCss);
    z-index: 100;
    width: v-bind(bubbleWidthCss);
}

.explain-tool-tip {
    position: relative;
    border: #334155 1px solid;
    border-radius: 5px;
    background-color: white;
    padding: 5px 10px;
    width: fit-content;
}

.triangle-top-right:before {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border-bottom: 10px solid #334155;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    right: 15px;
    top: -10px;
}

.triangle-top-right::after {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border-bottom: 10px solid white;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    right: 15px;
    top: -9px;
}

.triangle-top-left:before {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border-bottom: 10px solid #334155;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    left: 15px;
    top: -10px;
}

.triangle-top-left::after {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border-bottom: 10px solid white;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    left: 15px;
    top: -9px;
}

/* Bigger devices ( Tablet ) */
@media (min-width: 481px) and (max-width: 1024px) {
    .tool-tip-base {
        right: 0px;
        top: 4px;
    }
}

/* Phone view style */
@media (max-width: 480px) {
    .tool-tip-base {
        top: 4px;
    }
}
</style>
