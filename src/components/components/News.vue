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
    <div class="">
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th class="table-header">News</th>
                </tr>
            </thead>
            <tbody>
                <tr class="row border">
                    <td
                        id="first-cell"
                        class="col-lg-3 border col-md-6 news-cell"
                    >
                        <p v-if="userDetailsStore.role != 'admin'">
                            {{ news.news_1 }}
                        </p>
                        <textarea
                            v-else
                            @change="SaveChange()"
                            v-model="news.news_1"
                            class="form-control"
                            rows="3"
                        ></textarea>
                    </td>
                    <td class="col-lg-3 col-md-6 border news-cell">
                        <p v-if="userDetailsStore.role != 'admin'">
                            {{ news.news_2 }}
                        </p>
                        <textarea
                            v-else
                            @change="SaveChange()"
                            v-model="news.news_2"
                            class="form-control"
                            rows="3"
                        ></textarea>
                    </td>
                    <td class="col-lg-3 col-md-6 border news-cell">
                        <p v-if="userDetailsStore.role != 'admin'">
                            {{ news.news_3 }}
                        </p>
                        <textarea
                            v-else
                            @change="SaveChange()"
                            v-model="news.news_3"
                            class="form-control"
                            rows="3"
                        ></textarea>
                    </td>
                    <td
                        id="last-cell"
                        class="col-lg-3 border col-md-6 news-cell"
                    >
                        <p v-if="userDetailsStore.role != 'admin'">
                            {{ news.news_4 }}
                        </p>
                        <textarea
                            v-else
                            @change="SaveChange()"
                            v-model="news.news_4"
                            class="form-control"
                            rows="3"
                        ></textarea>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
th {
    color: #ffffff;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
}

tr {
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    color: #667085;
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
    border-color: #2fa894 !important;
    border-width: 1px !important;
    border-collapse: collapse;
}

.news-cell {
    border-color: #2fa894 !important;
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
        border-color: #2fa894 !important;
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
        border-color: #2fa894 !important;
        border-width: 1px !important;
        border-collapse: collapse;
    }
}
</style>
