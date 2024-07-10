<script>
import AddStudent from '../components/AddStudent.vue';
export default {
    components: { AddStudent }
};
</script>

<template>
    <div id="banner">
        <img src="/images/banners/general-banner.png" class="image-fluid" />
    </div>
    <AddStudent />
</template>

<style scoped>
#banner {
    width: 100%;
    height: fit-content;
}

.image-fluid {
    width: 100%;
    height: auto;
}
</style>
