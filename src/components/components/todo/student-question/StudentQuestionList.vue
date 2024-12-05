<script>
import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';
import { useSettingsStore } from '../../../../stores/SettingsStore';
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
                { text: 'Student', value: 'studentName' },
                { text: 'Question', value: 'question' },
                { text: 'Skill Name', value: 'skillName' },
                { text: 'Date', value: 'date' }
            ],
            mobileHeaders: [
                { text: 'Student', value: 'studentName' },
                { text: 'Question', value: 'question' },
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
    props: ['studentQuestion', 'loadingQuestion'],
    async mounted() {
        this.dataTableRef = this.$refs.dataTable;
        this.dataTableRefM = this.$refs.dataTableM;
        this.isLoading = true;
        // fetch setting data if we dont have pagination data yet
        if (
            this.settingStore.todoContentFlagTableRows === 0 ||
            this.settingStore.todoEssayQuestionTableRows === 0 ||
            this.settingStore.todoImageQuestionTableRows === 0 ||
            this.settingStore.todoStudentQuestionTableRows === 0 ||
            this.settingStore.todoMcQuestionTableRows === 0 ||
            this.settingStore.todoSkillTableRows === 0
        ) {
            await this.settingStore.getSettings();
            this.isLoading = false;
        } else {
            this.isLoading = false;
        }
        this.dataTableRef.updateRowsPerPageActiveOption(
            parseInt(this.settingStore.todoStudentQuestionTableRows)
        );
        this.dataTableRefM.updateRowsPerPageActiveOption(
            parseInt(this.settingStore.todoStudentQuestionTableRows)
        );
        // tell the compute function that we are ready to listen to rows per page change
        this.isMounted = true;
        this.windowWidth = window.innerWidth;
    },
    methods: {
        goToComparePage(item) {
            this.$router.push(`/check-student-question/${item.id}`);
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
    },
    computed: {
        rowsPerPage() {
            if (this.isMounted) {
                if (
                    parseInt(this.settingStore.todoStudentQuestionTableRows) !==
                    parseInt(this.dataTableRef?.rowsPerPageActiveOption)
                ) {
                    this.settingStore.todoStudentQuestionTableRows =
                        this.dataTableRef?.rowsPerPageActiveOption;
                    this.settingStore.saveSettings();
                }
            }
            return this.dataTableRef?.rowsPerPageActiveOption;
        },
        rowsPerPageM() {
            if (this.isMounted && parseInt(this.windowWidth) <= 575) {
                if (
                    parseInt(this.settingStore.todoStudentQuestionTableRows) !==
                    parseInt(this.dataTableRefM?.rowsPerPageActiveOption)
                ) {
                    this.settingStore.todoStudentQuestionTableRows =
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
    <div class="mt-3 table-div h-100">
        <!-- Desktop table -->
        <Vue3EasyDataTable
            ref="dataTable"
            :headers="headers"
            :items="studentQuestion"
            alternating
            :loading="loadingQuestion"
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
            <!-- Format date -->
            <template #item-date="{ create_date }">
                <div>
                    {{ formatDate(create_date) }}
                </div>
            </template>
            <!-- --- Name Router Column --- -->
            <template #item-question="{ question, id }">
                <RouterLink
                    class="cell-link"
                    :to="`/check-student-question/${id}`"
                    >{{ question }}</RouterLink
                >
            </template>
        </Vue3EasyDataTable>
        <!-- Mobile table -->
        <Vue3EasyDataTable
            ref="dataTableM"
            :headers="mobileHeaders"
            :items="studentQuestion"
            alternating
            :loading="loadingQuestion"
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
            <!-- Format date -->
            <template #item-date="{ create_date }">
                <div>
                    {{ formatDate(create_date) }}
                </div>
            </template>
        </Vue3EasyDataTable>
        <!-- An Ugly hack to listen to row per page change -->
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
    --easy-table-header-font-color: var(--primary-color);
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
    border: 1px var(--primary-color) solid;
    border-color: var(--primary-color) !important;
    border-radius: 5px;
    outline: none;
}

/* Style Specific On Phone  */
@media (max-width: 801px) {
    .table-div {
        padding: 0px;
    }

    .customize-table {
        --easy-table-header-font-size: 14px;
        --easy-table-body-row-font-size: 12px;
    }
}

/* View Specific on Tablet */
@media (min-width: 577px) and (max-width: 1380px) {
    .table-div {
        padding: 0px;
    }
}
</style>
