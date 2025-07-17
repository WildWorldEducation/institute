import { defineStore } from 'pinia';

export const useTeacherAnalyticsStore = defineStore('teacherAnalytics', {
    state: () => {
        return {
            studentMultipleFails: [],
            skillActivities: [],
            isLowActivity: false
        };
    },
    actions: {
        async getStudentMultipleFails(studentId) {
            await fetch(`/student-analytics/multiple-fails/${studentId}`)
                .then((response) => response.json())
                .then((data) => {
                    this.studentMultipleFails = data;
                })
                .catch((error) => {
                    console.error('Error fetching last visited skills:', error);
                });
        },
        async getSkillActivityReport(studentId) {
            await fetch(`/student-analytics/skill-activity-report/${studentId}`)
                .then((response) => response.json())
                .then((data) => {
                    this.skillActivities = data;
                })
                .catch((error) => {
                    console.error('Error fetching skill activities:', error);
                });
        }
    }
});
