<script>
export default {
    setup() {},
    data() {
        return {
            addCount: 0,
            removeCount: 0,
            innerHtmlDisplay: ''
        };
    },
    props: ['diffString'],
    async created() {
        if (this.diffString) {
            this.innerHtmlDisplay = '<div class="inner-div">';
            // we create a html string for inline display
            this.diffString.forEach((element, index) => {
                if (element.added && !element.removed) {
                    this.innerHtmlDisplay =
                        this.innerHtmlDisplay +
                        `<span class="add">${element.value}</span>`;
                }

                if (!element.added && element.removed) {
                    this.innerHtmlDisplay =
                        this.innerHtmlDisplay +
                        `<span class="remove">${element.value}</span>`;
                }

                if (!element.added && !element.removed) {
                    this.innerHtmlDisplay =
                        this.innerHtmlDisplay + element.value;
                }

                if (index === this.diffString.length) {
                    this.innerHtmlDisplay = this.innerHtmlDisplay + '</div>';
                }
            });
        }
    },
    methods: {}
};
</script>

<template>
    <div class="d-flex flex-row align-items-center flex-wrap">
        <div v-html="innerHtmlDisplay"></div>
    </div>
</template>

<style scoped>
.unchange {
    background-color: inherit;
    color: black;
}

:deep(.add) {
    background-color: #81d5b9;
    border-radius: 4px;
    color: black;
    height: 100%;
    margin-right: 2px;
    margin-left: 2px;
}

:deep(.remove) {
    background-color: #faa5a5;
    color: black;
    border-radius: 4px;
    height: 100%;
    text-decoration-line: line-through;
    margin-right: 2px;
    margin-left: 2px;
}

.small-change-text {
    font-size: 10px;
}
</style>
