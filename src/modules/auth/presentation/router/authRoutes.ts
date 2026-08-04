// src/modules/auth/presentation/authRoutes.ts
import type { RouteRecordRaw } from 'vue-router';
import ForgotPasswordView from '../views/ForgotPasswordView.vue';
import ResetPasswordView from '../views/ResetPasswordView.vue';
import RegisterView from '../views/RegisterView.vue';
import LoginView from '../views/LoginView.vue';
import VerifyEmailView from '../views/VerifyEmailView.vue';

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { public: true, onlyWhenLoggedOut: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { public: true, onlyWhenLoggedOut: true },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPasswordView,
    meta: { public: true, onlyWhenLoggedOut: true },
  },
  {
    path: '/reset-password/:token',
    name: 'ResetPassword',
    component: ResetPasswordView,
    props: true,
    meta: { public: true },
  },
  {
    path: '/verify-email/:token',
    name: 'VerifyEmail',
    component: VerifyEmailView,
    props: true,
    meta: { public: true },
  },
];
