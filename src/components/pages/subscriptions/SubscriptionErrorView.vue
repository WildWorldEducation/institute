<script>
export default {
    name: 'Error'
};
</script>

<template>
    <div class="error-container">
        <h1>Payment Error</h1>
        <p>There was an issue with your payment. Please try again.</p>
    </div>
</template>

<style scoped>
.error-container {
    text-align: center;
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
    border: 1px solid #f44336;
    border-radius: 8px;
    background-color: #ffebee;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error-container h1 {
    color: #f44336;
    margin-bottom: 20px;
}

.error-container p {
    font-size: 18px;
    color: #555;
}
</style>
