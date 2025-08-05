import { defineStore } from 'pinia';

export const useAnalyticsStore = defineStore('analytics', {
    state: () => {
        return {
            // Engagement
            durationPerDay: [],
            avgTimeOnSkills: [],
            percentageStudentsMasteredOneSkill: [],
            // Academics
            tenantProgress: [],
            numSkillsPassedPerNumStudents: [],
            passedAssessments: [],
            failedAssessments: [],
            rootSubjectsFailedAssessments: [],
            rootSubjectsPassedAssessments: [],
            rootSubjectsAttemptedAssessments: [],
            attemptedAssessments: [],
            // Resources
            avgTokensToMasterSkills: [],
            totalTokensPerSkill: [],
            totalTokensPerDay: []
        };
    },
    actions: {}
});
