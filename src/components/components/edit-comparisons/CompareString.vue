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
    async created() {
        console.log(this.diffString);
    },
    methods: {}
};
</script>

<template>
    <div class="d-flex flex-row align-items-center flex-wrap">
        <div v-for="change in diffString">
            <div
                v-if="change?.added && !change?.removed"
                class="mx-1 add"
                b-on-hoover
                title="added"
            >
                {{ change.value }}
            </div>
            <div
                v-if="!change?.added && change?.removed"
                class="mx-1 remove"
                b-on-hoover
                title="deleted"
            >
                {{ change.value }}
            </div>
            <div
                v-if="!change?.added && !change?.removed"
                class="mx-1 unchange"
            >
                {{ change.value }}
            </div>
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
    height: 100%;
}

.remove {
    background-color: #faa5a5;
    color: black;
    border-radius: 4px;
    height: 100%;
    text-decoration-line: line-through;
}

.small-change-text {
    font-size: 10px;
}
</style>
