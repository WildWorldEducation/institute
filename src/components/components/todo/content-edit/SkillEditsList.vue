<script>
// import store
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
                { text: 'Skill Name', value: 'name' },
                { text: 'Skill Level', value: 'level' },
                { text: 'Comment', value: 'comment' },
                { text: 'Date', value: 'date' }
            ],
            mobileHeaders: [
                { text: 'User', value: 'userName' },
                { text: 'Skill Name', value: 'name' },
                { text: 'Comment', value: 'comment' }
            ],
            dataTableRef: null,
            isLoading: true
        };
    },
    components: {
        Vue3EasyDataTable
    },
    props: ['skillsEditList', 'skillEditsLoading'],
    async mounted() {
        this.dataTableRef = this.$refs.dataTable;
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
            this.dataTableRef.updateRowsPerPageActiveOption(
                parseInt(this.settingStore.todoSkillTableRows)
            );
            this.isLoading = false;
        } else {
            this.isLoading = false;
        }
    },
    computed: {
        rowsPerPage() {
            console.log('ROW CHANGE: ');
            console.log(this.dataTableRef?.rowsPerPageActiveOption);
            return this.dataTableRef?.rowsPerPageActiveOption;
        }
    },
    methods: {
        goToComparePage(item) {
            this.$router.push(
                `/content-edit/${item.skill_id}/${item.user_id}/comparison?type=skill`
            );
        },
        formatDate(unformattedDate) {
            // Prep the date and time data ---------------
            // Split timestamp into [ Y, M, D, h, m, s ]
            var date = unformattedDate.replace('T', ' ');
            date = date.replace('Z', ' ');
            let newDate = date.split(/[- :]/);
            // Apply each element to the Date function
            var finalDate = new Date(
                Date.UTC(
                    newDate[0],
                    newDate[1] - 1,
                    newDate[2],
                    newDate[3],
                    newDate[4],
                    newDate[5]
                )
            );
            var options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            };
            finalDate = finalDate.toLocaleDateString('en-US', options);
            return finalDate;
        }
    }
};
</script>

<template>
    <div class="mt-3 pt-4 table-div h-100">
        <!-- Desktop table -->
        <Vue3EasyDataTable
            ref="dataTable"
            :headers="headers"
            :items="skillsEditList"
            alternating
            :loading="skillEditsLoading"
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
            <!-- --- Skill Name Router Column --- -->
            <template #item-name="{ name, skill_id, user_id }">
                <RouterLink
                    class="cell-link"
                    :to="`/content-edit/${skill_id}/${user_id}/comparison?type=skill`"
                    >{{ name }}</RouterLink
                >
            </template>
        </Vue3EasyDataTable>
        <!-- an ugly hack to watch row per page change   -->
        <div class="d-none">{{ rowsPerPage }}</div>
        <!-- Mobile table -->
        <Vue3EasyDataTable
            :headers="mobileHeaders"
            :items="skillsEditList"
            alternating
            :loading="skillEditsLoading"
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
