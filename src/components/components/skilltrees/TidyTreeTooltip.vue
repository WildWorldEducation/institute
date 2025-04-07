<script>
export default {
    setup() {},
    props: ['tooltipData'],
    data() {
        return {
            introSentence: '',
            topPosition: 0,
            leftPosition: 0
        };
    },
    computed: {},
    async mounted() {},
    methods: {
        // getting first paragraph from html string (no longer used: DELETE)
        // getFirstParagraph(htmlString) {
        //     const el = document.createElement('html');
        //     el.innerHTML = htmlString;
        //     ``;

        //     const listOfParagraph = el.getElementsByTagName('p');
        //     if (!listOfParagraph || listOfParagraph.length === 0) {
        //         return;
        //     }
        //     const firstSentence = listOfParagraph[0].innerText.split(
        //         '. ',
        //         1
        //     )[0];
        //     return firstSentence + '...';
        // },
        getTooltipData(skillId) {
            fetch(`/skills/intro-sentence?skillId=${skillId}`)
                .then((res) => {
                    return res.json();
                })
                .then((result) => {
                    this.introSentence = result[0].intro_sentence;
                });
        },
        snakeCaseToTitleCase(string) {
            const result = string.replace(/^_*(.)|_+(.)/g, (s, c, d) =>
                c ? c.toUpperCase() : ' ' + d.toUpperCase()
            );
            return result;
        },
        adjustTooltipPosition(probTopPosition, probLeftPosition) {
            if (!this.$refs.tooltipElement) {
                return;
            }
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;
            const tooltipHeight = this.$refs.tooltipElement.clientHeight;
            const tooltipWidth = this.$refs.tooltipElement.clientWidth;
            // plus 'px' for css to read
            this.topPosition = probTopPosition + 10 + 'px';
            this.leftPosition = probLeftPosition + 10 + 'px';

            // combine height and width to determine if tooltip is overflow
            const combineHeight =
                parseInt(probTopPosition) + parseInt(tooltipHeight);
            const combineWidth =
                parseInt(probLeftPosition) + parseInt(tooltipWidth);

            if (combineHeight > windowHeight) {
                const inViewTopPosition = windowHeight - tooltipHeight - 80;
                this.topPosition = inViewTopPosition + 'px';
            }
            if (combineWidth > windowWidth) {
                const inViewLeftPosition = windowWidth - tooltipWidth;
                this.leftPosition = inViewLeftPosition + 'px';
            }
        }
    },
    watch: {
        tooltipData: {
            deep: true,
            handler(newItem, oldItem) {
                // only get tooltip data when skill id change
                if (newItem.skillId != oldItem.skillId) {
                    this.getTooltipData(newItem.skillId);
                }
                // adjust position to always show full height and width
                this.adjustTooltipPosition(
                    parseInt(newItem.xPosition),
                    parseInt(newItem.yPosition)
                );
            }
        }
    }
};
</script>

<template>
    <div ref="tooltipElement" v-if="tooltipData.showing" class="tool-tip">
        <div class="tooltip-skill-name-background">
            <div class="d-flex tooltip-header">
                <img
                    :src="tooltipData.thumbnail"
                    class="rounded-2 skill-thumbnail"
                    @error="imageUrlAlternative"
                    height="220"
                    width="220"
                />
                <div class="tooltip-skill-name">
                    <div class="skill-name">
                        {{ tooltipData.skillName }}
                    </div>
                    <div class="skill-level">
                        {{ snakeCaseToTitleCase(tooltipData.skillLevel) }}
                    </div>
                </div>
            </div>
        </div>
        <div class="d-flex tooltip-skill-introduction">
            <div>{{ introSentence }}</div>
        </div>
    </div>
</template>

<style scoped>
.tool-tip {
    width: 400px;
    height: 300px;
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 0px;
    top: v-bind('topPosition');
    left: v-bind('leftPosition');
    color: black;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    border-radius: 10px;
}

.tooltip-skill-name {
    color: black;
    margin-bottom: 0px;
    margin-left: 10px;
}

.tooltip-header {
    background-color: white;
    gap: 0px;
    width: 400px;
    border: 2px solid #e8ecf4;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
}

.skill-level {
    font-size: 0.8rem;
    color: v-bind('tooltipData.borderColor');
}

.tooltip-skill-introduction {
    background-color: #e8ecf4ea;
    padding: 10px 15px;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
}

.skill-thumbnail {
    padding: 2px;
}

.tooltip-skill-name-background {
    background-color: #ffffff;
    padding: 0px;
    display: flex;
    width: 100%;
}

.skill-name {
    font-size: 1.3rem;
    overflow-wrap: break-word;
}
</style>
