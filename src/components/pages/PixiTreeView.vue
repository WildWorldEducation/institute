<script setup>
import PixiTree from '../components/skilltrees/PixiTree.vue';
import RadialTree from '../components/skilltrees/RadialTree.vue';
</script>

<template>
    <div id="purple-banner"></div>
    <!-- Display loading screen while asynchronous call is made. -->
    <Suspense>
        <template #default>
            <RadialTree />
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
