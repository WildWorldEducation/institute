<script>
import router from '../../router';

export default {
    data() {
        return {
            skillId: this.$route.params.skillId,
            description: null
        };
    },
    setup() {},
    mounted: function () {},
    methods: {
        async Submit() {
            var url = '/tutor-posts/add/' + this.skillId;

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: this.description
                })
            };
            await fetch(url, requestOptions).then(() => {
                router.back();
            });
        }
    }
};
</script>

<template>
    <div id="banner">
        <img
            v-bind:src="'/images/banners/students-banner.png'"
            class="img-fluid"
        />
    </div>
    <div class="container mt-3 pb-3">
        <div class="row">
            <div class="col-10 d-flex align-items-end">
                <h2 id="header-tile">Offer to Tutor</h2>
            </div>
        </div>
        <div class="main-content-container container-fluid p-2">
            <div class="row">
                <div class="col">
                    <div class="mb-3">
                        <label for="first_name" class="form-label"
                            >Describe your tutoring style and experience with
                            the subject</label
                        >
                        <textarea
                            v-model="description"
                            type="text"
                            class="form-control"
                        />
                        <div v-if="1 == 2" class="form-validate">
                            please complete this section!
                        </div>
                    </div>

                    <div class="d-flex justify-content-end gap-4">
                        <router-link
                            class="btn red-btn"
                            :to="'/skills/' + skillId"
                        >
                            Cancel
                        </router-link>
                        <button class="btn purple-btn" @click="Submit()">
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
h2 {
    color: #a48be6;
    font-size: 30px;
    font-weight: 700;
}

.red-btn {
    background-color: #e24d4d;
    color: white;
    border: 1px solid #d33622;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
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
</style>
