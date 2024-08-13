<script>
import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';

export default {
    setup() {
        return {};
    },
    data() {
        return {};
    },
    props: ['mcQuestionList'],
    async created() {},
    methods: {}
};
</script>

<template>
    <Vue3EasyDataTable
        :headers="headers"
        :items="rows"
        alternating
        :loading="mcQuestionList.length <= 0"
        table-class-name="customize-table"
        :filter-options="filterOptions()"
        :search-value="searchText"
        buttons-pagination
        theme-color="#a48be6"
    >
        <!-- --- Loading Part --- -->
        <template #loading>
            <img src="/images/loading.gif" alt="loading data" />
        </template>
    </Vue3EasyDataTable>
</template>

<style scoped></style>
