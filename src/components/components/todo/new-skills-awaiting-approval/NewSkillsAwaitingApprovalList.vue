<script>
export default {
    setup() {},
    data() {
        return {
            newSkillsAwaitingApproval: []
        };
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
                .then((data) => {
                    this.newSkillsAwaitingApproval = data;
                });
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
        <ul>
            <li v-for="potentialNewSkill in newSkillsAwaitingApproval">
                <router-link
                    :to="'new-skill-awaiting-approval/' + potentialNewSkill.id"
                    >{{ potentialNewSkill.name }}</router-link
                >
            </li>
        </ul>
    </div>
</template>

<style scoped></style>
