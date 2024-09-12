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
                { text: 'Comment', value: 'comment' },
                { text: 'Skill', value: 'skill_name' },
                { text: 'Date', value: 'date' }
            ],
            dataTableRef: null,
            dataTableRefM: null,
            isLoading: true,
            // make sure the table is mounted so we can compute the rows per page in peace
            isMounted: false
        };
    },
    components: {
        Vue3EasyDataTable
    },
    props: ['mcQuestionList', 'mcQuestionEditsLoading'],
    async mounted() {
        this.dataTableRef = this.$refs.dataTableMC;
        this.dataTableRefM = this.$refs.dataTableMCM;
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
            parseInt(this.settingStore.todoMcQuestionTableRows)
        );
        this.dataTableRefM.updateRowsPerPageActiveOption(
            parseInt(this.settingStore.todoMcQuestionTableRows)
        );
        // tell the compute function that we are ready to listen to rows per page change
        this.isMounted = true;
    },
    methods: {
        goToComparePage(item) {
            this.$router.push(
                `/content-edit/${item.mc_question_id}/${item.user_id}/comparison?type=mcquestion`
            );
        }
    },
    computed: {
        async rowsPerPage() {
            if (this.isMounted) {
                console.log('MC QUESTION REF: ');
                console.log(this.dataTableRef?.rowsPerPageActiveOption);
                if (
                    this.settingStore.todoMcQuestionTableRows !==
                    this.dataTableRef?.rowsPerPageActiveOption
                ) {
                    this.settingStore.todoMcQuestionTableRows =
                        this.dataTableRef?.rowsPerPageActiveOption;
                }
                await this.settingStore.saveSettings();
            }
            return this.dataTableRef?.rowsPerPageActiveOption;
        },
        async rowsPerPageM() {
            if (this.isMounted) {
                if (
                    this.settingStore.todoMcQuestionTableRows !==
                    this.dataTableRefM?.rowsPerPageActiveOption
                ) {
                    this.settingStore.todoMcQuestionTableRows =
                        this.dataTableRefM?.rowsPerPageActiveOption;
                }
                await this.settingStore.saveSettings();
            }
            return this.dataTableRefM?.rowsPerPageActiveOption;
        }
    }
};
</script>

<template>
    <div class="mt-3 pt-4 table-div">
        <!-- Desktop Table -->
        <Vue3EasyDataTable
            ref="dataTableMC"
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
        <!-- <div class="d-none">
            {{ rowsPerPage }}
            {{ rowsPerPageM }}
        </div> -->
        <!-- Mobile Table -->
        <Vue3EasyDataTable
            ref="dataTableMCM"
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
</style>
