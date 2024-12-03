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
        <div class="container">
            <ShowSkill />
        </div>
    </div>
</template>

<style scoped></style>
