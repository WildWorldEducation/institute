import { createRouter, createWebHistory } from 'vue-router';
import SkillsView from '../components/pages/SkillsView.vue';

import { useSessionDetailsStore } from '../stores/SessionDetailsStore';
import { useUserDetailsStore } from '../stores/UserDetailsStore';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/vertical-tree',
            name: 'vertical-tree',
            component: () => import('../components/pages/TidyTreeView.vue')
        },
        {
            path: '/student/:studentId/skill-tree',
            name: 'student-vertical-tree',
            component: () =>
                import('../components/pages/StudentTidyTreeView.vue')
        },
        {
            path: '/',
            name: 'hub',
            component: () => import('../components/pages/HubView.vue')
        },
        {
            path: '/radial-tree',
            name: 'radial-tree',
            component: () => import('../components/pages/RadialTreeView.vue')
        },
        {
            path: '/:id/skill-tree',
            name: 'student-skill-tree',
            component: () =>
                import('../components/pages/SkillTreeStudentView.vue')
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../components/pages/LoginView.vue')
        },
        {
            path: '/student-signup',
            name: 'student-signup',
            component: () =>
                import('../components/pages/SignUpStudentAccountView.vue')
        },
        {
            path: '/editor-signup',
            name: 'editor-signup',
            component: () =>
                import('../components/pages/SignUpEditorAccountView.vue')
        },

        {
            path: '/skills',
            name: 'skills',
            component: SkillsView
        },
        {
            path: '/student/:studentId/skills',
            name: 'student-skills',
            component: SkillsView
        },
        {
            path: '/skills/:skillId',
            name: 'show-skill',
            component: () => import('../components/pages/ShowSkillView.vue')
        },
        {
            path: '/skills/add',
            name: 'add-skill',
            component: () => import('../components/pages/AddSkillView.vue'),
            meta: { requiresAuth: true, roles: ['admin'] }
        },
        {
            path: '/skills/edit/:id',
            name: 'edit-skill',
            component: () => import('../components/pages/EditSkillView.vue')
        },
        {
            path: '/skills/history/:id',
            name: 'skill-history',
            component: () => import('../components/pages/SkillHistoryView.vue')
        },
        {
            path: '/skills/:skillId/revision/:versionNumber',
            name: 'skill-revision',
            component: () =>
                import('../components/pages/ShowSkillRevisionView.vue')
        },
        {
            path: '/skills/:id/question-bank/add',
            name: 'add-question',
            component: () => import('../components/pages/AddQuestionView.vue')
        },
        {
            path: '/skills/:id/question-bank',
            name: 'question-bank',
            component: () => import('../components/pages/QuestionBankView.vue')
        },
        {
            path: '/mc-questions/edit/:id',
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
            path: '/essay-questions/edit/:id',
            name: 'edit-essay-question',
            component: () =>
                import('../components/pages/EditEssayQuestionView.vue')
        },
        {
            path: '/skills/:id/assessment',
            name: 'assessment',
            component: () => import('../components/pages/AssessmentView.vue')
        },
        {
            path: '/skills/:id/edit-assessment',
            name: 'edit-assessment',
            component: () =>
                import('../components/pages/EditAssessmentView.vue')
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
            path: '/resources/add/:id',
            name: 'add-resource',
            component: () => import('../components/pages/AddResourceView.vue')
        },
        {
            path: '/resources/edit/:id',
            name: 'edit-resource',
            component: () => import('../components/pages/EditResourceView.vue')
        },
        {
            path: '/users',
            name: 'users',
            component: () => import('../components/pages/UsersView.vue'),
            meta: { requiresAuth: true, roles: ['instructor', 'admin'] }
        },
        {
            path: '/users/add',
            name: 'add-user',
            component: () => import('../components/pages/AddUserView.vue'),
            meta: { requiresAuth: true, roles: ['admin'] }
        },
        {
            path: '/users/add-student',
            name: 'add-student',
            component: () => import('../components/pages/AddStudentView.vue'),
            meta: { requiresAuth: true, roles: ['instructor'] }
        },
        {
            path: '/users/edit/:id',
            name: 'edit-user',
            component: () => import('../components/pages/EditUserView.vue'),
            meta: { requiresAuth: true, roles: ['instructor', 'admin'] }
        },
        {
            path: '/users/activity-report/:id',
            name: 'user-activity-report',
            component: () =>
                import('../components/pages/UserActivityReportPageView.vue')
        },
        {
            path: '/profile-settings',
            name: 'profile-settings',
            component: () =>
                import('../components/pages/ProfileSettingsView.vue')
        },
        {
            path: '/profile/edit',
            name: 'edit-profile',
            component: () => import('../components/pages/EditProfileView.vue')
        },
        {
            path: '/settings/edit',
            name: 'edit-settings',
            component: () => import('../components/pages/EditSettingsView.vue')
        },
        {
            path: '/settings/edit',
            name: 'edit-settings',
            component: () => import('../components/pages/EditSettingsView.vue')
        },
        {
            path: '/content-flags',
            name: 'content-flags',
            component: () => import('../components/pages/ContentFlagsView.vue')
        },
        {
            path: '/check-student-question/:id',
            name: 'check-student-question',
            component: () =>
                import('../components/pages/CheckStudentQuestionView.vue')
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
            path: '/content-edits',
            name: 'content-edits',
            component: () =>
                import('../components/pages/ContentEditsListView.vue')
        },
        {
            path: '/content-edit/:contentId/:userId/comparison',
            name: 'content-edit-comparison',
            component: () =>
                import('../components/pages/ContentEditComparisonView.vue')
        }
    ]
});

router.beforeEach(async (to, from, next) => {
    const sessionDetailsStore = useSessionDetailsStore();
    const userDetailsStore = useUserDetailsStore();

    // Check if the user is logged in and fetch session details if not
    if (!sessionDetailsStore.isLoggedIn) {
        await sessionDetailsStore.getSessionDetails();
        await userDetailsStore.getUserDetails();
    }

    const isLoggedIn = sessionDetailsStore.isLoggedIn;
    const userRole = userDetailsStore.role;

    // Check if initial data has been loaded and user is not logged in, redirect to login
    if (
        !sessionDetailsStore.isLoggedIn &&
        !sessionDetailsStore.isLoggedIn &&
        to.name !== 'login' &&
        to.name !== 'student-signup' &&
        to.name !== 'editor-signup'
    ) {
        next({ name: 'login' });
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
                next({ name: 'hub' }); // Redirect to Home if user doesn't have the required role
            }
        } else {
            next(); // Proceed if only authentication is required and user is authenticated
        }
    } else {
        next(); // Proceed if no authentication is required
    }
});

router.afterEach((to, from, next) => {
    window.scrollTo(0, 0);
    next();
});

export default router;
