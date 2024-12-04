<script>
// Import store.
import { useUserDetailsStore } from '../../stores/UserDetailsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        // Run the GET request.
        userDetailsStore.getUserDetails();
        return {
            userDetailsStore
        };
    },
    data() {
        return {
            news: []
        };
    },
    computed: {},
    async created() {
        await this.getNews();
    },
    methods: {
        getNews() {
            fetch('/news/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => (this.news = data));
        },
        SaveChange() {
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    news1: this.news.news_1,
                    news2: this.news.news_2,
                    news3: this.news.news_3,
                    news4: this.news.news_4
                })
            };
            var url = '/news/edit';
            fetch(url, requestOptions);
        }
    }
};
</script>

<template>
    <h2 class="primary-heading">News</h2>
    <div class="table-div row rounded mb-3">
        <div class="p-2 col-lg-3 col-md-6">
            <p v-if="userDetailsStore.role != 'admin'">{{ news.news_1 }}</p>
            <textarea
                v-else
                @change="SaveChange()"
                v-model="news.news_1"
                class="form-control"
                rows="3"
            ></textarea>
        </div>
        <div class="p-2 col-lg-3 col-md-6">
            <p v-if="userDetailsStore.role != 'admin'">{{ news.news_2 }}</p>
            <textarea
                v-else
                @change="SaveChange()"
                v-model="news.news_2"
                class="form-control"
                rows="3"
            ></textarea>
        </div>
        <div class="p-2 col-lg-3 col-md-6">
            <p v-if="userDetailsStore.role != 'admin'">{{ news.news_3 }}</p>
            <textarea
                v-else
                @change="SaveChange()"
                v-model="news.news_3"
                class="form-control"
                rows="3"
            ></textarea>
        </div>
        <div class="p-2 col-lg-3 col-md-6">
            <p v-if="userDetailsStore.role != 'admin'">{{ news.news_4 }}</p>
            <textarea
                v-else
                @change="SaveChange()"
                v-model="news.news_4"
                class="form-control"
                rows="3"
            ></textarea>
        </div>
    </div>
</template>

<style scoped>
.table-div {
    background-color: white;
    border-radius: 10px;
    padding: 5px;
    border: 1px solid black;
}

/* Because some wonky things we have to manual Style margin and border of row */
.row {
    padding-top: 0px;
    padding-left: 0px;
    padding-right: 0px;
    padding-bottom: 0px;
    margin-top: -2px;
    margin-left: 0px;
    margin-right: -1px;
    border-width: 1px !important;
    border-collapse: collapse;
}

.news-cell {
    border-width: 1px !important;
    padding: 10px;
    background-color: white;
}

/* View Specific On Phone */
@media (min-width: 320px) and (max-width: 576px) {
    .container {
        padding-left: 12px;
        padding-right: 12px;
    }

    .row {
        padding-top: 0px;
        padding-left: 0px;
        padding-right: 0px;
        padding-bottom: 0px;
        margin-left: -1px;
        margin-right: 0px;

        border-width: 1px !important;
        border-collapse: collapse;
    }
}

/* View Specific On Tablet */
@media (min-width: 577px) and (max-width: 1020px) {
    .container {
        padding-left: 0px;
        padding-right: 0px;
    }

    .row {
        padding-top: 0px;
        padding-left: 0px;
        padding-right: 0px;
        padding-bottom: 0px;
        margin-top: -2px;
        margin-left: 0px;
        margin-right: 0px;

        border-width: 1px !important;
        border-collapse: collapse;
    }
}
</style>
