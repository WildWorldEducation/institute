<script>
// Import the stores.
import { useTagsStore } from '../../stores/TagsStore'

export default {
    setup() {
        const tagsStore = useTagsStore();
        return {
            tagsStore
        }
    },
    data() {
        return {
            filters: [
            ],
            checkedFilters: []
        }
    },
    async created() {
    },
    async mounted() {
        await this.tagsStore.getTagsList()
    },
    methods: {
        applyFilter: function () {
            this.$parent.applyFilter(this.checkedFilters);
        }
    }
}
</script>

<template>
    <div id="filters">
        <h1 id="filterMainHeader" class="mb-2">My Skills Tree</h1>
        <div class="form-check">
            <input class="form-check-input" type="checkbox" :value="0" id="flexCheckDefault" v-model="checkedFilters"
                @change="applyFilter()">
            <label class=" form-check-label" for="flexCheckDefault">
                Mastered and available skills
            </label>
        </div>

        <div v-for="tag in this.tagsStore.tagsList">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" :value="tag.id" id="flexCheckDefault"
                    v-model="checkedFilters" @change="applyFilter()">
                <label class=" form-check-label" for="flexCheckDefault">
                    {{ tag.name }}
                </label>
            </div>
        </div>
    </div>
</template>


<style scoped>
#filter {
    color: white
}

#filterMainHeader {
    font-family: 'Poppins900';
    color: #65E0A5;
    font-size: 38px;
}

#customFiltersHeader {
    /* font-family: 'Poppins900'; */
    color: #65E0A5;
    font-size: 24px;
}

option:checked,
option:hover {
    background-color: rgba(101, 224, 165, 0.1);
}

.filter-select {
    border: 1px solid #65E0A5;
}

.filter-select:focus {
    box-shadow: 0 0 0 0.25rem rgba(101, 224, 165, 0.25);
}
</style>