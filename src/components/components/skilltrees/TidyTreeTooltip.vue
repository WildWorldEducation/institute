<script>
export default {
    setup() {},
    props: ['tooltipData'],
    data() {
        return {
            introduction: ''
        };
    },
    computed: {},
    async mounted() {},
    methods: {},
    watch: {
        tooltipData: {
            deep: true,
            handler(newItem) {
                console.log(newItem);
                fetch(`/skills/introduction-data?skillId=${newItem.skillId}`)
                    .then((res) => {
                        return res.json();
                    })
                    .then((result) => {
                        console.log(result[0].introduction);
                        this.introduction = result[0].introduction;
                    });
            }
        }
    }
};
</script>

<template>
    <div v-if="tooltipData.showing" class="tool-tip">
        <div class="tooltip-skill-name-background">
            <div class="d-flex tooltip-header">
                <img
                    :src="tooltipData.thumbnail"
                    class="rounded img-fluid mx-auto skill-thumbnail"
                    @error="imageUrlAlternative"
                    height="30"
                    width="100"
                />
                <div class="tooltip-skill-name d-flex flex-column">
                    <h4>
                        {{ tooltipData.skillName }}
                    </h4>
                    <h6>{{ tooltipData.skillLevel }}</h6>
                </div>
            </div>
        </div>
        <div class="d-flex tooltip-skill-introduction">
            <div v-html="introduction"></div>
        </div>
    </div>
</template>

<style scoped>
.tool-tip {
    width: 200px;
    height: 400px;
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 0px;
    top: v-bind('tooltipData.xPosition');
    left: v-bind('tooltipData.yPosition');
    color: black;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
}

.tooltip-skill-name {
    color: black;

    padding: 30px 40px;
    margin-bottom: 0px;
}

.tooltip-header {
    background: url('images/frameBorder.png');
    background-size: 100% 100%;
    padding: 10px;
}

.tooltip-skill-introduction {
    background-color: #e8ecf4d7;
}

.tooltip-skill-name-background {
    background-color: #ffffff;
    padding: 0px;
    display: flex;
}
</style>
