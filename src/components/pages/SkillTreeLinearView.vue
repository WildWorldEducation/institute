<script setup>
import SkillTreeLinear from '../components/SkillTreeLinear.vue'
</script>

<template>
    <div id="purple-banner">

    </div>
    <!-- Display loading screen while asynchronous call is made. -->
    <Suspense>
        <template #default>
            <SkillTreeLinear />
        </template>
        <template #fallback>
            <span>Loading...</span>
        </template>
    </Suspense>
</template> 

<style>
#purple-banner {
    height: 20px;
    background-color: #A48BE640;
}
</style>
