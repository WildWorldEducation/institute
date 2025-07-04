<script>
import * as d3 from 'd3';

export default {
    name: 'GanttChart',
    props: {
        data: {
            required: true,
            type: Array
        }
    },
    data() {
        return {
            padding: 60
        };
    },
    mounted() {},
    computed: {}
};
</script>

<template>
    <div id="chart-container"></div>
</template>

<style scoped></style>
