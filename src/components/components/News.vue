<script>
// Import store.
import { useUserDetailsStore } from '../../stores/UserDetailsStore'

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        // Run the GET request.
        userDetailsStore.getUserDetails()
        return {
            userDetailsStore
        }
    },
    data() {
        return {
            news: []
        }
    },
    computed: {
    },
    async created() {
        await this.getNews();
    },
    methods: {
        getNews() {
            fetch('/news/list')
                .then(function (response) {
                    return response.json();
                }).then(data => this.news = data)
        },
        SaveChange() {
            const requestOptions = {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    {
                        news1: this.news.news_1,
                        news2: this.news.news_2,
                        news3: this.news.news_3,
                        news4: this.news.news_4,
                    })
            };
            var url = '/news/edit';
            fetch(url, requestOptions)
        }
    }
}
</script>

<template>
    <div class="container">
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>News</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <div class="row">
                        <div class="col-lg-3 col-md-6">
                            <p v-if="userDetailsStore.role != 'admin'">{{ news.news_1 }} </p>
                            <textarea v-else @change="SaveChange()" v-model="news.news_1" class="form-control"
                                rows="3"></textarea>
                        </div>
                        <div class="col-lg-3 col-md-6">
                            <p v-if="userDetailsStore.role != 'admin'">{{ news.news_2 }} </p>
                            <textarea v-else @change="SaveChange()" v-model="news.news_2" class="form-control"
                                rows="3"></textarea>
                        </div>
                        <div class="col-lg-3 col-md-6">
                            <p v-if="userDetailsStore.role != 'admin'">{{ news.news_3 }} </p>
                            <textarea v-else @change="SaveChange()" v-model="news.news_3" class="form-control"
                                rows="3"></textarea>
                        </div>
                        <div class="col-lg-3 col-md-6">
                            <p v-if="userDetailsStore.role != 'admin'">{{ news.news_4 }} </p>
                            <textarea v-else @change="SaveChange()" v-model="news.news_4" class="form-control"
                                rows="3"></textarea>
                        </div>
                    </div>
                </tr>
            </tbody>
        </table>
    </div>
</template>


<style scoped>
th {
    background-color: #56C5B6;
    border-color: #2FA894;
    color: #FFFFFF;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
}

td {
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    color: #667085;
}
</style>