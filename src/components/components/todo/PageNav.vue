<script>
export default {
    setup() {},
    data() {
        return {
            showNavBar: true
        };
    },
    props: ['activeContent', 'contentHeight'],
    methods: {
        changeActiveContent(content) {
            this.$parent.activeContent = content;
        }
    }
};
</script>

<template>
    <Transition name="navbar">
        <div v-if="showNavBar" class="nav-bar-container d-flex flex-column">
            <div class="d-flex justify-content-between pe-4">
                <div class="todo-tile ps-2 pt-2">Todo List</div>
                <div
                    class="icon-div d-flex align-items-center px-3 py-2"
                    @click="showNavBar = false"
                    b-on-hover
                    title="Shrink Nav Bar"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                        width="20"
                        heigh="20"
                        fill="#8666ca"
                    >
                        <path
                            d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"
                        />
                    </svg>
                </div>
            </div>
            <hr />
            <div
                :class="[
                    activeContent === 'editList'
                        ? 'active-item'
                        : 'nav-bar-item'
                ]"
                @click="changeActiveContent('editList')"
            >
                Approval Edit Content
            </div>
            <div
                :class="[
                    activeContent === 'studentQuestionList'
                        ? 'active-item'
                        : 'nav-bar-item'
                ]"
                @click="changeActiveContent('studentQuestionList')"
            >
                Approval Student Question Suggestion
            </div>
            <div
                :class="[
                    activeContent === 'flagList'
                        ? 'active-item'
                        : 'nav-bar-item'
                ]"
                @click="changeActiveContent('flagList')"
            >
                Checking Content Flag
            </div>
        </div>
    </Transition>
    <Transition name="navbarMini">
        <div
            v-if="!showNavBar"
            class="position-relative minimize-navbar"
            @click="showNavBar = true"
        >
            <div class="nav-col group"></div>
            <div
                class="expand-icon-div group"
                b-on-hover
                title="Expand Nav Bar"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    width="12"
                    heigh="12"
                    fill="#8666ca"
                >
                    <path
                        d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
                    />
                </svg>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.nav-bar-container {
    height: 100%;
    background-color: #e8e2f9;
}
.todo-tile {
    font-size: 30px;
    font-weight: 600;
    color: #8666ca;
}

.icon-div {
    cursor: pointer;
}

.icon-div:hover {
    border-radius: 12;
    background-color: #d8d6dd;
}

.nav-bar-item {
    cursor: pointer;
    padding: 5px 10px;
}

.nav-bar-item:hover {
    background-color: #c0b3db;
    color: white;
}

.active-item {
    background-color: #a083da;
    padding: 5px 10px;
    color: white;
}

/* Navbar slide Animation */

@keyframes slide {
    0% {
        transform: scaleX(0);
    }

    100% {
        transform: scaleX(1);
    }
}

.navbar-enter-active {
    transform-origin: left center;
    animation: slide 0.2s;
}
.navbar-leave-active {
    transform-origin: left center;
    animation: slide 0.2s reverse;
}

.navbarMini-enter-active {
    transform-origin: left center;
    animation: slide 0.2s;
}
.navbarMini-leave-active {
    transform-origin: left center;
    animation: slide 0.2s reverse;
}
/* --| End of nav bar slide Animation | -- */

.nav-col {
    width: 20px;
    height: 100%;
    background-color: #e8e2f9;
    border-right: solid 1px #9f9da1;
}

.expand-icon-div {
    position: absolute;
    top: 2%;
    right: -17px;
    border-radius: 50px;
    background-color: #e8e2f9;
    border: 2px solid #9f9da1;
    padding: 2px 7px;
}

.minimize-navbar:hover .group {
    cursor: pointer;
    background-color: #bbb9c0;
}

/* View Specific On Phone */
@media (min-width: 0px) and (max-width: 576px) {
    .nav-bar-container {
        min-width: 300px;
    }

    .nav-col {
        width: 8px;
        border-right: solid 1px #9f9da1;
    }

    .expand-icon-div:hover {
        cursor: pointer;
        background-color: #cecbd6;
    }
}
</style>
