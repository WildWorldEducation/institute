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
            <div>You are currently search skill tree with key word.</div>
            <div class="tool-tip-text">
                <div>
                    Click on the
                    <span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 512"
                            height="20"
                            width="20"
                            fill="#cbd5e1"
                            class="mb-2"
                        >
                            <path
                                d="M320 0c17.7 0 32 14.3 32 32l0 64 120 0c39.8 0 72 32.2 72 72l0 272c0 39.8-32.2 72-72 72l-304 0c-39.8 0-72-32.2-72-72l0-272c0-39.8 32.2-72 72-72l120 0 0-64c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224l16 0 0 192-16 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-16 0 0-192 16 0z"
                            />
                        </svg>
                    </span>
                    to turn on context search using AI
                </div>
            </div>
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
