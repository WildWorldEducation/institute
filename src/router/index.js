import { createRouter, createWebHistory } from 'vue-router';
import TidyTreeView from '../components/pages/TidyTreeView.vue';

import { useSessionDetailsStore } from '../stores/SessionDetailsStore';
import { useUserDetailsStore } from '../stores/UserDetailsStore';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [     
        {
            path: '/tidy-tree',
            name: 'tidy-tree',
            component: TidyTreeView
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
            path: '/skills',
            name: 'skills',
            component: () => import('../components/pages/SkillsView.vue')
        },
        {
            path: '/skills/:id',
            name: 'show-skill',
            component: () => import('../components/pages/ShowSkillView.vue')
        },
        {
            path: '/skills/add',
            name: 'add-skill',
            component: () => import('../components/pages/AddSkillView.vue')
        },
        {
            path: '/skills/edit/:id',
            name: 'edit-skill',
            component: () => import('../components/pages/EditSkillView.vue')
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
            component: () => import('../components/pages/UsersView.vue')
        },
        // {
        //   path: '/users/:username/skilltree',
        //   name: 'show-skilltree',
        //   component: () => import('../components/pages/ShowSkillTreeView.vue')
        // },
        {
            path: '/users/add',
            name: 'add-user',
            component: () => import('../components/pages/AddUserView.vue')
        },
        {
            path: '/users/edit/:id',
            name: 'edit-user',
            component: () => import('../components/pages/EditUserView.vue')
        },
        {
            path: '/user-skills/edit/:id',
            name: 'edit-user-skills',
            component: () =>
                import('../components/pages/EditSkillMasteryView.vue')
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
        }
    ]
});

// So as to only load stores once initially.
var hasInitialLoadCompleted = false;

var sessionDetailsStore;
var userDetailsStore;

router.beforeEach(async (to) => {
    // Make sure certain initial data has been loaded to the store before the home page opens.
    sessionDetailsStore = useSessionDetailsStore();

    if (sessionDetailsStore.isLoggedIn != true) {
        await sessionDetailsStore.getSessionDetails();
        userDetailsStore = useUserDetailsStore();
        await userDetailsStore.getUserDetails();
    }

    if (
        hasInitialLoadCompleted == false &&
        sessionDetailsStore.isLoggedIn == false &&
        // Avoid an infinite redirect
        to.name !== 'login'
    ) {
        // redirect the user to the login page
        return { name: 'login' };
    }
});

export default router;
