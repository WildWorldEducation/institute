<script>
import SkillEditComparison from '../components/edit-comparisons/SkillEditComparison.vue';
import MCQuestionEditComparison from '../components/edit-comparisons/MCQuestionEditComparison.vue';
import EssayQuestionEditComparison from '../components/edit-comparisons/EssayQuestionEditComparison.vue';

export default {
    setup() {},
    data() {
        return {
            type: null
        };
    },
    components: {
        SkillEditComparison,
        MCQuestionEditComparison,
        EssayQuestionEditComparison
    },
    async created() {
        // Show the correct component.
        this.type = this.$route.query.type;
    },
    methods: {}
};
</script>

<template>
    <!-- Banner -->
    <div id="banner">
        <img src="/images/banners/general-banner.png" class="img-fluid" />
    </div>
    <div class="container-fluid">
        <SkillEditComparison ref="child" v-if="type == 'skill'" />
        <MCQuestionEditComparison ref="child" v-if="type == 'mcquestion'" />
        <EssayQuestionEditComparison
            ref="child"
            v-if="type == 'essayquestion'"
        />
        <div class="d-flex justify-content-end gap-3">
            <button class="btn red-btn" @click="$refs.child.dismissEdit()">
                Dismiss Edit
            </button>
            <button class="btn purple-btn" @click="$refs.child.edit()">
                Edit
            </button>
            <button class="btn green-btn" @click="$refs.child.saveEdit()">
                Save Edit
            </button>
        </div>
        <p>&nbsp;</p>
    </div>
</template>

<style>
.page-title {
    color: #a48be7;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
}

h2 {
    color: #a48be6;
    font-size: 30px;
    font-weight: 700;
}

.red-btn {
    background-color: #e24d4d;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
    height: 44px;
}
.red-btn:hover {
    background-color: #cc3535;
    color: white;
}

.purple-btn {
    background-color: #a48be6;
    color: white;
    border: 1px solid #7f56d9;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
}

.purple-btn:hover {
    background-color: #8666ca;
    color: white;
}

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
    height: 44px;
}

.green-btn:hover {
    background-color: #46f7df;
}
</style>
