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
    <div class="container-fluid">
        <AddMCQuestion />

        <br class="mt-3" />
        <div class="container mt-3">
            <hr id="divide-line" class="border border-1 opacity-75" />
        </div>
        <br />
        <AddEssayQuestion />
        <div class="container mt-3 pb-3 pe-0">
            <div class="d-flex flex-row-reverse pe-0 me-lg-0 me-2">
                <a class="btn red-btn" @click="$router.go(-1)">Cancel</a>
            </div>
        </div>
    </div>
</template>

<style>
#divide-line {
    color: #7f56d9;
}

.red-btn {
    background-color: #e24d4d;
    color: white;
    border: 1px solid #d33622;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
}

.red-btn:hover {
    background-color: #cc3535;
    color: white;
}

#banner {
    width: 100%;
    height: fit-content;
}

.image-fluid {
    width: 100%;
    height: auto;
}
</style>
