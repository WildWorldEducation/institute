<script setup>
import TidyTree from "../components/skilltrees/TidyTree.vue";
</script>

<template>
  <div id="purple-banner"></div>
  <!-- Display loading screen while asynchronous call is made. -->
  <Suspense>
    <template #default>
      <TidyTree />
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
