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
                { text: 'Student', value: 'studentName' },
                { text: 'Question', value: 'question' },
                { text: 'Skill Name', value: 'skillName' },
                { text: 'Date', value: 'date' }
            ],
            mobileHeaders: [
                { text: 'User', value: 'userName' },
                { text: 'Question', value: 'question' },
                { text: 'Comment', value: 'comment' }
            ]
        };
    },
    components: {
        Vue3EasyDataTable
    },
    props: ['studentQuestion', 'loadingQuestion'],
    async mounted() {
        console.log(this.studentQuestion);
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
    }
};
</script>

<template>
    <div class="mt-3 table-div h-100">
        <!-- Desktop table -->
        <Vue3EasyDataTable
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
    outline: none;
}
</style>
