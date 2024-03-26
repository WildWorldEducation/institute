<script setup></script>

<template>
    <div id="purple-banner"></div>
    <!-- Display loading screen while asynchronous call is made. -->
    <Suspense>
        <template #default>
            <SkillTreeStudent />
        </template>
        <template #fallback>
            <span>Loading...</span>
        </template>
    </Suspense>
</template>

<style>
#purple-banner {
    height: 77px;
    background-color: #a48be640;
}

template {
    height: 200px;
}
</style>
