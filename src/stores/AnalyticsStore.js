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
            // Cohort/Class/Teacher level
            cohortSkillActivities: [],
            cohortRootSubjectsFailedAssessments: []
        };
    },
    actions: {
        // Student
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
        // Cohort
        async getTeacherClassSkillActivityReport(instructorId) {         
            try {
                const response = await fetch(
                    `/student-analytics/all-student-cohort-activity/instructor/${instructorId}`
                );
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                this.cohortSkillActivities = await response.json();
            } catch (error) {
                console.error('Error fetching skill activity report:', error);
            }
        },
        async getTeacherClassFailedAssessmentsBySubject(instructorId) {
            try {
                const response = await fetch(
                    `/student-analytics/failed-assessments-by-subject/instructor/${instructorId}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.cohortRootSubjectsFailedAssessments =
                    await response.json();
            } catch (error) {
                console.error(
                    'Error fetching student mastered assessments:',
                    error
                );
                this.cohortRootSubjectsFailedAssessments = [];
            }
        },
    }
});
