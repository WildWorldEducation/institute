<script setup>
import SkillTree from '../components/SkillTree.vue'
</script>

<template>
    <div id="purple-banner"> 

    </div>
    <!-- Display loading screen while asynchronous call is made. -->
    <Suspense>
        <template #default>
            <SkillTree />
        </template>
        <template #fallback>
            <span>Loading...</span>
        </template>
    </Suspense>
</template> 

<style>
#purple-banner {
    height: 77px;
    background-color: #A48BE640;
}

template {
    height: 200px
}
</style>
