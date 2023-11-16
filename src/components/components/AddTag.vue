<script>
// Import
import router from "../../router";
// Import the tags store.
import { useTagsStore } from '../../stores/TagsStore'

export default {
    setup() {
        const tagsStore = useTagsStore();
        tagsStore.getTagsList()
        return {
            tagsStore
        }
    },
    data() {
        return {
            tag: {},
        }
    },
    methods: {
        ValidateTag() {
            if (this.tag.name == "" || this.tag.name == null) {
                alert("Please give the tag a name.");
                return;
            }
            else {
                for (let i = 0; i < this.tagsStore.tagsList.length; i++) {
                    if (this.tagsStore.tagsList[i].name == this.tag.name) {
                        alert("Tag already exists.");
                        return;
                    }
                }
            }
            // Only runs if no errors found above.
            this.Submit();
        },

        Submit() {
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    {
                        name: this.tag.name,
                    })
            };
            var url = '/tags/add';
            fetch(url, requestOptions)
                .then(function (response) {
                    // Return to tags list page.
                    router.push({ name: "tags" });
                });
        },
    }
}
</script> 

<template>
    <div class="container mt-3">
        <h1>Add Tag</h1>
        <div class="row">
            <div class="col-sm-4">
                <div class="mb-3">
                    <label for="name" class="form-label">Name</label>
                    <input v-model="tag.name" type="text" class="form-control">
                </div>
                <button class="btn btn-dark" @click="ValidateTag()">Submit</button>
            </div>
        </div>
    </div>
</template>


<style scoped></style>