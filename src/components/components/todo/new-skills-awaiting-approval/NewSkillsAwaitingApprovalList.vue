<script>
export default {
    setup() {},
    props: [''],
    data() {
        return {};
    },
    components: {},
    async created() {
        await this.getNewSkillsAwaitingApproval();
    },
    methods: {
        async getNewSkillsAwaitingApproval() {
            await fetch('/new-skills-awaiting-approval/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {});
        }
    }
};
</script>

<template>
    <div class="w-100">
        <!-- Banner -->
        <div id="banner">
            <img src="/images/banners/general-banner.png" class="img-fluid" />
        </div>
        <!-- Page title -->
        <h2 class="ps-3 mt-2 page-title">Approve New Skills</h2>
    </div>
</template>

<style scoped></style>
