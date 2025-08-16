import { defineStore } from 'pinia';

export const useTenantStore = defineStore('tenant', {
    state: () => ({
        tokens: null,
        monthlyTokenUsage: 0,
        billingMode: null
    }),
    actions: {
        async getTenantDetails(tenantId) {
            const result = await fetch('/tenants/show/' + tenantId);
            const data = await result.json();
            this.tokens = data.tokens;
            this.billingMode = data.billing_mode;
        },
        async getTenantMonthlyTokenUsage(tenantId) {
            const result = await fetch(
                '/tenants/monthly-token-usage/' + tenantId
            );
            const data = await result.json();
            this.monthlyTokenUsage = data;
        },
        async toggleBillingMode(tenantId) {
            try {
                if (this.billingMode == 'student') {
                    this.billingMode = 'school';                   
                } else {
                    this.billingMode = 'student';
                }

                const reqOptions = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        billing_mode: this.billingMode
                    })
                };
                await fetch(`/tenants/${tenantId}/edit`, reqOptions);
            } catch (error) {
                console.error('Error updating instructor:', error);
            }
        },
        updateTokens() {}
    }
});
