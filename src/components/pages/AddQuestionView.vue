<script setup>
import AddMCQuestion from '../components/AddMCQuestion.vue';
import AddEssayQuestion from '../components/AddEssayQuestion.vue';
</script>

<template>
    <AddMCQuestion />
    <p>&nbsp;</p>
    <AddEssayQuestion />
    <div class="d-flex justify-content-between">
        <a class="btn btn-dark" @click="$router.go(-1)">Cancel</a>
    </div>
</template>

<style></style>
