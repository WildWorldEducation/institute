<script>
export default {
    props: ['showAiToolTip'],
    data: () => {
        return {};
    },
    methods: {},
    components: {}
};
</script>

<template>
    <div class="tool-tip-base">
        <div class="explain-tool-tip triangle-top-right">
            <div class="tool-tip-text">Please Login to use search feature</div>
        </div>
    </div>
</template>

<style scoped>
.tool-tip-base {
    position: absolute;
    top: 12px;
    right: 0px;
    z-index: 100;
}

.explain-tool-tip {
    position: relative;
    border: #334155 1px solid;
    border-radius: 5px;
    background-color: white;
    padding: 5px 10px;
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
