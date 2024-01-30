<script setup>
import PixiTree from "../components/skilltrees/PixiTree.vue";
</script>

<template>
  <div id="purple-banner"></div>
  <!-- Display loading screen while asynchronous call is made. -->
  <Suspense>
    <template #default>
      <PixiTree />
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
