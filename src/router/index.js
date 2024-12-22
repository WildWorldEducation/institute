import { createRouter, createWebHistory } from 'vue-router';
import SkillsView from '../components/pages/SkillsView.vue';

import { useSessionDetailsStore } from '../stores/SessionDetailsStore';
import { useUserDetailsStore } from '../stores/UserDetailsStore';
import { useUserSkillsStore } from '../stores/UserSkillsStore.js';
import { useSkillsStore } from '../stores/SkillsStore.js';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/vertical-tree',
            name: 'vertical-tree',
            component: () => import('../components/pages/TidyTreeView.vue'),
            meta: { preventZoom: true, title: 'Skill tree' }
        },
        {
            path: '/my-tree',
            name: 'my-tree',
            component: () => import('../components/pages/MyTidyTreeView.vue'),
            meta: { preventZoom: true, title: 'My skill tree' }
        },

        {
            path: '/student/:studentId/skill-tree',
            name: 'student-vertical-tree',
            component: () =>
                import('../components/pages/StudentTidyTreeView.vue'),
            meta: {
                title: 'Skill tree',
                requiresAuth: true,
                roles: ['instructor', 'admin']
            }
        },
        {
            path: '/',
            name: 'hub',
            component: () => import('../components/pages/HubView.vue')
        },
        {
            path: '/radial-tree',
            name: 'radial-tree',
            component: () => import('../components/pages/RadialTreeView.vue'),
            meta: { preventZoom: true, title: 'Radial skill tree' }
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
                roles: ['instructor', 'admin']
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
            path: '/image-questions/:skillId/add',
            name: 'add-image-question',
            component: () =>
                import('../components/pages/AddImageQuestionView.vue')
        },
        {
            path: '/image-questions/edit/:id',
            name: 'edit-image-question',
            component: () =>
                import('../components/pages/EditImageQuestionView.vue')
        },
        {
            path: '/skills/:id/assessment',
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
            meta: {
                requiresAuth: true,
                roles: ['instructor', 'admin', 'editor']
            }
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
                import('../components/pages/UserActivityReportPageView.vue'),
            meta: { requiresAuth: true, roles: ['editor', 'admin'] }
        },
        {
            path: '/users/:userId/activity-report/source/:sourceId',
            name: 'user-activity-report-source',
            component: () =>
                import('../components/pages/UserActivityReportSourceView.vue'),
            meta: { requiresAuth: true, roles: ['editor', 'admin'] }
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
            component: () => import('../components/pages/EditSettingsView.vue'),
            meta: { requiresAuth: true, roles: ['admin'] }
        },
        {
            path: '/content-flags',
            name: 'content-flags',
            component: () => import('../components/pages/ContentFlagsView.vue'),
            meta: { requiresAuth: true, roles: ['admin', 'editor'] }
        },
        {
            path: '/check-student-question/:id',
            name: 'check-student-question',
            component: () =>
                import('../components/pages/CheckStudentQuestionView.vue'),
            meta: {
                requiresAuth: true,
                roles: ['admin', 'editor', 'instructor']
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
            name: 'todo-list',
            component: () => import('../components/pages/TodoListView.vue'),
            meta: { requiresAuth: true, roles: ['admin', 'editor'] }
        },
        {
            path: '/cohorts',
            name: 'cohorts',
            component: () =>
                import('../components/pages/cohorts/CohortsListView.vue'),
            meta: { requiresAuth: true, roles: ['admin', 'instructor'] }
        },
        {
            path: '/cohorts/add',
            name: 'add-cohort',
            component: () =>
                import('../components/pages/cohorts/AddCohortView.vue'),
            meta: { requiresAuth: true, roles: ['admin', 'instructor'] }
        },
        {
            path: '/cohort/:cohortId',
            name: 'cohort',
            component: () =>
                import('../components/pages/cohorts/CohortView.vue'),
            meta: { requiresAuth: true, roles: ['admin', 'instructor'] }
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
            path: '/goals/:goalId',
            name: 'goal',
            component: () => import('../components/pages/goals/GoalView.vue')
        },
        {
            path: '/student/:studentId/goals',
            name: 'student-goals',
            component: () =>
                import('../components/pages/goals/ListStudentGoalsView.vue'),
            meta: {
                title: 'Student goals',
                requiresAuth: true,
                roles: ['instructor', 'admin']
            }
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
    const baseTitle = 'The Collins Institute';
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
        from.name == 'editor-signup'
    ) {
        // Kids theme
        if (userDetailsStore.theme == 'apprentice') {
            document.body.classList.remove('scholar-theme');
            document.body.classList.add('apprentice-theme');
        } else if (userDetailsStore.theme == 'scholar') {
            document.body.classList.add('scholar-theme');
            document.body.classList.remove('apprentice-theme');
            // Original theme.
        } else {
            document.body.classList.remove('scholar-theme');
            document.body.classList.remove('apprentice-theme');
        }
    }

    // Checking if skill is unlocked before allowing student to take assessment.
    if (to.name == 'assessment') {
        const userSkillsStore = useUserSkillsStore();

        await userSkillsStore.getUnnestedList(userDetailsStore.userId);
        const currentSkill = userSkillsStore.unnestedList.find(
            (item) => item.id == to.params.id
        );

        if (currentSkill.is_accessible != 1 || currentSkill.is_mastered == 1) {
            next({ path: '/skills/' + to.params.id });
            return;
        }
    }

    if (to.name == 'show-skill') {
        const skillsStore = useSkillsStore();

        await skillsStore.getSkillsList();

        const currentSkill = skillsStore.skillsList.find(
            (item) => item.URL == to.params.skillUrl
        );

        if (currentSkill.type == 'domain') {
            next({ path: '/skills' });
            return;
        }
    }

    if (
        (to.name == 'vertical-tree' && from.name == 'radial-tree') ||
        (from.name == 'vertical-tree' && to.name == 'radial-tree')
    ) {
        document.body.classList.add('skill-tree-transition');
    } else if (from.name == 'radial-tree' || from.name == 'vertical-tree') {
        document.body.classList.remove('skill-tree-transition');
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
        to.name !== 'vertical-tree' &&
        to.name !== 'show-skill'
    ) {
        next({ name: 'vertical-tree' });
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

    // To remove the vertical scroll bar.
    if (
        to.name == 'vertical-tree' ||
        to.name == 'radial-tree' ||
        to.name == 'skills' ||
        to.name == 'student-skills' ||
        to.name == 'student-signup' ||
        to.name == 'editor-signup' ||
        to.name == 'login'
    ) {
        document.getElementById('app').style.overflow = 'hidden';
    } else {
        document.getElementById('app').style.overflow = 'auto';
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
