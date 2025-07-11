import { defineStore } from 'pinia';

export const useTeacherAnalyticsStore = defineStore('teacherAnalytics', {
    state: () => {
        return {
            studentMultipleFails: []
        };
    },
    actions: {
        async getStudentMultipleFails(studentId) {
            fetch(`/student-analytics/multiple-fails/${studentId}`)
                .then((response) => response.json())
                .then((data) => {
                    this.studentMultipleFails = data;
                })
                .catch((error) => {
                    console.error('Error fetching last visited skills:', error);
                });
        }
    }
});
