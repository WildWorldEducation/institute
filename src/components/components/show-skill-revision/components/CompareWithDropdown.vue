<script>
export default {
    data() {
        return {
            compareWithVersion: 'none',
            showDropDown: false
        };
    },
    props: ['skillRevisionHistory']
};
</script>

<template>
    <!-- Custom Dropdown -->
    <div class="position-relative mb-4">
        <div
            class="d-flex flex-column compare-dropdown-div"
            :class="[, showDropDown ? 'button-focus' : 'button-unfocus']"
        >
            <button @click="showDropDown = !showDropDown" class="dropdown-btn">
                <div>Compare With: {{ compareWithVersion }}</div>

                <svg
                    :class="{
                        'expand-arrow': showDropDown,
                        'minimize-arrow': !showDropDown
                    }"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M14.2929 8.70711C14.9229 8.07714 14.4767 7 13.5858 7H6.41421C5.52331 7 5.07714 8.07714 5.70711 8.70711L9.29289 12.2929C9.68342 12.6834 10.3166 12.6834 10.7071 12.2929L14.2929 8.70711Z"
                        fill="#344054"
                    />
                </svg>
            </button>

            <Transition name="dropdown">
                <div v-if="showDropDown" class="history-versions-dropdown">
                    <div
                        v-for="revision in skillRevisionHistory"
                        class="revision-row"
                    >
                        Version: {{ revision.version_number }}, Edit Date:
                        {{ revision.edited_date }} By
                        {{ revision.user_name }}
                    </div>
                    <div>None</div>
                </div>
            </Transition>
        </div>
    </div>

    <!-- End of custom dropdown -->
</template>

<style scoped>
.compare-dropdown-div {
    width: 70%;
    position: absolute;
    top: 0px;
    left: 0px;
    background-color: white;
    border: 1px solid #aca4cc;
    border-radius: 5px;
    padding: 10px;
}

.dropdown-btn {
    border: none;
    background-color: inherit;
    display: flex;
    justify-content: space-between;
    outline: none;
    color: inherit;
    font-weight: inherit;
    text-align: start;
}

.history-versions-dropdown {
    border-radius: 5px;
    background-color: white;
    padding: 10px;
    width: 100%;
}

.compare-dropdown-btn:focus {
    border: 1px solid #7e59cf;
    border-radius: 8px;
}

.expand-arrow {
    animation: rotation 0.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
    cursor: pointer;
}

.minimize-arrow {
    animation: rotationBack 0.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
    cursor: pointer;
}

/* The animation key frame */
@keyframes rotation {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(180deg);
    }
}

@keyframes rotationBack {
    from {
        transform: rotate(180deg);
    }

    to {
        transform: rotate(0deg);
    }
}
</style>
