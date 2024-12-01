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
            theme: useUserDetailsStore.theme
        };
    },
    created() {},

    methods: {
        chooseTheme() {
            this.userDetailsStore.updateTheme(this.theme);
        }
    }
};
</script>

<template>
    <div class="container pb-4">
        <h2
            id="heading"
            class="my-3 ms-0 ms-md-3 ms-lg-0 mt-2 mt-md-4 h2-stroke"
        >
            Theme
        </h2>
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
#heading {
    font-family: 'Poppins' sans-serif;
    font-weight: 900;
    line-height: 28px;
    letter-spacing: 0em;
    text-align: left;
}

.themes {
    width: 300px;
}
</style>
