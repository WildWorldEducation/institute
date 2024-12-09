<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    data() {
        return {
            theme: this.userDetailsStore.theme
        };
    },
    created() {},
    async mounted() {
        await this.userDetailsStore.getUserDetails();
    },
    methods: {
        chooseTheme() {
            this.userDetailsStore.updateTheme(this.theme);
        }
    }
};
</script>

<template>
    <div class="container pb-4 theme-background mt-2">
        <h2 class="secondary-heading h4">Theme</h2>
        <!-- Choose theme -->
        <div class="mb-3 text-start themes">
            <select class="form-select" @change="chooseTheme()" v-model="theme">
                <option value="original">Original</option>
                <option value="apprentice">Apprentice</option>
                <option value="scholar">Scholar</option>
            </select>
        </div>
    </div>
</template>

<style scoped>
.themes {
    width: 300px;
}

.theme-background {
    background-color: white;
    border-radius: 10px;
    padding: 10px;
}
</style>
