<script>
import AddMCQuestion from '../components/AddMCQuestion.vue';
import AddEssayQuestion from '../components/AddEssayQuestion.vue';

export default {
    data() {
        return {
            skillId: this.$route.params.id
        };
    },
    components: {
        AddMCQuestion,
        AddEssayQuestion
    }
};
</script>

<template>
    <div class="container bg-light rounded p-3">
        <h1 class="heading">Add Question</h1>
        <!-- MC Questions -->
        <AddMCQuestion />
        <!-- Essay Questions -->
        <AddEssayQuestion />
        <!-- Image Questions -->
        <div class="container mt-3">
            <div class="row mt-4">
                <div class="col-sm-4">
                    <router-link
                        class="btn green-btn"
                        :to="'/image-questions/' + skillId + '/add'"
                        >Image
                    </router-link>
                </div>
            </div>
        </div>
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

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    line-height: 24px;
    display: flex;
    align-items: center;
    height: auto;
    width: fit-content;
}

.green-btn:hover {
    background-color: #3eb3a3;
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
