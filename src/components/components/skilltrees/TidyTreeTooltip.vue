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
    methods: {
        // getting first paragraph from html string
        getFirstParagraph(htmlString) {
            const el = document.createElement('html');
            el.innerHTML = htmlString;
            ``;
            const listOfParagraph = el.getElementsByTagName('p');

            return listOfParagraph[0].innerText;
        },
        snakeToTile(string) {
            const result = string.replace(/^_*(.)|_+(.)/g, (s, c, d) =>
                c ? c.toUpperCase() : ' ' + d.toUpperCase()
            );
            return result;
        }
    },
    watch: {
        tooltipData: {
            deep: true,
            handler(newItem, oldItem) {
                if (newItem.skillId === oldItem.skillId) {
                    return;
                }
                console.log('getting call');
                fetch(`/skills/introduction-data?skillId=${newItem.skillId}`)
                    .then((res) => {
                        return res.json();
                    })
                    .then((result) => {
                        const fullIntroduction = result[0].introduction;
                        this.introduction =
                            this.getFirstParagraph(fullIntroduction);
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
                        {{ snakeToTile(tooltipData.skillLevel) }}
                    </div>
                </div>
            </div>
        </div>
        <div class="d-flex tooltip-skill-introduction">
            <div>{{ introduction }}</div>
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
    top: v-bind('tooltipData.xPosition');
    left: v-bind('tooltipData.yPosition');
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
