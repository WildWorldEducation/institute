<script setup>
import RadialTidyTree from '../components/skilltrees/RadialTidyTree.vue';
</script>

<template>
    <div id="purple-banner"></div>
    <!-- Display loading screen while asynchronous call is made. -->
    <Suspense>
        <template #default>
            <RadialTidyTree />
        </template>
        <template #fallback>
            <span>Loading...</span>
        </template>
    </Suspense>
</template>

<style>
#purple-banner {
    height: 90px;
    background-color: #a48be640;
}
</style>
