<script>
export default {
    setup() {},
    props: ['tooltipData'],
    data() {
        return {
            introSentence: '',
            thumbnail: '',
            topPosition: 0,
            leftPosition: 0,
            // Observatory-themed placeholder for skills with no thumbnail.
            fallbackImageUrl: '/images/skill-thumb-fallback.jpg'
        };
    },
    methods: {
        getTooltipData(skillId) {
            fetch(`/skills/intro-sentence-and-thumbnail?skillId=${skillId}`)
                .then((res) => {
                    return res.json();
                })
                .then((result) => {
                    this.introSentence = result[0].intro_sentence;
                    this.thumbnail = result[0].thumbnail;
                })
                .catch((error) => {
                    console.error('Error fetching tooltip data:', error);
                    this.introSentence = 'Information unavailable';
                });
        },
        snakeCaseToTitleCase(string) {
            // Domain and root nodes carry no level.
            if (!string) return '';
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
        },
        // Add the missing imageUrlAlternative method
        imageUrlAlternative(event) {
            // Set a fallback image when the original fails to load
            event.target.src = this.fallbackImageUrl;
            // You could also add a class to style the fallback image differently
            event.target.classList.add('fallback-image');
        }
    },
    watch: {
        tooltipData: {
            deep: true,
            handler(newItem, oldItem) {
                // Check if newItem and oldItem exist before comparing
                if (!newItem || !oldItem) return;

                // Only get tooltip data when skill id changes
                if (newItem.skillId !== oldItem.skillId) {
                    this.thumbnail = '';
                    this.getTooltipData(newItem.skillId);
                }

                // Make sure both position values are available
                if (newItem.xPosition && newItem.yPosition) {
                    // Adjust position to always show full height and width
                    this.adjustTooltipPosition(
                        parseInt(newItem.xPosition),
                        parseInt(newItem.yPosition)
                    );
                }
            },
            immediate: true // Trigger on component creation
        }
    }
};
</script>

<template>
    <div
        ref="tooltipElement"
        v-if="tooltipData && tooltipData.showing"
        class="tool-tip"
    >
        <div class="tooltip-skill-name-background">
            <div class="d-flex tooltip-header">
                <img
                    v-if="thumbnail != ''"
                    :src="thumbnail"
                    class="rounded-2 skill-thumbnail"
                    @error="imageUrlAlternative"
                    height="220"
                    width="220"
                />
                <!-- Loading animation -->
                <div
                    v-else
                    class="d-flex align-items-center justify-content-center loading-animation py-4"
                >
                    <span class="loader"></span>
                </div>
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
/* Loading animation for thumbnail image*/
.loading-animation {
    height: 220px;
    width: 220px;
}

.loader {
    position: absolute;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    width: 44px;
    height: 44px;
    /* Observatory scan-ring: gold head, cyan ghost, delay-gated. */
    border: 3px solid rgba(69, 216, 226, 0.15);
    border-top-color: var(--obs-gold, #ffc857);
    border-right-color: rgba(69, 216, 226, 0.55);
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    box-shadow: 0 0 12px rgba(255, 200, 87, 0.3);
    animation: rotation 0.9s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
/* End of loading animation */

.tool-tip {
    width: 400px;
    height: 300px;
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 0px;
    top: v-bind('topPosition');
    left: v-bind('leftPosition');
    color: var(--obs-ink, #e8e6ff);
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    border-radius: 10px;
    box-shadow: 0 0 30px rgba(13, 16, 48, 0.8);
}

.tooltip-skill-name {
    color: var(--obs-ink, #e8e6ff);
    margin-bottom: 0px;
    margin-left: 10px;
}

.tooltip-header {
    background: var(--obs-card-solid, #14173a);
    gap: 0px;
    width: 400px;
    border: 1px solid var(--obs-line-strong, rgba(124, 92, 240, 0.6));
    border-bottom: 0;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
}

.skill-level {
    font-size: 0.8rem;
    color: v-bind('tooltipData.borderColor');
}

.tooltip-skill-introduction {
    background: var(--obs-card, rgba(18, 21, 54, 0.92));
    color: var(--obs-ink-dim, #a9a4d9);
    border: 1px solid var(--obs-line-strong, rgba(124, 92, 240, 0.6));
    border-top: 0;
    padding: 10px 15px;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
}

.skill-thumbnail {
    padding: 2px;
}

.fallback-image {
    opacity: 0.7;
    border: 1px dashed #ccc;
}

.tooltip-skill-name-background {
    background: transparent;
    padding: 0px;
    display: flex;
    width: 100%;
}

.skill-name {
    font-size: 1.3rem;
    overflow-wrap: break-word;
}
</style>
