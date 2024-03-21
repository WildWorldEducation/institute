<script setup>
import CanvasRadialTree from '../components/skilltrees/CanvasRadialTree.vue';
</script>

<template>
    <div id="purple-banner"></div>
    <!-- Display loading screen while asynchronous call is made. -->
    <Suspense>
        <template #default>
            <CanvasRadialTree />
        </template>
        <template #fallback>
            <span>Loading...</span>
        </template>
    </Suspense>
</template>

<style>
#purple-banner {
    height: 40px;
    background-color: #a48be640;
}
</style>
