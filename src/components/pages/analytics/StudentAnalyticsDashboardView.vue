<template>
    <div class="dashboard">
        <!-- Sidebar -->
        <div class="sidebar" :class="{ hidden: !showSidebar }">
            <h2>Sidebar</h2>
            <ul>
                <li><a href="#">Menu Item 1</a></li>
                <li><a href="#">Menu Item 2</a></li>
                <li><a href="#">Menu Item 3</a></li>
            </ul>
        </div>

        <!-- Main Content -->
        <div class="main">
            <header class="header">
                <button @click="toggleSidebar">
                    {{ showSidebar ? 'Hide Sidebar' : 'Show Sidebar' }}
                </button>
                <h1>Dashboard</h1>
            </header>

            <div class="content">
                <!-- This is where charts / dashboard cards go -->
                <p>Empty dashboard. Add your charts here!</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Dashboard',
    data() {
        return {
            showSidebar: true
        };
    },
    methods: {
        toggleSidebar() {
            this.showSidebar = !this.showSidebar;
        }
    }
};
</script>

<style scoped>
.dashboard {
    display: flex;
    height: 100vh;
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
    padding: 1rem;
}
</style>
