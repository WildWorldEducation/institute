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
/* some override bootstrap css */
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

.top-btn {
    width: 190px;
    height: auto;
    padding-top: 10px !important;
    padding-bottom: 10px !important;
    border-radius: 8px;
    border-color: #7f56d9;
    border-width: 1px;
    background-color: #a48be6;
    color: white;
    font-size: 1rem;
}

.top-btn:hover {
    background-color: #7f56d9;
}

#btn-row {
    padding-top: 21px;
    display: flex;
    flex-direction: row;
    justify-content: end;
    width: 100%;
}

#assessment-btn {
    margin-right: 15px;
}

/* View Specific On Phone */
@media (min-width: 0px) and (max-width: 576px) {
    #btn-row {
        padding-top: 21px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        width: 100%;
    }
}
</style>
