<script>
import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';

export default {
    setup() {
        return {};
    },
    data() {
        return {
            headers: [
                { text: 'User', value: 'userName' },
                { text: 'Question Name', value: 'name' },
                { text: 'Question Content', value: 'question' },
                { text: 'Comment', value: 'comment' },
                { text: 'Date', value: 'date' }
            ]
        };
    },
    components: {
        Vue3EasyDataTable
    },
    props: ['writtenEditsList'],
    async created() {},
    methods: {
        goToComparePage(item) {
            this.$router.push(
                `/content-edit/${item.essay_question_id}/${item.user_id}/comparison?type=essayquestion`
            );
        }
    }
};
</script>

<template>
    <div class="mt-3 pt-4 table-div">
        <Vue3EasyDataTable
            :headers="headers"
            :items="writtenEditsList"
            alternating
            :loading="writtenEditsList.length <= 0"
            table-class-name="customize-table"
            buttons-pagination
            theme-color="#a48be6"
            @click-row="goToComparePage"
        >
            <!-- --- Loading Part --- -->
            <template #loading>
                <img src="/images/loading.gif" alt="loading data" />
            </template>
        </Vue3EasyDataTable>
    </div>
</template>

<style scoped>
.table-div {
    padding-left: 15px;
    padding-right: 15px;
}

/* +-+-+ Vue Easy Table Custom CSS +-+-+  */
.customize-table {
    --easy-table-body-row-font-size: 16px;
    --easy-table-header-font-size: 16px;
    --easy-table-header-font-color: #8f7bd6;
    --easy-table-header-background-color: #fefefe;
    --easy-table-header-height: 50px;
    --easy-table-header-item-padding: 15px 10px;
}

.customize-table :deep(tbody tr:hover) {
    cursor: pointer;
}
</style>
