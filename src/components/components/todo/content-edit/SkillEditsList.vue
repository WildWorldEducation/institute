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
                { text: 'Name', value: 'name' },
                { text: 'Level', value: 'level' },
                { text: 'Comment', value: 'comment' },
                { text: 'Date', value: 'date' }
            ],
            mobileHeaders: [
                { text: 'User', value: 'userName' },
                { text: 'Name', value: 'name' },
                { text: 'Comment', value: 'comment' }
            ],
            dataTableRef: null,
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
    props: ['skillsEditList', 'skillEditsLoading'],
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
            parseInt(this.settingStore.todoSkillTableRows)
        );
        this.dataTableRefM.updateRowsPerPageActiveOption(
            parseInt(this.settingStore.todoSkillTableRows)
        );
        // tell the compute function that we are ready to listen to rows per page change
        this.isMounted = true;
        this.windowWidth = window.innerWidth;
    },
    computed: {
        rowsPerPage() {
            if (this.isMounted) {
                if (
                    parseInt(this.settingStore.todoSkillTableRows) !==
                    parseInt(this.dataTableRef?.rowsPerPageActiveOption)
                ) {
                    this.settingStore.todoSkillTableRows =
                        this.dataTableRef?.rowsPerPageActiveOption;
                    this.settingStore.saveSettings();
                }
            }
            return this.dataTableRef?.rowsPerPageActiveOption;
        },
        rowsPerPageM() {
            if (this.isMounted && parseInt(this.windowWidth) <= 575) {
                if (
                    parseInt(this.settingStore.todoSkillTableRows) !==
                    parseInt(this.dataTableRefM?.rowsPerPageActiveOption)
                ) {
                    this.settingStore.todoSkillTableRows =
                        this.dataTableRefM?.rowsPerPageActiveOption;
                    this.settingStore.saveSettings();
                }
            }
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
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            };
            finalDate = finalDate.toLocaleDateString('en-US', options);
            return finalDate;
        }
    }
};
</script>

<template>
    <div class="mt-1 table-div h-100">
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
            <!-- Loading animation -->
            <template #loading>
                <div
                    class="d-flex justify-content-center align-items-center mt-5"
                >
                    <span class="loader"></span>
                </div>
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
        <div class="d-none">{{ rowsPerPage }} {{ rowsPerPageM }}</div>
        <!-- Mobile table -->

        <Vue3EasyDataTable
            ref="dataTableM"
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
            <!-- Loading animation -->
            <template #loading>
                <div
                    class="d-flex justify-content-center align-items-center mt-5"
                >
                    <span class="loader"></span>
                </div>
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
