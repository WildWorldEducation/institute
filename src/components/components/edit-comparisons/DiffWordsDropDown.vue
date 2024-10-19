<script>
export default {
    setup() {},
    data() {
        return {
            wordsArray: [],
            showDetails: false
        };
    },
    props: ['diffObj', 'type'],
    computed: {},
    mounted() {},
    methods: {},
    computed: {
        diffWords() {
            if (!this.diffObj) {
                return [];
            }

            let results = [];

            this.diffObj.forEach((element) => {
                if (this.type === 'add') {
                    console.log(element);
                    if (element.added && !element.removed) {
                        results.push(element.value);
                    }
                }
                if (this.type === 'remove') {
                    if (!element.added && element.removed) {
                        results.push(element.value);
                    }
                }
            });

            return results;
        }
    }
};
</script>

<template>
    <div v-if="diffObj" class="dropdown-container">
        <div class="triangle-container">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 320 512"
                width="14"
                height="14"
                @click="showDetails = !showDetails"
                class="triangle-icon"
                :class="{
                    'expand-arrow': showDetails,
                    'minimize-arrow': !showDetails,
                    fillRed: type === 'remove' ? true : false,
                    fillGreen: type === 'add' ? true : false
                }"
            >
                <path
                    d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8l256 0c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"
                />
            </svg>
        </div>

        <div class="position-relative">
            <div v-if="showDetails" class="details-div">
                <div
                    v-for="word in diffWords"
                    :class="{
                        'add-details': type === 'add',
                        'remove-details': type == 'remove'
                    }"
                >
                    {{ word }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.dropdown-container {
    display: flex;
    align-items: end;
    height: fit-content;
    padding-top: 7px;
}

.fillRed {
    fill: #7f1d1d;
}

.fillGreen {
    fill: green;
}

.details-div {
    position: absolute;
    top: 5px;
    right: 5px;
    z-index: 100;
    width: 300px;
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    background-color: white;
    box-shadow: 3px 3px 3px rgb(36, 36, 36);
    border: 1px solid #1e293b;
    border-radius: 5px;
    padding: 5px 10px;
}

.add-details {
    background-color: #bbf7d0;
    border-radius: 5px;
    color: #052e16;
    padding: 5px;
}

.remove-details {
    background-color: #fecaca;
    border-radius: 5px;
    color: #7f1d1d;
    padding: 5px;
}

.triangle-container {
    display: flex;
    justify-content: start;
    align-items: end;
}

.triangle-icon {
    display: block;
    transition: all 0.9s ease;
}

/* ANIMATION PARTS */
.expand-arrow {
    transition: all 0.9s ease;
    transform: rotateZ(-180deg);
}

.minimize-arrow {
    transition: all 0.9s ease;
    transform: rotateZ(180deg);
}

@keyframes slide {
    0% {
        opacity: 0;
        transform: scaleX(0);
    }

    100% {
        opacity: 1;
        transform: scaleX(1);
    }
}

.expand-enter-active {
    transform-origin: right center;
    animation: slide 1s;
}
.expand-leave-active {
    transform-origin: right center;
    animation: slide 1s reverse;
}

/* Specific phone view css */
@media (max-width: 576px) {
    .words-add-div {
        width: 190px;
    }

    .words-removed-div {
        width: 190px;
    }
}
</style>
