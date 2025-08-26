import { createRouter, createWebHistory } from 'vue-router';
import SkillsView from '../components/pages/SkillsView.vue';

import { useSessionDetailsStore } from '../stores/SessionDetailsStore';
import { useUserDetailsStore } from '../stores/UserDetailsStore';
import { useUserSkillsStore } from '../stores/UserSkillsStore.js';
import { useSkillsStore } from '../stores/SkillsStore.js';
import { useTenantStore } from '../stores/TenantStore.js';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: () => {
                return window.innerWidth < 576
                    ? { name: 'search' }
                    : { name: 'skill-tree' };
            }
        },
        {
            path: '/skill-tree',
            name: 'skill-tree',
            component: () => import('../components/pages/TidyTreeView.vue'),
            meta: { preventZoom: true, title: 'Skill Tree' }
        },
        {
            path: '/learning-tracks',
            name: 'learning-tracks',
            component: () =>
                import('../components/pages/LearningTracksView.vue'),
            meta: { preventZoom: true, title: 'Learning Tracks' }
        },
        {
            path: '/student/:studentId/skill-tree',
            name: 'student-vertical-tree',
            component: () =>
                import('../components/pages/StudentTidyTreeView.vue'),
            meta: {
                title: 'Student skill tree',
                requiresAuth: true,
                roles: ['instructor', 'platform_admin', 'partner']
            }
        },
        {
            path: '/search',
            name: 'search',
            component: () => import('../components/pages/SearchView.vue'),
            meta: {
                requiresAuth: false,
                roles: ['student', 'platform_admin'],
                title: 'Search'
            }
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../components/pages/LoginView.vue'),
            meta: { title: 'Login' }
        },
        {
            path: '/student-signup',
            name: 'student-signup',
            component: () =>
                import('../components/pages/SignUpStudentAccountView.vue'),
            meta: { title: 'Register' }
        },
        {
            path: '/instructor-signup',
            name: 'instructor-signup',
            component: () =>
                import('../components/pages/SignUpInstructorAccountView.vue'),
            meta: { title: 'Instructor sign up' }
        },
        {
            path: '/editor-signup',
            name: 'editor-signup',
            component: () =>
                import('../components/pages/SignUpEditorAccountView.vue'),
            meta: { title: 'Editor sign up' }
        },

        {
            path: '/skills',
            name: 'skills',
            component: SkillsView,
            meta: { title: 'Skills' }
        },
        {
            path: '/student/:studentId/skills',
            name: 'student-skills',
            component: SkillsView,
            meta: {
                title: 'Student skills',
                requiresAuth: true,
                roles: ['instructor', 'platform_admin', 'partner']
            }
        },
        {
            path: '/skills/:skillUrl',
            name: 'show-skill',
            component: () => import('../components/pages/ShowSkillView.vue')
        },
        {
            path: '/skills/add',
            name: 'add-skill',
            component: () => import('../components/pages/AddSkillView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/skills/edit/:skillUrl',
            name: 'edit-skill',
            component: () => import('../components/pages/EditSkillView.vue')
        },
        {
            path: '/skills/history/:skillUrl',
            name: 'skill-history',
            component: () => import('../components/pages/SkillHistoryView.vue')
        },
        {
            path: '/skills/:skillUrl/revision/:versionNumber',
            name: 'skill-revision',
            component: () =>
                import('../components/pages/ShowSkillRevisionView.vue')
        },
        // Learning Objectives
        {
            path: '/skills/:skillUrl/learning-objectives',
            name: 'list-learning-objectives',
            component: () =>
                import(
                    '../components/pages/learning-objectives/ListLearningObjectivesView.vue'
                )
        },
        {
            path: '/skills/:skillId/learning-objectives/edit/:objectiveId',
            name: 'edit-learning-objective',
            component: () =>
                import(
                    '../components/pages/learning-objectives/EditLearningObjectivesView.vue'
                )
        },
        {
            path: '/skills/:skillId/learning-objectives/add',
            name: 'add-learning-objective',
            component: () =>
                import(
                    '../components/pages/learning-objectives/AddLearningObjectivesView.vue'
                )
        },
        {
            path: '/skills/:id/question-bank/add',
            name: 'add-question',
            component: () => import('../components/pages/AddQuestionView.vue')
        },
        {
            path: '/skills/:skillUrl/question-bank',
            name: 'question-bank',
            component: () => import('../components/pages/QuestionBankView.vue')
        },
        {
            path: '/mc-questions/edit/:questionId',
            name: 'edit-mc-question',
            component: () =>
                import('../components/pages/EditMCQuestionView.vue')
        },
        {
            path: '/mc-questions/:skillId/add',
            name: 'add-mc-question',
            component: () => import('../components/pages/AddMCQuestionView.vue')
        },
        {
            path: '/essay-questions/:skillId/add',
            name: 'add-essay-question',
            component: () =>
                import('../components/pages/AddEssayQuestionView.vue')
        },
        {
            path: '/essay-questions/edit/:questionId',
            name: 'edit-essay-question',
            component: () =>
                import('../components/pages/EditEssayQuestionView.vue')
        },
        {
            path: '/image-questions/:skillId/add',
            name: 'add-image-question',
            component: () =>
                import('../components/pages/AddImageQuestionView.vue')
        },
        {
            path: '/image-questions/edit/:questionId',
            name: 'edit-image-question',
            component: () =>
                import('../components/pages/EditImageQuestionView.vue')
        },
        {
            path: '/skills/:skillId/assessment',
            name: 'assessment',
            component: () => import('../components/pages/AssessmentView.vue')
        },
        {
            path: '/assessments',
            name: 'list-assessments',
            component: () =>
                import('../components/pages/ListUnmarkedAssessmentsView.vue')
        },
        {
            path: '/mark-assessment/:id',
            name: 'mark-assessment',
            component: () =>
                import('../components/pages/MarkAssessmentView.vue')
        },
        {
            path: '/tags',
            name: 'tags',
            component: () => import('../components/pages/TagsView.vue')
        },
        {
            path: '/tags/add',
            name: 'add-tag',
            component: () => import('../components/pages/AddTagView.vue')
        },
        {
            path: '/tags/select',
            name: 'select-tags',
            component: () => import('../components/pages/SelectFiltersView.vue')
        },
        {
            path: '/resources/add/:skillId',
            name: 'add-resource',
            component: () => import('../components/pages/AddResourceView.vue')
        },
        {
            path: '/resources/edit/:resourceId',
            name: 'edit-resource',
            component: () => import('../components/pages/EditResourceView.vue')
        },
        {
            path: '/users',
            name: 'users',
            component: () => import('../components/pages/users/UsersView.vue'),
            meta: {
                requiresAuth: true,
                roles: ['platform_admin', 'editor']
            }
        },
        {
            path: '/students',
            name: 'students',
            component: () => import('../components/pages/users/UsersView.vue'),
            meta: {
                requiresAuth: true,
                roles: ['instructor', 'platform_admin', 'partner']
            }
        },

        // School admins only - classes from their school only
        {
            path: '/classes',
            name: 'classes',
            component: () =>
                import('../components/pages/OLD/InstructorsView.vue'),
            meta: {
                requiresAuth: true,
                roles: ['school_admin']
            }
        },
        // Platform admin only
        {
            path: '/tenants',
            name: 'tenants',
            component: () =>
                import('../components/pages/tenants/TenantsView.vue'),
            meta: {
                requiresAuth: true,
                roles: ['platform_admin']
            }
        },
        {
            path: '/tenants/add',
            name: 'add-tenant',
            component: () =>
                import('../components/pages/tenants/AddTenantView.vue'),
            meta: {
                requiresAuth: true,
                roles: ['platform_admin']
            }
        },
        {
            path: '/student-questions',
            name: 'student-questions',
            component: () =>
                import('../components/pages/StudentQuestionListView.vue'),
            meta: {
                requiresAuth: true,
                roles: ['platform_admin']
            }
        },
        {
            path: '/student-assessments',
            name: 'student-assessments',
            component: () =>
                import('../components/pages/MarkAssessmentView.vue'),
            meta: {
                requiresAuth: true,
                roles: ['instructor', 'platform_admin', 'partner']
            }
        },
        {
            path: '/users/add',
            name: 'add-user',
            component: () => import('../components/pages/AddUserView.vue'),
            meta: { requiresAuth: true, roles: ['platform_admin'] }
        },
        {
            path: '/users/add-student',
            name: 'add-student',
            component: () => import('../components/pages/AddStudentView.vue'),
            meta: { requiresAuth: true, roles: ['instructor', 'partner'] }
        },
        {
            path: '/users/edit/:id',
            name: 'edit-user',
            component: () => import('../components/pages/EditUserView.vue'),
            meta: {
                requiresAuth: true,
                roles: ['instructor', 'platform_admin', 'partner']
            }
        },
        {
            path: '/edit/student/:id/',
            name: 'edit-student',
            component: () => import('../components/components/EditStudent.vue'),
            meta: { requiresAuth: true, roles: ['instructor', 'partner'] }
        },
        {
            path: '/users/activity-report/:id',
            name: 'user-activity-report',
            component: () =>
                import('../components/pages/UserActivityReportPageView.vue'),
            meta: { requiresAuth: true, roles: ['editor', 'platform_admin'] }
        },
        {
            path: '/users/:userId/activity-report/source/:sourceId',
            name: 'user-activity-report-source',
            component: () =>
                import('../components/pages/UserActivityReportSourceView.vue'),
            meta: { requiresAuth: true, roles: ['editor', 'platform_admin'] }
        },
        {
            path: '/profile',
            name: 'profile',
            component: () =>
                import(
                    '../components/pages/dropdown-menu-pages/ProfileView.vue'
                )
        },
        {
            path: '/settings',
            name: 'settings',
            component: () =>
                import(
                    '../components/pages/dropdown-menu-pages/SettingsView.vue'
                )
        },
        // Student analytics
        {
            path: '/my-progress',
            name: 'my-progress',
            component: () =>
                import(
                    '../components/pages/analytics/student-analytics/StudentAnalyticsDashboardView.vue'
                ),
            meta: {
                requiresAuth: true,
                roles: ['student']
            }
        },
        {
            path: '/my-progress/skills',
            name: 'my-progress-skills',
            component: () =>
                import(
                    '../components/pages/analytics/student-analytics/StudentAnalyticsSkillsView.vue'
                ),
            meta: {
                requiresAuth: true,
                roles: ['student']
            }
        },
        {
            path: '/my-progress/time',
            name: 'my-progress-time',
            component: () =>
                import(
                    '../components/pages/analytics/student-analytics/StudentAnalyticsTimeView.vue'
                ),
            meta: {
                requiresAuth: true,
                roles: ['student']
            }
        },
        {
            path: '/my-progress/tokens',
            name: 'my-progress-tokens',
            component: () =>
                import(
                    '../components/pages/analytics/student-analytics/StudentAnalyticsTokensView.vue'
                ),
            meta: {
                requiresAuth: true,
                roles: ['student']
            }
        },
        // TODO - possibly remove this feature
        // Check with client first
        // {
        //     path: '/news-and-notifications',
        //     name: 'news-and-notifications',
        //     component: () =>
        //         import(
        //             '../components/pages/dropdown-menu-pages/NewsAndNotificationsView.vue'
        //         )
        // },
        {
            path: '/goals',
            name: 'goals',
            component: () => import('../components/pages/goals/GoalsView.vue')
        },
        {
            path: '/edit-student-password/:id',
            name: 'edit-student-password',
            component: () =>
                import('../components/pages/ChangeStudentPasswordView.vue'),
            meta: { requiresAuth: true, roles: ['instructor', 'partner'] }
        },
        {
            path: '/reputation',
            name: 'reputation',
            component: () =>
                import(
                    '../components/pages/dropdown-menu-pages/ReputationView.vue'
                )
        },
        {
            path: '/profile/edit',
            name: 'edit-profile',
            component: () => import('../components/pages/EditProfileView.vue')
        },
        {
            path: '/settings/edit',
            name: 'edit-settings',
            component: () => import('../components/pages/EditSettingsView.vue'),
            meta: { requiresAuth: true, roles: ['platform_admin'] }
        },
        {
            path: '/content-flags',
            name: 'content-flags',
            component: () => import('../components/pages/ContentFlagsView.vue'),
            meta: { requiresAuth: true, roles: ['platform_admin', 'editor'] }
        },
        {
            path: '/check-student-question/:id',
            name: 'check-student-question',
            component: () =>
                import('../components/pages/CheckStudentQuestionView.vue'),
            meta: {
                requiresAuth: true,
                roles: ['platform_admin', 'editor', 'instructor', 'partner']
            }
        },
        {
            path: '/tutor/add/:skillId',
            name: 'add-tutor',
            component: () => import('../components/pages/AddTutorPostView.vue')
        },
        {
            path: '/tutor/edit/:tutorPostId',
            name: 'edit-tutor',
            component: () => import('../components/pages/EditTutorPostView.vue')
        },
        {
            path: '/content-edit/:contentId/:userId/comparison',
            name: 'content-edit-comparison',
            component: () =>
                import('../components/pages/ContentEditComparisonView.vue')
        },
        {
            path: '/todo',
            name: 'todo',
            component: () => import('../components/pages/TodoListView.vue'),
            meta: { requiresAuth: true, roles: ['platform_admin', 'editor'] }
        },
        {
            path: '/cohorts',
            name: 'cohorts',
            component: () =>
                import('../components/pages/cohorts/CohortsView.vue'),
            meta: {
                requiresAuth: true,
                roles: ['platform_admin', 'instructor', 'partner']
            }
        },
        {
            path: '/cohorts/add',
            name: 'add-cohort',
            component: () =>
                import('../components/pages/cohorts/AddCohortView.vue'),
            meta: {
                requiresAuth: true,
                roles: ['platform_admin', 'instructor', 'partner']
            }
        },
        {
            path: '/cohort/edit/:cohortId',
            name: 'cohort',
            component: () =>
                import('../components/pages/cohorts/CohortView.vue'),
            meta: {
                requiresAuth: true,
                roles: ['platform_admin', 'instructor', 'partner']
            }
        },
        {
            path: '/password-reset',
            name: 'password-reset',
            component: () =>
                import(
                    '../components/pages/password-reset/PasswordResetView.vue'
                )
        },
        {
            path: '/reset-password/:token',
            name: 'reset-password',
            component: () =>
                import(
                    '../components/pages/password-reset/ResetPasswordView.vue'
                )
        },
        {
            path: '/new-skill-awaiting-approval/:id',
            name: 'new-skill-awaiting-approval',
            component: () =>
                import('../components/pages/NewSkillAwaitingApprovalView.vue')
        },
        {
            path: '/new-skill-awaiting-approval/edit/:id',
            name: 'edit-new-skill-awaiting-approval',
            component: () =>
                import(
                    '../components/pages/EditNewSkillAwaitingApprovalView.vue'
                )
        },
        {
            path: '/goals/:userId/:skillId',
            name: 'goal',
            component: () =>
                import('../components/pages/goals/GoalProgressView.vue')
        },
        {
            path: '/student/:studentId/goals',
            name: 'student-goals',
            component: () =>
                import('../components/pages/goals/ListStudentGoalsView.vue'),
            meta: {
                title: 'Student goals',
                requiresAuth: true,
                roles: ['instructor', 'platform_admin', 'partner']
            }
        },
        // Analytics - students
        {
            path: '/student/:studentId/assessment-status',
            name: 'student-assessment-status',
            component: () =>
                import(
                    '../components/pages/analytics/teacher-analytics/student/StudentAssessmentStatusReportView.vue'
                ),
            meta: {
                title: 'Student Assessment Report',
                requiresAuth: true,
                roles: ['instructor', 'partner']
            }
        },
        {
            path: '/student/:studentId/progress-report',
            name: 'student-progress-report',
            component: () =>
                import(
                    '../components/pages/analytics/teacher-analytics/student/StudentProgressReportView.vue'
                ),
            meta: {
                title: 'Student Progress Report',
                requiresAuth: true,
                roles: ['instructor', 'partner']
            }
        },
        {
            path: '/student/:studentId/skill-activity',
            name: 'student-skill-activity',
            component: () =>
                import(
                    '../components/pages/analytics/teacher-analytics/student/StudentSkillActivityReportView.vue'
                ),
            meta: {
                title: 'Student Skill Activity Report',
                requiresAuth: true,
                roles: ['instructor', 'partner']
            }
        },
        {
            path: '/student/:studentId/total-time',
            name: 'student-time-report',
            component: () =>
                import(
                    '../components/pages/analytics/teacher-analytics/student/StudentTimeReportView.vue'
                ),
            meta: {
                title: 'Student Time Report',
                requiresAuth: true,
                roles: ['instructor', 'partner']
            }
        },
        // Analytics - cohorts
        {
            path: '/cohort/:cohortId/assessment-status',
            name: 'cohort-assessment-status',
            component: () =>
                import(
                    '../components/pages/analytics/teacher-analytics/cohort/CohortAssessmentStatusReportView.vue'
                ),
            meta: {
                title: 'Cohort Assessment Status Report',
                requiresAuth: true,
                roles: ['instructor', 'partner']
            }
        },
        {
            path: '/cohort/:cohortId/total-time',
            name: 'cohort-time-report',
            component: () =>
                import(
                    '../components/pages/analytics/teacher-analytics/cohort/CohortTimeReportView.vue'
                ),
            meta: {
                title: 'Cohort Time Report',
                requiresAuth: true,
                roles: ['instructor', 'partner']
            }
        },
        {
            path: '/cohort/:cohortId/skill-activity',
            name: 'cohort-skill-activity',
            component: () =>
                import(
                    '../components/pages/analytics/teacher-analytics/cohort/CohortSkillActivityReportView.vue'
                ),
            meta: {
                title: 'Cohort Skill Activity Report',
                requiresAuth: true,
                roles: ['instructor', 'partner']
            }
        },
        {
            path: '/cohort/:cohortId/progress-report',
            name: 'cohort-progress-report',
            component: () =>
                import(
                    '../components/pages/analytics/teacher-analytics/cohort/CohortProgressReportView.vue'
                ),
            meta: {
                title: 'Cohort Progress Report',
                requiresAuth: true,
                roles: ['instructor', 'partner']
            }
        },
        // School Admin analytics
        {
            path: '/dashboard',
            name: 'school-admin-dashboard',
            component: () =>
                import(
                    '../components/pages/analytics/school-admin-analytics/SchoolAdminAnalyticsDashboardView.vue'
                ),
            meta: {
                title: 'School Admin Dashboard',
                requiresAuth: true,
                roles: ['school_admin']
            }
        },
        {
            path: '/reports/class/:teacherId',
            name: 'school-admin-classes',
            component: () =>
                import(
                    '../components/pages/analytics/school-admin-analytics/SchoolAdminAnalyticsClassReportView.vue'
                ),
            meta: {
                title: 'School Admin Classes',
                requiresAuth: true,
                roles: ['school_admin']
            }
        },
        {
            path: '/reports/student/:studentId',
            name: 'school-admin-students',
            component: () =>
                import(
                    '../components/pages/analytics/school-admin-analytics/SchoolAdminAnalyticsStudentReportView.vue'
                ),
            meta: {
                title: 'School Admin Students',
                requiresAuth: true,
                roles: ['school_admin']
            }
        },
        {
            path: '/reports/engagement',
            name: 'school-admin-engagement',
            component: () =>
                import(
                    '../components/pages/analytics/school-admin-analytics/SchoolAdminAnalyticsEngagementReportView.vue'
                ),
            meta: {
                title: 'School Admin Engagement',
                requiresAuth: true,
                roles: ['school_admin']
            }
        },
        {
            path: '/reports/cost',
            name: 'school-admin-cost',
            component: () =>
                import(
                    '../components/pages/analytics/school-admin-analytics/SchoolAdminAnalyticsCostReportView.vue'
                ),
            meta: {
                title: 'School Admin Cost',
                requiresAuth: true,
                roles: ['school_admin']
            }
        },
        // Tokens
        {
            path: '/tokens',
            name: 'tokens',
            component: () => import('../components/pages/tokens/TokensView.vue')
        },
        {
            path: '/tokens/completed',
            name: 'tokens-success',
            component: () =>
                import('../components/pages/tokens/TokensSuccessView.vue')
        },
        {
            path: '/tokens/error',
            name: 'tokens-error',
            component: () =>
                import('../components/pages/tokens/TokensErrorView.vue')
        },
        // School admin billing
        {
            path: '/tenant-billing',
            name: 'tenant-billing',
            component: () =>
                import('../components/pages/tokens/SchoolAdminBillingView.vue')
        },
        {
            path: '/tokens/tenant/completed',
            name: 'tenant-tokens-success',
            component: () =>
                import('../components/pages/tokens/TenantTokensSuccessView.vue')
        },
        {
            path: '/tokens/tenant/error',
            name: 'tenant-tokens-error',
            component: () =>
                import('../components/pages/tokens/TenantTokensErrorView.vue')
        },
        // Referrals
        {
            path: '/referrals',
            name: 'list-referrals',
            component: () =>
                import('../components/pages/partners/ReferralsListView.vue')
        },
        {
            path: '/referrals/:referredUserId',
            name: 'show-referral',
            component: () =>
                import('../components/pages/partners/ReferralView.vue')
        },
        {
            path: '/partners',
            name: 'partners',
            component: () =>
                import('../components/pages/partners/PartnersListView.vue')
        },
        {
            path: '/partners/:partnerId',
            name: 'partner',
            component: () =>
                import('../components/pages/partners/PartnerView.vue')
        },
        {
            path: '/student-payments/:studentId',
            name: 'student-payments',
            component: () =>
                import('../components/pages/partners/StudentPaymentsView.vue')
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: () => import('../components/pages/PageNotFoundView.vue')
        }
    ]
});

router.beforeEach(async (to, from, next) => {
    // Title tag.
    const baseTitle = 'Parrhesia';
    if (to.meta.title) {
        document.title = `${to.meta.title} - ${baseTitle}`;
    } else {
        document.title = baseTitle; // Fallback to base title
    }
    if (to.meta.preventZoom) {
        setViewport();
    } else {
        resetViewport();
    }
    const sessionDetailsStore = useSessionDetailsStore();
    const userDetailsStore = useUserDetailsStore();
    const tenantStore = useTenantStore();

    // SEO: canoncial tag.
    let link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
    let baseURL = 'https://parrhesia.io';

    // Check if skill page is a copy (ie appears more than once in the tree)
    let isCopy = to.href.includes('_copy');
    if (isCopy) {
        let originalPage = to.href.replace('_copy', '');
        link.href = baseURL + originalPage;
    } else {
        link.href = baseURL + to.href;
    }

    // Check if the user is logged in and fetch session details if not
    if (!sessionDetailsStore.isLoggedIn) {
        await sessionDetailsStore.getSessionDetails();
        await userDetailsStore.getUserDetails();
    }

    const isLoggedIn = sessionDetailsStore.isLoggedIn;
    const userRole = userDetailsStore.role;

    // Implement theme on login.
    if (
        from.name == 'login' ||
        from.name == 'student-signup' ||
        from.name == 'instructor-signup' ||
        from.name == 'editor-signup'
    ) {
        // Instructor theme
        if (
            userDetailsStore.theme == 'instructor' ||
            userDetailsStore.theme == 'partner'
        ) {
            document.body.classList.remove('editor-theme');
            document.body.classList.add('instructor-theme');
        } else if (userDetailsStore.theme == 'editor') {
            document.body.classList.add('editor-theme');
            document.body.classList.remove('instructor-theme');
            // Original theme.
        } else {
            document.body.classList.remove('editor-theme');
            document.body.classList.remove('instructor-theme');
        }
    }

    // Checking if skill is unlocked before allowing student to take assessment.
    if (to.name == 'assessment') {
        const userSkillsStore = useUserSkillsStore();

        await userSkillsStore.getUnnestedList(userDetailsStore.userId);
        const currentSkill = userSkillsStore.unnestedList.find(
            (item) => item.id == to.params.skillId
        );

        // Only block them if their instructor enforced locking.
        if (userDetailsStore.isSkillsLocked == 1) {
            if (
                currentSkill.is_accessible != 1 ||
                currentSkill.is_mastered == 1
            ) {
                next({ path: '/skills' });
                return;
            }
        }
    }

    if (to.name == 'show-skill') {
        const skillsStore = useSkillsStore();
        await skillsStore.getSkillsList();
        const currentSkill = skillsStore.skillsList.find(
            (item) => item.URL == to.params.skillUrl
        );
    }

    if (to.name == 'tokens') {
        if (tenantStore.billingMode == 'student') {
            next(); // proceed
        } else {
            next('/'); // redirect
        }
    }

    // Check if initial data has been loaded and user is not logged in, redirect to login
    if (
        !sessionDetailsStore.isLoggedIn &&
        to.name !== 'login' &&
        to.name !== 'student-signup' &&
        to.name !== 'editor-signup' &&
        to.name !== 'password-reset' &&
        to.name !== 'reset-password' &&
        // For guest access.
        to.name !== 'skill-tree' &&
        to.name !== 'show-skill' &&
        to.name !== 'instructor-signup' &&
        to.name !== 'search'
    ) {
        next({ name: 'skill-tree' });
        return;
    }

    // Route requires authentication
    if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (!isLoggedIn) {
            next({ name: 'login' });
        } else if (to.matched.some((record) => record.meta.roles)) {
            if (to.meta.roles.includes(userRole)) {
                next();
            } else {
                if (userDetailsStore.role == 'student') {
                    next({ name: 'skill-tree' });
                } // Redirect to Home if user doesn't have the required role
                else if (
                    userDetailsStore.role == 'instructor' ||
                    userDetailsStore.role == 'partner'
                ) {
                    next({ name: 'users' });
                } else if (userDetailsStore.role == 'editor') {
                    next({ name: 'todo' });
                }
            }
        } else {
            next(); // Proceed if only authentication is required and user is authenticated
        }
    } else {
        next(); // Proceed if no authentication is required
    }

    // To remove the vertical scroll bar.
    if (
        to.name == 'skill-tree' ||
        to.name == 'learning-tracks' ||
        to.name == 'student-skills' ||
        to.name == 'student-signup' ||
        to.name == 'editor-signup' ||
        to.name == 'instructor-signup' ||
        to.name == 'login'
    ) {
        document.getElementById('app').style.overflow = 'hidden';
        document
            .getElementById('router-view')
            .setAttribute('style', 'height:100%');
    } else {
        document.getElementById('app').style.overflow = 'auto';
        document
            .getElementById('router-view')
            .setAttribute('style', 'height:calc(100%-88px)');
    }
});

// Scroll to top of page.
router.afterEach((to, from, next) => {
    window.scrollTo(0, 0);
});

function setViewport() {
    let metaTag = document.querySelector('meta[name=viewport]');
    if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.name = 'viewport';
        document.head.appendChild(metaTag);
    }
    metaTag.content =
        'width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0, minimum-scale=1.0';
}

function resetViewport() {
    const metaTag = document.querySelector('meta[name=viewport]');
    if (metaTag) {
        metaTag.content = 'width=device-width, initial-scale=1.0'; // or your default value
    }
}
export default router;
