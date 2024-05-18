<script setup>
import AddSkill from '../components/AddSkill.vue';
</script>

<template>
    <div id="banner">
        <img src="/images/banners/general-banner.png" class="image-fluid" />
    </div>
    <AddSkill />
</template>

<style>
#banner {
    width: 100%;
    height: fit-content;
}

.image-fluid {
    width: 100%;
    height: auto;
}
</style>
