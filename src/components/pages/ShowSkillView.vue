<script>
import ShowSkill from '../components/ShowSkill.vue';

export default {
    data() {
        return {
            skillId: this.$route.params.skillId
        };
    },
    components: {
        ShowSkill
    }
};
</script>

<template>
    <div class="position-relative d-flex">
        <div class="container show-skill-ctnr">
            <ShowSkill />
        </div>
        <div id="banner">
            <!-- Banner image -->
            <img
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
