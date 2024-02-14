<script setup>
import AddMCQuestion from '../components/AddMCQuestion.vue';
import AddEssayQuestion from '../components/AddEssayQuestion.vue';
</script>

<template>
    <div id="banner">
        <img
            src="/images/banners/institute-collins-2.png"
            class="image-fluid"
        />
    </div>
    <AddMCQuestion />

    <br class="mt-3" />
    <div class="container mt-3">
        <hr id="divide-line" class="border border-1 opacity-75" />
    </div>
    <br />
    <AddEssayQuestion />
    <div class="d-flex justify-content-between">
        <a class="btn btn-dark" @click="$router.go(-1)">Cancel</a>
    </div>
</template>

<style>
#divide-line {
    color: #7f56d9;
}
</style>
