<script>
import { useSettingsStore } from '../../../../stores/SettingsStore';
import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';

export default {
    setup() {
        const settingStore = useSettingsStore();
        return {
            settingStore
        };
    },
    data() {
        return {
            headers: [
                { text: 'User', value: 'userName' },
                { text: 'Name', value: 'name' },
                { text: 'Content', value: 'question' },
                { text: 'Skill', value: 'skill_name' },
                { text: 'Comment', value: 'comment' },
                { text: 'Date', value: 'date' }
            ],
            mobileHeaders: [
                { text: 'User', value: 'userName' },
                { text: 'Skill', value: 'skill_name' },
                { text: 'Comment', value: 'comment' },
                { text: 'Date', value: 'date' }
            ],
            dataTableRef: null,
            dataTableRefM: null,
            isLoading: true,
            // make sure the table is mounted so we can compute the rows per page in peace
            isMounted: false,
            // we need this to determine if the web is in mobile mode
            windowWidth: Infinity
        };
    },
    components: {
        Vue3EasyDataTable
    },
    props: ['writtenEditsList', 'essayQuestionEditsLoading'],
    async mounted() {
        this.dataTableRef = this.$refs.dataTable;
        this.dataTableRefM = this.$refs.dataTableM;
        this.isLoading = true;
        // fetch setting data if we dont have pagination data yet
        if (
            this.settingStore.todoContentFlagTableRows === 0 ||
            this.settingStore.todoEssayQuestionTableRows === 0 ||
            this.settingStore.todoImageQuestionTableRows === 0 ||
            this.settingStore.todoImageQuestionTableRows === 0 ||
            this.settingStore.todoMcQuestionTableRows === 0 ||
            this.settingStore.todoSkillTableRows === 0
        ) {
            await this.settingStore.getSettings();
            this.isLoading = false;
        } else {
            this.isLoading = false;
        }
        this.dataTableRef.updateRowsPerPageActiveOption(
            parseInt(this.settingStore.todoEssayQuestionTableRows)
        );
        this.dataTableRefM.updateRowsPerPageActiveOption(
            parseInt(this.settingStore.todoEssayQuestionTableRows)
        );
        // tell the compute function that we are ready to listen to rows per page change
        this.isMounted = true;
        this.windowWidth = window.innerWidth;
    },
    methods: {
        goToComparePage(item) {
            this.$router.push(
                `/content-edit/${item.essay_question_id}/${item.user_id}/comparison?type=essayquestion`
            );
        }
    },
    computed: {
        rowsPerPage() {
            if (this.isMounted) {
                if (
                    parseInt(this.settingStore.todoEssayQuestionTableRows) !==
                    parseInt(this.dataTableRef?.rowsPerPageActiveOption)
                ) {
                    this.settingStore.todoEssayQuestionTableRows =
                        this.dataTableRef?.rowsPerPageActiveOption;
                    this.settingStore.saveSettings();
                }
            }
            return this.dataTableRef?.rowsPerPageActiveOption;
        },
        rowsPerPageM() {
            if (this.isMounted && parseInt(this.windowWidth) <= 575) {
                if (
                    parseInt(this.settingStore.todoEssayQuestionTableRows) !==
                    parseInt(this.dataTableRefM?.rowsPerPageActiveOption)
                ) {
                    console.log('MOBILE CALL');
                    console.log(this.settingStore.todoEssayQuestionTableRows);
                    this.settingStore.todoEssayQuestionTableRows =
                        this.dataTableRefM?.rowsPerPageActiveOption;
                    this.settingStore.saveSettings();
                }
            }
            return this.dataTableRef?.rowsPerPageActiveOption;
        }
    }
};
</script>

<template>
    <div class="mt-3 pt-4 table-div">
        <!-- Desk top table -->
        <Vue3EasyDataTable
            ref="dataTable"
            :headers="headers"
            :items="writtenEditsList"
            alternating
            :loading="essayQuestionEditsLoading"
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

            <!-- --- Question Name Router Column --- -->
            <template #item-name="{ name, essay_question_id, user_id }">
                <RouterLink
                    class="cell-link"
                    :to="`/content-edit/${essay_question_id}/${user_id}/comparison?type=mcquestion`"
                    >{{ name }}</RouterLink
                >
            </template>
        </Vue3EasyDataTable>
        <!-- mobile table -->
        <Vue3EasyDataTable
            ref="dataTableM"
            :headers="mobileHeaders"
            :items="writtenEditsList"
            alternating
            :loading="essayQuestionEditsLoading"
            table-class-name="customize-table"
            buttons-pagination
            theme-color="#a48be6"
            @click-row="goToComparePage"
            class="d-md-none d-block"
        >
            <!-- --- Loading Part --- -->
            <template #loading>
                <img src="/images/loading.gif" alt="loading data" />
            </template>
        </Vue3EasyDataTable>
        <div class="d-none">{{ rowsPerPage }} {{ rowsPerPageM }}</div>
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
