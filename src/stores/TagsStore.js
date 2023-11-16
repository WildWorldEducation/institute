import { defineStore } from 'pinia'

export const useTagsStore = defineStore("tags", {
    state: () => ({
        tagsList: [],
    }),
    actions: {
        async getTagsList() {
            const result = await fetch('/tags/list');
            const data = await result.json();
            this.tagsList = data;
        },
        async deleteTag(id) {
            console.log(id)
            const result = fetch('/tags/' + id,
                {
                    method: 'DELETE',
                });

            if (result.error) {
                console.log(result.error)
            }

            this.getTagsList();
        }
    }
});