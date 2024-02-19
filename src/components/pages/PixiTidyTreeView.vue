<script setup>
import PixiTidyTree from '../components/skilltrees/PixiTidyTree.vue';
</script>

<template>
    <div id="purple-banner"></div>
    <!-- Display loading screen while asynchronous call is made. -->
    <Suspense>
        <template #default>
            <PixiTidyTree />
        </template>
        <template #fallback>
            <span>Loading...</span>
        </template>
    </Suspense>
</template>

<style>
#purple-banner {
    height: 20px;
    background-color: #a48be640;
}
</style>
