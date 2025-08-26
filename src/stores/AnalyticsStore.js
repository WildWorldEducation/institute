import { defineStore } from 'pinia';
import { useUserSkillsStore } from './UserSkillsStore.js';

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
            // Dashboard
            progress: {
                student: [],
                tenant: []
            },
            // Other
            studentDurationsPerDay: [],
            studentSkillDurations: [],
            studentTokensPerSkills: [],
            studentAssessmentPasses: [],
            studentAssessmentAttempts: [],
            studentRootSubjectsFailedAssessments: [],
            studentRootSubjectsPassedAssessments: [],
            studentRootSubjectsAttemptedAssessments: [],
            // Cohort/Class/Teacher level
            cohortSkillActivities: [],
            cohortRootSubjectsFailedAssessments: [],
            cohortRootSubjectsPassedAssessments: [],
            cohortRootSubjectsAttemptedAssessments: []
        };
    },
    actions: {
        // Student
        async getStudentProgress(studentId, tenantId) {
            await fetch(
                `/student-analytics/student-progress/${tenantId}/${studentId}`
            )
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.studentProgress.length; i++) {
                        data.studentProgress[i].date = new Date(
                            data.studentProgress[i].date
                        );
                    }
                    data.studentProgress.sort((a, b) => a.date - b.date);
                    this.progress.student = data.studentProgress;

                    for (let i = 0; i < data.tenantAvgProgress.length; i++) {
                        data.tenantAvgProgress[i].date = new Date(
                            data.tenantAvgProgress[i].date
                        );
                    }
                    data.tenantAvgProgress.sort((a, b) => a.date - b.date);
                    this.progress.tenant = data.tenantAvgProgress;
                })
                .catch((error) => {
                    console.error('Error fetching student progress:', error);
                });
        },
        async getStudentDurationPerDay(studentId) {
            fetch(`/student-analytics/student-duration-per-day/${studentId}`)
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].formattedQuantity = data[i].quantity / 1000;
                        data[i].date = new Date(data[i].date);
                    }
                    data.sort((a, b) => a.date - b.date);
                    this.studentDurationsPerDay = data;
                })
                .catch((error) => {
                    console.error(
                        'Error fetching student duration per day:',
                        error
                    );
                });
        },
        async getStudentSkillDurations(studentId) {
            fetch(`/student-analytics/skill-durations/${studentId}`)
                .then((response) => response.json())
                .then((data) => {
                    this.studentSkillDurations = data;
                    for (
                        let i = 0;
                        i < this.studentSkillDurations.length;
                        i++
                    ) {
                        this.studentSkillDurations[i].formattedQuantity =
                            this.millisToMinutesAndSeconds(
                                this.studentSkillDurations[i].quantity
                            );
                    }
                })
                .catch((error) => {
                    console.error('Error fetching last visited skills:', error);
                });
        },
        async getAvgTokensToMasterSkills(studentId) {
            try {
                const response = await fetch(
                    `/student-analytics/avg-tokens-to-master-skills/student/${studentId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                this.studentTokensPerSkills = Array.isArray(data) ? data : [];
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.studentTokensPerSkills = [];
            }
        },
        async getStudentAssessmentPasses(studentId) {
            const userSkillsStore = useUserSkillsStore();
            await userSkillsStore.getMasteredSkills(studentId);
            this.studentAssessmentPasses = userSkillsStore.masteredSkills.map(
                (e) => {
                    return {
                        ...e,
                        url: `/skills/${e.url}`,
                        // labelName: `${e.rootParent} - ${e.name}`
                        labelName: `${e.name}`
                    };
                }
            );
        },
        async getStudentAssessmentAttempts(studentId) {
            fetch(
                `/student-analytics/started-unmastered-assessments/${studentId}`
            )
                .then((response) => response.json())
                .then((data) => {
                    this.studentAssessmentAttempts = data.map((e) => {
                        return {
                            ...e,
                            url: `/skills/${e.url}`,
                            // labelName: `${e.rootParent} - ${e.name}`
                            labelName: `${e.name}`
                        };
                    });
                })
                .catch((error) => {
                    console.error('Error fetching last visited skills:', error);
                });
        },
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
                this.cohortSkillActivities = this.cohortSkillActivities.map(
                    (skill) => {
                        return {
                            ...skill,
                            formattedQuantity: this.millisToMinutesAndSeconds(
                                skill.quantity
                            )
                        };
                    }
                );
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
        async getTeacherClassPassedAssessmentsBySubject(instructorId) {
            try {
                const response = await fetch(
                    `/student-analytics/passed-assessments-by-subject/instructor/${instructorId}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.cohortRootSubjectsPassedAssessments =
                    await response.json();
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.cohortRootSubjectsPassedAssessments = [];
            }
        },
        async getTeacherClassAttemptedAssessmentsBySubject(instructorId) {
            try {
                const response = await fetch(
                    `/student-analytics/attempted-assessments-by-subject/instructor/${instructorId}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.cohortRootSubjectsAttemptedAssessments =
                    await response.json();
            } catch (error) {
                console.error(
                    'Error fetching cohort attempted assessments:',
                    error
                );
                this.cohortRootSubjectsAttemptedAssessments = [];
            }
        },
        // School
        async getSchoolProgress(tenantId) {
            await fetch(`/student-analytics/school-progress/${tenantId}`)
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].date = new Date(data[i].date);
                    }
                    data.sort((a, b) => a.date - b.date);
                    this.progress.tenant = data;
                })
                .catch((error) => {
                    console.error('Error fetching student progress:', error);
                });
        },
        millisToMinutesAndSeconds(millis) {
            var minutes = Math.floor(millis / 60000);
            var seconds = ((millis % 60000) / 1000).toFixed(0);
            return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        }
    }
});
