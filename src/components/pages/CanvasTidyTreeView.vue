<script setup>
import CanvasTidyTree from '../components/skilltrees/CanvasTidyTree.vue';
</script>

<template>
    <div id="thin-purple-banner"></div>
    <!-- Display loading screen while asynchronous call is made. -->
    <Suspense>
        <template #default>
            <CanvasTidyTree />
        </template>
        <template #fallback>
            <span>Loading...</span>
        </template>
    </Suspense>
</template>

<style>
#thin-purple-banner {
    height: 20px;
    background-color: #a48be640;
}
</style>
