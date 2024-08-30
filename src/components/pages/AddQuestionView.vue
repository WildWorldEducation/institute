<script setup>
import AddMCQuestion from '../components/AddMCQuestion.vue';
import AddEssayQuestion from '../components/AddEssayQuestion.vue';
</script>

<template>
    <div id="banner">
        <img
            src="/images/banners/institute-collins-2.png"
            class="image-fluid"
        />
    </div>

    <div class="container-fluid">
        <!-- MC Questions -->
        <AddMCQuestion />
        <br class="mt-3" />
        <div class="container mt-3">
            <hr id="divide-line" class="border border-1 opacity-75" />
        </div>
        <br />
        <!-- Essay Questions -->
        <AddEssayQuestion />
        <br class="mt-3" />
        <div class="container mt-3">
            <hr id="divide-line" class="border border-1 opacity-75" />
        </div>
        <br />
        <!-- Image Questions -->
        <div class="container mt-3">
            <h1>Add Image Question</h1>
            <div class="row mt-4">
                <div class="col-sm-4">
                    <router-link
                        class="btn green-btn"
                        :to="'/image-questions/' + skillId + '/add'"
                        >Enter Manually&nbsp;&nbsp;
                        <!-- Plus sign -->
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M6.34811 20.0423L6.34811 13.6494L-0.0358702 13.6583C-0.320945 13.6579 -0.594203 13.5444 -0.795782 13.3428C-0.997361 13.1412 -1.11082 12.868 -1.11132 12.5829L-1.11729 7.41477C-1.1168 7.1297 -1.00334 6.85644 -0.801757 6.65486C-0.600179 6.45328 -0.326921 6.33982 -0.0418461 6.33933L6.3481 6.34231L6.3481 -0.0506238C6.34659 -0.193451 6.3736 -0.335145 6.42756 -0.467396C6.48152 -0.599646 6.56134 -0.719794 6.66234 -0.820794C6.76334 -0.921794 6.88349 -1.00161 7.01574 -1.05557C7.14799 -1.10953 7.28969 -1.13655 7.43251 -1.13503L12.5827 -1.12308C12.8678 -1.12259 13.141 -1.00913 13.3426 -0.807549C13.5442 -0.60597 13.6577 -0.332713 13.6582 -0.047637L13.6552 6.34231L20.0481 6.34231C20.3325 6.34248 20.6052 6.45552 20.8063 6.65661C21.0074 6.8577 21.1204 7.13039 21.1206 7.41477L21.1325 12.565C21.1324 12.8494 21.0193 13.122 20.8182 13.3231C20.6171 13.5242 20.3444 13.6373 20.0601 13.6374L13.6552 13.6494L13.6641 20.0334C13.6636 20.3184 13.5502 20.5917 13.3486 20.7933C13.147 20.9948 12.8738 21.1083 12.5887 21.1088L7.43252 21.1267C7.28969 21.1282 7.148 21.1012 7.01575 21.0473C6.88349 20.9933 6.76335 20.9135 6.66235 20.8125C6.56135 20.7115 6.48153 20.5913 6.42757 20.4591C6.37361 20.3268 6.34659 20.1851 6.34811 20.0423Z"
                                fill="white"
                            />
                        </svg>
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
