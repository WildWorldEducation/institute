<script>
export default {
    setup() {},
    props: ['id', 'children', 'name', 'type', 'level', 'depth'],
    data() {
        return {
            showChildren: false
        };
    },
    computed: {
        indent() {
            var amount = 0;
            if (screen.width <= 480) {
                if (this.depth == 1) {
                    amount = 25;
                } else {
                    amount = 20;
                }
            } else {
                amount = 50;
            }

            // For regular skills.
            if (this.type != 'sub') {
                return {
                    transform: `translate(${this.depth * amount - 35.2}px)`
                };
            }
            // For subskills. They should be indented to the same amount as their main skill.
            else {
                return {
                    transform: `translate(${
                        (this.depth - 1) * amount - 35.2
                    }px)`
                };
            }
        }
    },
    async created() {},
    methods: {
        showChildSkills() {
            this.showChildren = !this.showChildren;
        }
    },
    components: {}
};
</script>

<template>
    <button
        :style="indent"
        class="skill-button d-flex justify-content-between align-items-center"
        @click="showChildSkills()"
    >
        <span>{{ name }}</span>
    </button>
    <FilterChild
        v-for="child in children"
        v-if="showChildren"
        :id="child.id"
        :children="child.children"
        :type="child.type"
        :level="child.level"
        :name="child.name"
        :depth="depth + 1"
    >
    </FilterChild>
</template>

<style scoped>
/* The skill buttons */
.skill-button {
    padding: 10px;
    margin-bottom: 10px;
    border-style: solid;
    border-width: 2px;
    border-radius: 8px;
    width: 300px;
    height: 40px;
    color: #53389e;
    font-size: 16px;
    font-weight: 500;
    background-color: #f2edff;
}
</style>
