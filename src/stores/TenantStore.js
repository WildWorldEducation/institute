import { defineStore } from 'pinia';

export const useTenantStore = defineStore('tenant', {
    state: () => ({
        tokens: null,
        monthlyTokenUsage: 0,
        canStudentsAccessBilling: null
    }),
    actions: {
        async getTenantDetails(tenantId) {
            const result = await fetch('/tenants/show/' + tenantId);
            const data = await result.json();
            this.tokens = data.tokens;
            this.canStudentsAccessBilling = data.can_students_access_billing;
        },
        async getTenantMonthlyTokenUsage(tenantId) {
            const result = await fetch('/tenants/monthly-token-usage/' + tenantId);
            const data = await result.json();
            this.monthlyTokenUsage = data;            
        },
        updateTokens() {

        }
    }
});
