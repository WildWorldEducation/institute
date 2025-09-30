<script>
export default {
    props: ['dataList'],
    components: {},
    data() {
        return {
            showDropDown: false
        };
    },
    methods: {}
};
</script>

<template>
    <div class="d-flex flex-column position-relative">
        <div
            class="dropdown-base d-flex justify-content-between align-items-center"
            @click="showDropDown = !showDropDown"
        >
            Place holder first things
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 640 640"
                :class="{
                    'arrow-open': !showDropDown,
                    'arrow-close': showDropDown
                }"
            >
                <path
                    d="M297.4 470.6C309.9 483.1 330.2 483.1 342.7 470.6L534.7 278.6C547.2 266.1 547.2 245.8 534.7 233.3C522.2 220.8 501.9 220.8 489.4 233.3L320 402.7L150.6 233.4C138.1 220.9 117.8 220.9 105.3 233.4C92.8 245.9 92.8 266.2 105.3 278.7L297.3 470.7z"
                />
            </svg>
        </div>
        <div class="position-relative">
            <div v-if="showDropDown" class="drop-down-list">
                <div>item 1</div>
                <div>item 2</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.dropdown-base {
    display: block;
    width: 100%;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #212529;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border-radius: 0.375rem;
}

.drop-down-list {
    position: absolute;
    top: 2px;
    width: 100%;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #212529;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border-radius: 0.375rem;
}

.arrow-open {
    transition: transform 0.3s ease-in-out; /* Smooth transition over 0.3s */
    transform: rotate(0deg); /* Rotates 180 degrees clockwise */
}

.arrow-close {
    transition: transform 0.3s ease-in-out; /* Smooth transition over 0.3s */
    transform: rotate(-180deg); /* Rotates 180 degrees clockwise */
}
</style>
