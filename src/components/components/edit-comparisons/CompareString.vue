<script>
export default {
    setup() {},
    data() {
        return {
            addCount: 0,
            removeCount: 0
        };
    },
    props: ['diffString'],
    async created() {},
    methods: {}
};
</script>

<template>
    <div class="d-flex flex-row align-items-center flex-wrap">
        <div v-for="string in diffString">
            <div v-if="string[0] === 1" class="add" b-on-hoover title="added">
                {{ string[1] }}
            </div>
            <div
                v-if="string[0] === -1"
                class="remove"
                b-on-hoover
                title="deleted"
            >
                {{ string[1] }}
            </div>
            <div v-if="string[0] === 0" class="unchange">{{ string[1] }}</div>
        </div>
    </div>
</template>

<style scoped>
.unchange {
    background-color: inherit;
    color: black;
}

.add {
    background-color: #81d5b9;
    border-radius: 4px;
    color: black;
    text-decoration: none;
}

.remove {
    background-color: #faa5a5;
    color: black;
    padding: 2px;
    border-radius: 4px;
}

.small-change-text {
    font-size: 10px;
}
</style>
