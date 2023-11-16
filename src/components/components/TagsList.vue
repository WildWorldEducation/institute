<script>
// Import the tags store.
import { useTagsStore } from '../../stores/TagsStore'

export default {
    setup() {
        const tagsStore = useTagsStore();
        // Run the GET request.
        tagsStore.getTagsList()
        return {
            tagsStore
        }
    },
    data() {
        return {
        }
    },
    computed: {
    },
    methods: {
    }
} 
</script>

<template>
    <div class="topnav">
        <router-link to="/tags/add">Add</router-link>
    </div>

    <div class="container mt-3">
        <h1>Tag List</h1>
        <div class="table_div">
            <table class="skilltree-table table-bordered">
                <tr>
                    <th>name</th>
                    <th></th>
                </tr>
                <tr v-for="tag in tagsStore.tagsList">
                    <td>
                        {{ tag.name }}
                    </td>
                    <td>
                        <button type="button" @click="tagsStore.deleteTag(tag.id)"
                            class="btn btn-danger delete-btn">Delete</button>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>


<style scoped></style>