<script>

export default {
    setup() {

    },
    data() {
        return {
            levels: [
                {
                    id: 'grade_school',
                    name: 'Grade school'
                },
                {
                    id: 'middle_school',
                    name: 'Middle school'
                },
                {
                    id: 'high_school',
                    name: 'High school'
                },
                {
                    id: 'college',
                    name: 'College'
                },
                {
                    id: 'phd',
                    name: 'PhD'
                }
            ],
            checkedFilters: []
        }
    },
    async created() {
    },
    async mounted() {

    },
    methods: {
        applyFilter: function (level) {
            this.$parent.filterSkills(level)

            
        }
    }
}
</script>

<template>
    <div id="filters">
        <h1 id="filterMainHeader" class="mb-2">My Skill Tree</h1>
        <div class="form-check">
            <input class="form-check-input" type="checkbox" :value="0" id="flexCheckDefault" v-model="checkedFilters"
                @change="applyFilter()">
            <label class=" form-check-label" for="flexCheckDefault">
                Mastered and available skills
            </label>
        </div>

        <div v-for="level in levels">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" :value="level.id" id="flexCheckDefault"
                    v-model="checkedFilters" @change="applyFilter(level.id)">
                <label class=" form-check-label" for="flexCheckDefault">
                    {{ level.name }}
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