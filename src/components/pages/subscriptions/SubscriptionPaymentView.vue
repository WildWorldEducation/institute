<script>
export default {
    data() {
        return {
            form: {
                name: '',
                email: '',
                phone: '',
                donation: 0
            },
            message: '',
            stripe: null
        };
    },
    async mounted() {},
    methods: {
        submit() {
            fetch(
                'http://localhost:3000/subscriptions/create-checkout-session',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        items: [
                            { id: 1, quantity: 3 },
                            { id: 2, quantity: 1 }
                        ]
                    })
                }
            )
                .then((res) => {
                    if (res.ok) return res.json();
                    return res.json().then((json) => Promise.reject(json));
                })
                .then(({ url }) => {
                    window.location = url;
                })
                .catch((e) => {
                    console.error(e.error);
                });
        },

        async handleSubmit() {
            try {
                const response = await fetch(
                    '/subscriptions/create-checkout-session',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ donation: this.form.donation })
                    }
                );
                const session = await response.json();
                const { error } = await this.stripe.redirectToCheckout({
                    sessionId: session.id
                });
                if (error) {
                    this.message = error.message;
                }
            } catch (error) {
                this.message = error.message;
            }
        }
    },
    computed: {}
};
</script>

<template>
    <button @click="submit()">Checkout</button>
    <!-- <div class="form-container">
        <form @submit.prevent="handleSubmit">
            <h1 class="heading">Buy Tokens</h1>
            <div class="form-group">
                <label for="name">Name:</label>
                <input type="text" id="name" v-model="form.name" required />
            </div>
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" v-model="form.email" required />
            </div>
            <div class="form-group">
                <label for="phone">Phone Number:</label>
                <input type="text" id="phone" v-model="form.phone" required />
            </div>
            <div class="form-group">
                <label for="donation">Donation:</label>
                <input
                    type="number"
                    id="donation"
                    v-model="form.donation"
                    required
                />
            </div>
            <button class="btn primary-btn" type="submit">Submit</button>
        </form>
        <div v-if="message" class="message">
            <p>{{ message }}</p>
        </div>
    </div> -->
</template>
<style scoped>
.form-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-container h2 {
    text-align: center;
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
}

.form-group input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.submit-button {
    display: block;
    width: 100%;
    padding: 10px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

.submit-button:hover {
    background-color: #45a049;
}

.message {
    text-align: center;
    margin-top: 20px;
    font-size: 18px;
}
</style>
