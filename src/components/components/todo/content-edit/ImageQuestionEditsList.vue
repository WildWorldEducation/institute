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
                { text: 'User', value: 'userName' },
                { text: 'Name', value: 'name' },
                { text: 'Question', value: 'question' },
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
    props: ['imageQuestionEditsList', 'imageQuestionEditsLoading'],
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
            parseInt(this.settingStore.todoImageQuestionTableRows)
        );
        this.dataTableRefM.updateRowsPerPageActiveOption(
            parseInt(this.settingStore.todoImageQuestionTableRows)
        );
        // tell the compute function that we are ready to listen to rows per page change
        this.isMounted = true;
        this.windowWidth = window.innerWidth;
    },
    methods: {
        goToComparePage(item) {
            this.$router.push(
                `/content-edit/${item.image_question_id}/${item.user_id}/comparison?type=imagequestion`
            );
        }
    },
    computed: {
        rowsPerPage() {
            if (this.isMounted) {
                if (
                    parseInt(this.settingStore.todoImageQuestionTableRows) !==
                    parseInt(this.dataTableRef?.rowsPerPageActiveOption)
                ) {
                    this.settingStore.todoImageQuestionTableRows =
                        this.dataTableRef?.rowsPerPageActiveOption;
                    this.settingStore.saveSettings();
                }
            }
            return this.dataTableRef?.rowsPerPageActiveOption;
        },
        rowsPerPageM() {
            if (this.isMounted && parseInt(this.windowWidth) <= 575) {
                if (
                    parseInt(this.settingStore.todoImageQuestionTableRows) !==
                    parseInt(this.dataTableRefM?.rowsPerPageActiveOption)
                ) {
                    this.settingStore.todoImageQuestionTableRows =
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
    <div class="mt-1 table-div">
        <!-- Desk top table -->
        <Vue3EasyDataTable
            ref="dataTable"
            :headers="headers"
            :items="imageQuestionEditsList"
            alternating
            :loading="imageQuestionEditsLoading"
            table-class-name="customize-table"
            buttons-pagination
            @click-row="goToComparePage"
            class="d-none d-md-block"
        >
            <!-- Loading animation -->
            <template #loading>
                <div
                    class="d-flex justify-content-center align-items-center mt-5"
                >
                    <span class="loader"></span>
                </div>
            </template>

            <!-- --- Question Name Router Column --- -->
            <template #item-name="{ name, image_question_id, user_id }">
                <RouterLink
                    class="cell-link"
                    :to="`/content-edit/${image_question_id}/${user_id}/comparison?type=imagequestion`"
                    >{{ name }}</RouterLink
                >
            </template>
        </Vue3EasyDataTable>
        <!-- mobile table -->
        <Vue3EasyDataTable
            ref="dataTableM"
            :headers="mobileHeaders"
            :items="imageQuestionEditsList"
            alternating
            :loading="imageQuestionEditsLoading"
            table-class-name="customize-table"
            buttons-pagination
            @click-row="goToComparePage"
            class="d-md-none d-block"
        >
            <!-- Loading animation -->
            <template #loading>
                <div
                    class="d-flex justify-content-center align-items-center mt-5"
                >
                    <span class="loader"></span>
                </div>
            </template>
        </Vue3EasyDataTable>
        <div class="d-none">
            {{ rowsPerPage }}
            {{ rowsPerPageM }}
        </div>
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
    --easy-table-header-font-size: 18px;
    --easy-table-header-font-color: var(--primary-color);
    --easy-table-header-background-color: #fefefe;
    --easy-table-header-height: 50px;
    --easy-table-header-item-padding: 15px 10px;
}

.customize-table :deep(tbody tr:hover) {
    cursor: pointer;
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

/* Loading animation */
.loader {
    width: 48px;
    height: 48px;
    border: 5px solid var(--primary-color);
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
/* End of loading animation */
</style>
