<script>
// Import the stores.
import { useCohortsStore } from '../../../stores/CohortsStore.js';

export default {
    setup() {
        const cohortsStore = useCohortsStore();
        return {
            cohortsStore
        };
    },
    props: [
        'id',
        'children',
        'name',
        'type',
        'level',
        'depth',
        'filtered',
        'ancestorFiltered'
    ],
    data() {
        return {
            cohortId: this.$route.params.cohortId,
            showChildren: false,
            isFiltered: null
        };
    },
    computed: {
        indent() {
            var amount = 0;
            if (screen.width <= 480) {
                if (this.depth == 1) {
                    amount = 25;
                } else {
                    amount = 20;
                }
            } else {
                amount = 50;
            }

            // For regular skills.
            if (this.type != 'sub') {
                return {
                    transform: `translate(${this.depth * amount - 35.2}px)`
                };
            }
            // For subskills. They should be indented to the same amount as their main skill.
            else {
                return {
                    transform: `translate(${
                        (this.depth - 1) * amount - 35.2
                    }px)`
                };
            }
        }
    },
    async created() {},
    methods: {
        toggleChildSkills() {
            this.showChildren = !this.showChildren;
        },
        filter() {           
            // Toggle isFiltered
            if (this.filtered == 1) {
                this.isFiltered = 0;
            } else {
                this.isFiltered = 1;
            }
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cohortId: this.cohortId,
                    skillId: this.id,
                    isFiltered: this.isFiltered
                })
            };
            var url = '/cohorts/' + this.cohortId + '/edit-filters';
            fetch(url, requestOptions).then((response) => {
                this.cohortsStore.getCohortSkillFilters(this.cohortId);
            });
        }
    },
    components: {}
};
</script>

<template>
    <button
        :style="indent"
        class="filter-button d-flex justify-content-between align-items-center"
        :class="{ 'is-filtered': filtered == 1 || ancestorFiltered == 1 }"
        @click="toggleChildSkills()"
    >
        <span> {{ name }}</span>
        <div>
            <!-- Filter Button -->
            <button class="btn" @click.stop="filter">
                <!-- filter icon -->
                <svg
                    v-if="filtered != 1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    height="18"
                    width="18"
                >
                    <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                    <path
                        d="M3.9 54.9C10.5 40.9 24.5 32 40 32l432 0c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9 320 448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6l0-79.1L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z"
                        fill="#9C7EEC"
                    />
                </svg>
                <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 576 512"
                    height="18"
                    width="18"
                >
                    <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                    <path
                        d="M3.9 22.9C10.5 8.9 24.5 0 40 0L472 0c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L396.4 195.6C316.2 212.1 256 283 256 368c0 27.4 6.3 53.4 17.5 76.5c-1.6-.8-3.2-1.8-4.7-2.9l-64-48c-8.1-6-12.8-15.5-12.8-25.6l0-79.1L9 65.3C-.7 53.4-2.8 36.8 3.9 22.9zM432 224a144 144 0 1 1 0 288 144 144 0 1 1 0-288zm59.3 107.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L432 345.4l-36.7-36.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6L409.4 368l-36.7 36.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0L432 390.6l36.7 36.7c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L454.6 368l36.7-36.7z"
                        fill="#9C7EEC"
                    />
                </svg>
            </button>
            <!-- Collapse / Expand Button -->
            <button
                v-if="children.length != 0"
                @click.stop="toggleChildSkills"
                class="btn"
            >
                <!-- Collapse icon -->
                <svg
                    v-if="!showChildren"
                    height="18"
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                >
                    <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                    <path
                        fill="#9C7EEC"
                        d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"
                    />
                </svg>
                <svg
                    v-else
                    height="18"
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                >
                    <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.
                    -->
                    <path
                        fill="#9C7EEC"
                        d="M201.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 205.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z"
                    />
                </svg>
            </button>
        </div>
    </button>
    <FilterChild
        v-for="child in children"
        v-if="showChildren"
        :id="child.id"
        :filtered="child.filtered"
        :ancestorFiltered="filtered"
        :children="child.children"
        :type="child.type"
        :level="child.level"
        :name="child.name"
        :depth="depth + 1"
    >
    </FilterChild>
</template>

<style scoped>
/* The skill buttons */
.filter-button {
    padding: 10px;
    margin-bottom: 10px;
    border-style: solid;
    border-width: 2px;
    border-radius: 8px;
    width: 90%;
    height: 40px;
    color: #53389e;
    font-size: 16px;
    font-weight: 500;
    background-color: #f2edff;
}

.is-filtered {
    background-color: orange;
}
</style>
