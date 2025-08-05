<script>
import { useUsersStore } from '../../../../../stores/UsersStore';
import { useUserSkillsStore } from '../../../../../stores/UserSkillsStore';
import { useTeacherAnalyticsStore } from '../../../../../stores/TeacherAnalyticsStore';
import PassedAssessmentsTimelineChart from '../../../../components/teacher-analytics/students/PassedAssessmentsTimelineChart.vue';
import AttemptedAssessmentsTimelineChart from '../../../../components/teacher-analytics/students/AttemptedAssessmentsTimelineChart.vue';
import FailedAssessmentsHorizontalBarChart from '../../../../components/teacher-analytics/students/FailedAssessmentsHorizontalBarChart.vue';

export default {
    setup() {
        const usersStore = useUsersStore();
        const userSkillsStore = useUserSkillsStore();
        const teacherAnalyticsStore = useTeacherAnalyticsStore();
        return {
            usersStore,
            userSkillsStore,
            teacherAnalyticsStore
        };
    },
    components: {
        FailedAssessmentsHorizontalBarChart,
        PassedAssessmentsTimelineChart,
        AttemptedAssessmentsTimelineChart
    },
    data() {
        return {
            studentId: this.$route.params.studentId,
            studentName: null,
            assessmentPasses: [],
            assessmentAttempts: [],
            multipleFails: [],
            allSkillLevels: [
                {
                    level: 'grade_school',
                    color: '#116b62',
                    label: 'Grade School'
                },
                {
                    level: 'middle_school',
                    color: '#168216',
                    label: 'Middle School'
                },
                {
                    level: 'high_school',
                    color: '#7d6a02',
                    label: 'High School'
                },
                { level: 'college', color: '#ffa500', label: 'College' },
                { level: 'phd', color: '#9e0000', label: 'PhD' }
            ]
        };
    },
    computed: {
        hasTimelineData() {
            return (
                this.assessmentPasses.length > 0 ||
                this.assessmentAttempts.length > 0
            );
        },
        skillLevelsWithStatus() {
            if (!this.hasTimelineData) return [];

            // Combine data from both passed and attempted assessments
            const allTimelineData = [
                ...this.assessmentPasses,
                ...this.assessmentAttempts
            ];
            const levelsInData = new Set(
                allTimelineData.map((item) => item.level)
            );

            return this.allSkillLevels.map((skillLevel) => ({
                ...skillLevel,
                isPresent: levelsInData.has(skillLevel.level)
            }));
        }
    },
    async created() {
        // Get student name
        if (this.usersStore.users.length < 1) await this.usersStore.getUsers();
        const foundObject = this.usersStore.users.find(
            (student) => student.id === this.studentId
        );
        if (foundObject) {
            this.studentName = foundObject.username;
        }

        await this.getUserSkillMasteredHistory(this.studentId);
        await this.getAssessmentAttempts();

        if (this.teacherAnalyticsStore.studentMultipleFails.length == 0) {
            await this.teacherAnalyticsStore.getStudentMultipleFails(
                this.studentId
            );
        }

        this.isLoaded = true;
    },
    methods: {
        async getAssessmentAttempts() {
            fetch(
                `/student-analytics/started-unmastered-assessments/${this.studentId}`
            )
                .then((response) => response.json())
                .then((data) => {
                    this.assessmentAttempts = data.map((e) => {
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
        assessmentDate(date) {
            let jsDate = new Date(date);
            return jsDate.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        },
        async getUserSkillMasteredHistory(studentId) {
            await this.userSkillsStore.getMasteredSkills(studentId);

            this.assessmentPasses = this.userSkillsStore.masteredSkills.map(
                (e) => {
                    return {
                        ...e,
                        url: `/skills/${e.url}`,
                        // labelName: `${e.rootParent} - ${e.name}`
                        labelName: `${e.name}`
                    };
                }
            );
        }
    }
};
</script>

<template>
    <div class="container">
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading">Assessment Status Report</h1>
            <h2 class="secondary-heading h3">{{ studentName }}</h2>
        </span>

        <!-- Failed Assessments Section -->
        <h4 class="secondary-heading">Failed multiple times</h4>
        <FailedAssessmentsHorizontalBarChart
            v-if="teacherAnalyticsStore.studentMultipleFails.length > 0"
            :data="teacherAnalyticsStore.studentMultipleFails"
            colour="darkred"
            class="mb-5"
        />
        <p v-else>
            This student has not failed any assessments more than once yet.
        </p>

        <!-- Colour Legend for Timeline Charts -->
        <div v-if="hasTimelineData" class="color-legend mb-4">
            <strong class="legend-title">Colour Legend:</strong>
            <span
                v-for="skillLevel in skillLevelsWithStatus"
                :key="skillLevel.level"
                class="legend-item"
                :class="{ 'legend-item--faded': !skillLevel.isPresent }"
            >
                <span
                    class="color-dot"
                    :style="{ backgroundColor: skillLevel.color }"
                ></span>
                {{ skillLevel.label }}
            </span>
        </div>

        <!-- Passed Assessments Section -->
        <h4 class="secondary-heading">Passed</h4>
        <PassedAssessmentsTimelineChart
            class="mb-5"
            v-if="assessmentPasses.length > 0"
            :data="assessmentPasses"
        />
        <p v-else>This student has not completed any assessments yet.</p>

        <!-- Attempted Assessments Section -->
        <h4 class="secondary-heading">Attempted</h4>
        <AttemptedAssessmentsTimelineChart
            class="mb-5"
            v-if="assessmentAttempts.length > 0"
            :data="assessmentAttempts"
        />
        <p v-else>This student has not attempted any assessments yet.</p>
    </div>
</template>

<style>
/* Simple Color Legend Styles */
.color-legend {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
    margin-bottom: 1.5rem;
    line-height: 1.6;
}

.legend-title {
    margin-right: 1rem;
}

.legend-item {
    display: inline-flex;
    align-items: center;
    margin-right: 1.25rem;
    margin-bottom: 0.5rem;
    white-space: nowrap;
}

.legend-item:last-child {
    margin-right: 0;
}

.legend-item--faded {
    opacity: 0.5;
}

.color-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid #333;
    margin-right: 0.4rem;
    flex-shrink: 0;
}

.legend-item--faded .color-dot {
    border-color: #adb5bd;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
    .color-legend {
        padding: 0.6rem 0.8rem;
        font-size: 0.8rem;
    }

    .legend-title {
        margin-right: 0.75rem;
    }

    .legend-item {
        margin-right: 0.75rem;
        margin-bottom: 0.4rem;
    }
}

@media (max-width: 576px) {
    .color-legend {
        text-align: left;
    }

    .legend-title {
        display: block;
        margin-bottom: 0.5rem;
        margin-right: 0;
    }

    .legend-item {
        display: flex;
        align-items: center;
        margin-right: 0;
        margin-bottom: 0.4rem;
        width: auto;
    }

    .legend-item:last-child {
        margin-bottom: 0;
    }
}
</style>
