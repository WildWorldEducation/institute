<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();

        return {
            userDetailsStore
        };
    },
    data() {
        return {
            showNavBar: true,
            todoCount: null,
            contentEditCount: 0,
            studentQuestionCount: 0,
            contentFlagCount: 0,
            newSkillApproveCount: 0
        };
    },
    props: ['activeContent'],
    methods: {
        changeActiveContent(content) {
            this.$parent.activeContent = content;
            this.$router.push({ query: { nav: content } });
        }
    },
    async mounted() {
        // Getting the count of all todo actions
        const resData = await fetch('/todo-count/total');
        const resJson = await resData.json();
        this.todoCount = resJson;
        this.studentQuestionCount = this.todoCount.student_question_count;
        this.contentFlagCount = this.todoCount.content_flag_count;
        this.contentEditCount =
            parseInt(this.todoCount.skill_edit_count) +
            parseInt(this.todoCount.mc_question_edit_count) +
            parseInt(this.todoCount.essay_question_edit_count) +
            parseInt(this.todoCount.image_question_edit_count);

        if (this.todoCount.new_skill_add_count) {
            this.newSkillApproveCount = this.todoCount.new_skill_add_count;
        }
    }
};
</script>

<template>
    <Transition name="navbar">
        <div v-if="showNavBar" class="nav-bar-container d-flex flex-column">
            <div class="d-flex justify-content-between pe-4">
                <h1 class="todo-heading ms-2 pt-2">Todo List</h1>
                <!-- Open/close side panel button -->
                <button
                    type="button"
                    class="icon-div d-flex align-items-center px-3 py-2"
                    @click="showNavBar = false"
                    b-on-hover
                    title="Shrink Nav Bar"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                        width="20"
                        height="20"
                        class="primary-icon"
                    >
                        <path
                            d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"
                        />
                    </svg>
                </button>
            </div>
            <hr />
            <div class="d-flex flex-column gap-3 h-100">
                <button
                    :class="{ 'active-item': activeContent === 'editList' }"
                    class="nav-button p-2"
                    @click="changeActiveContent('editList')"
                >
                    <h2 class="nav-button-heading h5">Approve Content Edits</h2>
                    <span
                        class="badge bg-danger"
                        b-on-hover
                        title="number of content edits that needed to approved"
                        >{{ contentEditCount }}</span
                    >
                </button>
                <button
                    :class="{
                        'active-item': activeContent === 'studentQuestionList'
                    }"
                    class="nav-button p-2"
                    @click="changeActiveContent('studentQuestionList')"
                >
                    <h2 class="nav-button-heading h5">
                        Approve Student Added Questions
                    </h2>
                    <span
                        b-on-hover
                        title="number of student questions that needed to approved"
                        class="badge bg-danger"
                        >{{ studentQuestionCount }}</span
                    >
                </button>
                <button
                    :class="{
                        'active-item': activeContent === 'flagList'
                    }"
                    class="nav-button p-2"
                    @click="changeActiveContent('flagList')"
                >
                    <h2 class="nav-button-heading h5">Check Content Flags</h2>
                    <span
                        class="badge bg-danger"
                        b-on-hover
                        title="number of content flags that needed to checked"
                        >{{ contentFlagCount }}</span
                    >
                </button>
                <button
                    v-if="
                        (userDetailsStore.userName == '' ||
                            userDetailsStore.role == 'admin') &&
                        todoCount?.new_skill_add_count
                    "
                    :class="{
                        'active-item': activeContent === 'newSkillsList'
                    }"
                    class="nav-button p-2"
                    @click="changeActiveContent('newSkillsList')"
                >
                    <h2 class="nav-button-heading h5">Approve New Skills</h2>
                    <span
                        b-on-hover
                        title="number of student suggested questions that needed to approved"
                        class="badge bg-danger"
                        >{{ newSkillApproveCount }}</span
                    >
                </button>
            </div>
        </div>
    </Transition>
    <Transition name="navbarMini">
        <button
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
                    class="icon"
                >
                    <path
                        d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
                    />
                </svg>
            </div>
        </button>
    </Transition>
</template>

<style scoped>
.todo-heading {
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
}

/* Sidebar */
.nav-bar-container {
    background-color: #e8e2f9;
}

.nav-button {
    font-size: 18px;
    border: none;
    text-align: start;
    background-color: inherit;
    color: var(--primary-color);
}

.nav-button:hover {
    color: var(--primary-contrast-color);
    background-color: var(--primary-color);
}

.nav-button:focus {
    background-color: var(--primary-color);
    border: none;
}

.nav-button-heading {
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
}

.badge {
    font-weight: 400;
}

.icon-div {
    cursor: pointer;
    border: none;
    background-color: inherit;
}

.icon-div:hover {
    border-radius: 12;
    background-color: #d8d6dd;
}

.icon-div:focus {
    outline-color: var(--primary-color);
}

.active-item {
    background-color: var(--primary-color);
    color: white;
}

.active-item:focus {
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
    border-right: solid 1px var(--primary-color);
    outline: none;
}

.nav-col:focus {
    outline: var(--primary-color);
}

.expand-icon-div {
    position: absolute;
    top: 2%;
    right: -17px;
    border-radius: 50px;
    background-color: #e8e2f9;
    border: 2px solid var(--primary-color);
    padding: 2px 7px;
    z-index: 20;
}

.minimize-navbar {
    outline: none;
    border: none;
    background-color: inherit;
    padding: 0px;
}

.minimize-navbar:hover:focus .group {
    cursor: pointer;
    background-color: #e9e8ec;
    outline: none;
}

/* View Specific On Phone */
@media (min-width: 0px) and (max-width: 576px) {
    .nav-bar-container {
        min-width: 300px;
    }

    .nav-col {
        width: 8px;
        border-right: solid 1px var(--primary-color);
    }

    .expand-icon-div:hover {
        cursor: pointer;
        background-color: var(--primary-color);
    }
}
</style>
