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
            ],
            mobileHeaders: [
                { text: 'User', value: 'userName' },
                { text: 'Comment', value: 'comment' },
                { text: 'Date', value: 'date' }
            ]
        };
    },
    components: {
        Vue3EasyDataTable
    },
    props: ['mcQuestionList', 'mcQuestionEditsLoading'],
    async created() {},
    methods: {
        goToComparePage(item) {
            this.$router.push(
                `/content-edit/${item.mc_question_id}/${item.user_id}/comparison?type=mcquestion`
            );
        }
    }
};
</script>

<template>
    <div class="mt-3 pt-4 table-div">
        <!-- Desktop Table -->
        <Vue3EasyDataTable
            :headers="headers"
            :items="mcQuestionList"
            alternating
            :loading="mcQuestionEditsLoading"
            table-class-name="customize-table"
            buttons-pagination
            theme-color="#a48be6"
            @click-row="goToComparePage"
            class="d-none d-md-block"
        >
            <!-- --- Loading Part --- -->
            <template #loading>
                <img src="/images/loading.gif" alt="loading data" />
            </template>

            <!-- --- Name Router Column --- -->
            <template #item-name="{ name, mc_question_id, user_id }">
                <RouterLink
                    class="cell-link"
                    :to="`/content-edit/${mc_question_id}/${user_id}/comparison?type=mcquestion`"
                    >{{ name }}</RouterLink
                >
            </template>
        </Vue3EasyDataTable>
        <!-- Mobile Table -->
        <Vue3EasyDataTable
            :headers="mobileHeaders"
            :items="mcQuestionList"
            alternating
            :loading="mcQuestionEditsLoading"
            table-class-name="customize-table"
            buttons-pagination
            theme-color="#a48be6"
            @click-row="goToComparePage"
            class="d-md-none"
        >
            <!-- --- Loading Part --- -->
            <template #loading>
                <img src="/images/loading.gif" alt="loading data" />
            </template>
            <!-- --- Name Router Column --- -->
            <template #item-name="{ name, mc_question_id, user_id }">
                <RouterLink
                    class="cell-link"
                    :to="`/content-edit/${mc_question_id}/${user_id}/comparison?type=mcquestion`"
                    >{{ name }}</RouterLink
                >
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

.cell-link {
    text-decoration: none;
    color: inherit;
}

.cell-link:focus {
    border: 1px #8f7bd6 solid;
    border-color: #4523be !important;
    border-radius: 5px;
}
</style>
