<script setup>
import ShowSkillRevision from '../components/show-skill-revision/ShowSkillRevision.vue';
</script>

<template>
    <div class="position-relative d-flex">
        <div class="container show-skill-ctnr">
            <ShowSkillRevision />
        </div>
        <div id="banner">
            <!--TODO: Assign banner dynamically -->
            <img v-bind:src="bannerImage" class="img-fluid" />
            <!-- Show a static img if skill have no banner image -->
            <img
                v-if="!bannerImage"
                src="/images/banners/institute-collins-2.png"
                class="img-fluid"
            />
        </div>
    </div>
</template>

<style scoped>
.show-skill-ctnr {
    z-index: 10 !important;
    width: 100%;
    margin-top: 40px;
}

#banner {
    z-index: -10 !important;
    top: 0px;
    position: absolute !important;
    width: 100%;
}

.img-fluid {
    width: 100% !important;
}
</style>
