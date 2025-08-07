import { defineStore } from 'pinia';

export const useAnalyticsStore = defineStore('analytics', {
    state: () => {
        return {
            // School level --------------------------
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
            totalTokensPerDay: [],
            // Student level --------------------------
            studentRootSubjectsFailedAssessments: [],
            studentRootSubjectsPassedAssessments: [],
            studentRootSubjectsAttemptedAssessments: [],
        };
    },
    actions: {
        async getStudentFailedAssessmentsBySubject(studentId) {
            try {
                const response = await fetch(
                    `/student-analytics/failed-assessments-by-subject/student/${studentId}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.studentRootSubjectsFailedAssessments =
                    await response.json();
            } catch (error) {
                console.error(
                    'Error fetching student mastered assessments:',
                    error
                );
                this.studentRootSubjectsFailedAssessments = [];
            }
        },
        async getStudentPassedAssessmentsBySubject(studentId) {
            try {
                const response = await fetch(
                    `/student-analytics/passed-assessments-by-subject/student/${studentId}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.studentRootSubjectsPassedAssessments =
                    await response.json();
            } catch (error) {
                console.error(
                    'Error fetching student mastered assessments:',
                    error
                );
                this.studentRootSubjectsPassedAssessments = [];
            }
        },
        async getStudentAttemptedAssessmentsBySubject(studentId) {
            try {
                const response = await fetch(
                    `/student-analytics/attempted-assessments-by-subject/student/${studentId}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.studentRootSubjectsAttemptedAssessments =
                    await response.json();
            } catch (error) {
                console.error(
                    'Error fetching student mastered assessments:',
                    error
                );
                this.studentRootSubjectsAttemptedAssessments = [];
            }
        },
    }
});
