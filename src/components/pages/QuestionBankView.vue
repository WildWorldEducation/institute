<script>
import QuestionsBankQuestionList from '../components/QuestionsBankQuestionList.vue'
import { useSkillsStore } from '../../stores/SkillsStore.js';

export default {
    setup() {
        const skillsStore = useSkillsStore();
        return {
            skillsStore
        }
    },
    data() {
        return {
            skillId: this.$route.params.id,
            skillName: null,
            isMultipleChoice: true,
            isEssay: true,
        }
    },
    async created() {
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList()
        }

        for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
            if (this.skillId == this.skillsStore.skillsList[i].id) {
                this.skillName = this.skillsStore.skillsList[i].name;
            }
        }
    },
    components: {
        QuestionsBankQuestionList
    }
}
</script>

<template>
    <h1>{{ skillName }} Question Bank</h1>
    <div class="topnav d-flex">
        <div class="d-flex">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="true" v-model="isMultipleChoice">
                <label class="form-check-label">
                    Multiple choice
                </label>
            </div>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="true" v-model="isEssay">
                <label class="form-check-label">
                    Essay
                </label>
            </div>
        </div>
        <router-link class="purple-btn btn" :to="'/skills/' + skillId + '/question-bank/add'">Add
            Questions</router-link>
    </div>
    <QuestionsBankQuestionList :isMultipleChoice="isMultipleChoice" :isEssay="isEssay" />
</template>
  
<style>
.purple-btn {
    background-color: #A48BE6;
    color: white;
    border: 1px solid #7F56D9;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    max-width: fit-content;
    height: 44px;
    display: flex;
    align-items: center;
    margin-left: auto;
}
</style>    
  