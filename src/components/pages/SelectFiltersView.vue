<script>
import { useTagsStore } from '../../stores/TagsStore';

export default {
    setup() {
        const tagsStore = useTagsStore();

        return {
            tagsStore
        };
    },
    data() {
        return {
            filters: []
        };
    },
    async created() {
        if (this.tagsStore.tagsList.length == 0)
            await this.tagsStore.getTagsList();
        for (let i = 0; i < this.tagsStore.tagsList.length; i++) {
            if (this.tagsStore.tagsList[i].is_active == 'active')
                this.filters.push(this.tagsStore.tagsList[i].id);
        }
    },
    methods: {
        Submit() {
            for (let i = 0; i < this.tagsStore.tagsList.length; i++) {
                if (this.filters.includes(this.tagsStore.tagsList[i].id)) {
                    this.tagsStore.tagsList[i].is_active = 'active';
                } else {
                    this.tagsStore.tagsList[i].is_active = 'inactive';
                }
            }

            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tags: this.tagsStore.tagsList
                })
            };
            var url = '/tags/select';
            fetch(url, requestOptions).then(() => {
                this.$router.push('/profile-settings');
            });
        }
    }
};
</script>

<template>
    <div class="container mb-3">
        <h1>Select Global Filters</h1>
        <div v-for="tag in this.tagsStore.tagsList">
            <div class="form-check">
                <input
                    class="form-check-input"
                    type="checkbox"
                    :value="tag.id"
                    id="flexCheckDefault"
                    v-model="filters"
                />
                <label class="form-check-label" for="flexCheckDefault">
                    {{ tag.name }}
                </label>
            </div>
        </div>
        <div class="d-flex justify-content-between mb-3 mt-4">
            <router-link class="btn btn-dark" to="/profile-settings">
                Cancel
            </router-link>
            <button @click="Submit()" type="submit" class="btn btn-dark">
                Submit
            </button>
        </div>
    </div>
</template>

<style></style>
