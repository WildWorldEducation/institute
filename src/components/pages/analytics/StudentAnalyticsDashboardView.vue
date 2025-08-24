<script>
export default {
    name: 'Dashboard',
    data() {
        return {
            showSidebar: true,
            screenWidth: screen.width
        };
    },
    methods: {
        toggleSidebar() {
            this.showSidebar = !this.showSidebar;
        }
    }
};
</script>

<template>
    <div class="dashboard">
        <!-- Sidebar -->
        <!-- dont show on mobile -->
        <div
            v-if="screenWidth > 768"
            class="sidebar"
            :class="{ hidden: !showSidebar }"
        >
            <!-- filters - student and / or school average -->
            <h1 class="h2">Who</h1>
            <p>
                <label class="control control-checkbox">
                    <input
                        type="checkbox"
                        value="true"
                        v-model="isAnotherInstanceOfExistingSkill"
                    />
                    You
                </label>
            </p>
            <p>
                <label class="control control-checkbox">
                    <input
                        type="checkbox"
                        value="true"
                        v-model="isAnotherInstanceOfExistingSkill"
                    />
                    School average
                </label>
            </p>

            <h1 class="h2">Subjects</h1>
            <ul>
                <li>
                    <label class="control control-checkbox">
                        <input
                            type="checkbox"
                            value="true"
                            v-model="isAnotherInstanceOfExistingSkill"
                        />
                        Language
                    </label>
                </li>
                <li>
                    <label class="control control-checkbox">
                        <input
                            type="checkbox"
                            value="true"
                            v-model="isAnotherInstanceOfExistingSkill"
                        />
                        Math
                    </label>
                </li>
                <li>
                    <label class="control control-checkbox">
                        <input
                            type="checkbox"
                            value="true"
                            v-model="isAnotherInstanceOfExistingSkill"
                        />
                        History
                    </label>
                </li>
                <li>
                    <label class="control control-checkbox">
                        <input
                            type="checkbox"
                            value="true"
                            v-model="isAnotherInstanceOfExistingSkill"
                        />
                        Life
                    </label>
                </li>
                <li>
                    <label class="control control-checkbox">
                        <input
                            type="checkbox"
                            value="true"
                            v-model="isAnotherInstanceOfExistingSkill"
                        />
                        Computer Science
                    </label>
                </li>
                <li>
                    <label class="control control-checkbox">
                        <input
                            type="checkbox"
                            value="true"
                            v-model="isAnotherInstanceOfExistingSkill"
                        />
                        Science & Invention
                    </label>
                </li>
                <li>
                    <label class="control control-checkbox">
                        <input
                            type="checkbox"
                            value="true"
                            v-model="isAnotherInstanceOfExistingSkill"
                        />
                        Dangerous Ideas
                    </label>
                </li>
            </ul>
        </div>

        <!-- Main Content -->
        <div class="main">
            <!-- <header class="header">
                <button class="btn primary-btn" @click="toggleSidebar">
                    {{ showSidebar ? 'Hide Sidebar' : 'Show Sidebar' }}
                </button>
                <h1>Dashboard</h1>
            </header> -->

            <div class="content container-fluid">
                <!-- This is where charts / dashboard cards go -->
                <div class="dash-row row">
                    <div class="col-md chart-container">1</div>
                    <div class="col-md chart-container">2</div>
                </div>
                <div class="dash-row row">
                    <div class="col-md chart-container">3</div>
                    <div class="col-md chart-container">4</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.dash-row {
    height: 50%;
}

.chart-container {
    border: 1px solid black;
}

.dashboard {
    display: flex;
    height: calc(100vh - 88px);
    font-family: sans-serif;
    overflow: hidden;
}

/* Sidebar */
.sidebar {
    width: 220px;
    background: #2c3e50;
    color: white;
    padding: 1rem;
    box-sizing: border-box;
    transition: width 0.3s ease, opacity 0.3s ease;
}

.sidebar.hidden {
    width: 0;
    opacity: 0;
    padding: 0;
    overflow: hidden;
}

.sidebar h2 {
    margin-top: 0;
}

.sidebar ul {
    list-style: none;
    padding: 0;
}

.sidebar li {
    margin: 0.5rem 0;
}

.sidebar a {
    color: white;
    text-decoration: none;
}

/* Main section */
.main {
    flex: 1;
    display: flex;
    flex-direction: column;
    transition: margin-left 0.3s ease;
}

.header {
    background: #f5f5f5;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.content {
    flex: 1;
    height: 100%;
}
</style>
