<script>
import SkillEditComparison from '../components/edit-comparisons/SkillEditComparison.vue';
import MCQuestionEditComparison from '../components/edit-comparisons/MCQuestionEditComparison.vue';
import EssayQuestionEditComparison from '../components/edit-comparisons/EssayQuestionEditComparison.vue';

export default {
    setup() {},
    data() {
        return {
            type: null,
            disableBtn: false
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
            <button
                :disabled="disableBtn"
                :class="['btn', disableBtn ? 'disable-btn' : 'red-btn']"
                @click="$refs.child.dismissEdit()"
            >
                Dismiss Edit
            </button>
            <button
                :disabled="disableBtn"
                :class="['btn', disableBtn ? 'disable-btn' : 'purple-btn']"
                @click="$refs.child.edit()"
            >
                Edit
            </button>
            <button
                :disabled="disableBtn"
                :class="['btn', disableBtn ? 'disable-btn' : 'green-btn']"
                @click="$refs.child.saveEdit()"
            >
                Save Edit
            </button>
        </div>
        <p>&nbsp;</p>
    </div>
</template>

<style scoped>
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

.red-btn,
:deep(.red-btn) {
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
.red-btn:hover,
:deep(.red-btn:hover) {
    background-color: #cc3535;
    color: white;
}

:deep(.purple-btn) {
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

:deep(.purple-btn:hover) {
    background-color: #8666ca;
    color: white;
}

:deep(.green-btn) {
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

:deep(.green-btn:hover) {
    background-color: #46f7df;
}

.disable-btn {
    background-color: #707281;
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
</style>
