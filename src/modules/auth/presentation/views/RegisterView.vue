<!-- DraftProAnalytics™ | Copyright © 2025-2026 Darryl Thompson. All rights reserved. -->
<!-- See LICENSE and TRADEMARKS.md. -->
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { registerPersonUseCase } from '../../application/usecases/registerPersonUseCase';
import { useAuthStore } from '../../application/authStore';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';

const router = useRouter();
const auth = useAuthStore();

const firstName = ref<string>('');
const lastName = ref<string>('');
const userName = ref<string>('');
const emailAddress = ref<string>('');
const password = ref<string>('');
const confirmPassword = ref<string>('');
const loading = ref<boolean>(false);
const errorMessage = ref<string>('');

async function onSubmit(): Promise<void> {
  errorMessage.value = '';

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.';
    return;
  }

  loading.value = true;
  try {
    await registerPersonUseCase({
      userName: userName.value,
      emailAddress: emailAddress.value,
      password: password.value,
      firstName: firstName.value,
      lastName: lastName.value,
    });

    await router.push({
      name: 'Login',
      query: { registered: '1' },
    });
  } catch {
    errorMessage.value = 'Unable to create account. Please try again.';
  } finally {
    loading.value = false;
  }
}

function onGoogleSignUp(): void {
  auth.loginWithGoogle();
}

function onAppleSignUp(): void {
  auth.loginWithApple();
}

function goToLogin(): void {
  void router.push({ name: 'Login' });
}
</script>

<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <div class="mb-6 text-center">
          <div class="auth-brand" aria-label="RosterTheory by DraftProAnalytics">
            <p class="product-brand"><span class="brand-roster">Roster</span><span class="brand-theory">Theory<sup>™</sup></span></p>
            <p class="parent-brand">by DraftProAnalytics<sup>™</sup></p>
          </div>
          <h2 class="mt-3 text-2xl font-semibold">
            Create account
          </h2>
          <p class="mt-1 text-sm">
            Create your NFL draft analytics account
          </p>
        </div>

        <div class="auth-form-column">
          <div class="field-group">
          <div class="mb-4 space-y-3">
            <button type="button" class="social-btn w-full" @click="onGoogleSignUp">
              <span class="social-icon pi pi-google" />
              <span>Sign up with Google</span>
            </button>

            <button type="button" class="social-btn w-full" @click="onAppleSignUp">
              <span class="social-icon pi pi-apple" />
              <span>Sign up with Apple</span>
            </button>
          </div>

          <div class="divider mb-5">
            <span></span>
            <span class="divider-label">or continue with email</span>
            <span></span>
          </div>

          <form class="space-y-4" @submit.prevent="onSubmit">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="form-row">
                <label for="firstName" class="form-label">First name</label>
                <InputText id="firstName" v-model="firstName" autocomplete="given-name" />
              </div>

              <div class="form-row">
                <label for="lastName" class="form-label">Last name</label>
                <InputText id="lastName" v-model="lastName" autocomplete="family-name" />
              </div>
            </div>

            <div class="form-row">
              <label for="userName" class="form-label">Username</label>
              <InputText id="userName" v-model="userName" autocomplete="username" />
            </div>

            <div class="form-row">
              <label for="emailAddress" class="form-label">Email</label>
              <InputText id="emailAddress" v-model="emailAddress" autocomplete="email" inputmode="email" />
            </div>

            <div class="form-row">
              <label for="password" class="form-label">Password</label>
              <Password
                inputId="password"
                v-model="password"
                toggleMask
                :feedback="false"
                autocomplete="new-password"
              />
            </div>

            <div class="form-row">
              <label for="confirmPassword" class="form-label">Confirm password</label>
              <Password
                inputId="confirmPassword"
                v-model="confirmPassword"
                toggleMask
                :feedback="false"
                autocomplete="new-password"
              />
            </div>

            <p v-if="errorMessage" class="text-sm font-medium">
              {{ errorMessage }}
            </p>

            <Button
              label="Create account"
              class="btn-primary-254290 w-full p-button-lg"
              :loading="loading"
              type="submit"
            />

            <Button
              label="Back to login"
              class="btn-outline-white w-full p-button-lg p-button-outlined"
              type="button"
              @click="goToLogin"
            />
          </form>
          </div>

          <p class="mt-5 text-center text-sm">
          Already have an account?
          <RouterLink to="/login" class="link-small">Sign in</RouterLink>
          </p>
        </div>
        <p class="ownership-notice">
          DraftProAnalytics™ · Copyright © 2025-2026 Darryl Thompson. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.1;
}

.brand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  width: 60px;
}

.brand-icon__svg {
  height: 60px;
  width: 60px;
  display: block;
}

.product-brand {
  margin: 0;
  font-size: clamp(1.65rem, 3vw, 2.35rem);
  font-weight: 800;
  letter-spacing: 0.015em;
}

.brand-roster {
  color: #ffffff;
}

.brand-theory {
  color: #0541ab;
}

.parent-brand {
  margin: 0.35rem 0 0;
  font-size: clamp(0.85rem, 1.4vw, 1rem);
  font-weight: 600;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.9);
}

.product-brand sup,
.parent-brand sup {
  position: relative;
  top: -0.2em;
  font-size: 0.48em;
}

.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background-color: #b66e00;
  color: #ffffff;
}

.register-container {
  width: min(92vw, 1100px);
}

.register-card {
  width: 100%;
  padding: 1.2em 2rem 2rem;
  background-color: #b66e00;
  border: 2px solid rgba(255, 255, 255, 0.75);
  border-radius: 1rem;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.3);
}

.auth-form-column {
  width: 45%;
  margin: 0 auto;
}

.brand-name {
  margin: 0;
  color: #ffffff;
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.ownership-notice {
  margin: 0.9rem 0 0;
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.72rem;
  line-height: 1.35;
  text-align: center;
}

.field-group {
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 1rem;
  padding: 1rem;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.125rem;
}

.helper-text {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.75rem;
}

.link-small {
  color: #ffffff;
  text-decoration: underline;
  font-size: 0.875rem;
}

:deep(.p-inputtext),
:deep(.p-password-input) {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.65);
  color: #ffffff;
}

:deep(.p-inputtext::placeholder),
:deep(.p-password-input::placeholder) {
  color: rgba(255, 255, 255, 0.78);
}

:deep(.p-message) {
  border-color: rgba(255, 255, 255, 0.45);
}

:deep(.p-password),
:deep(.p-password-input),
:deep(.p-inputtext) {
  width: 100%;
}

.btn-primary-254290 {
  background-color: #254290 !important;
  border-color: #254290 !important;
  color: #ffffff !important;
}

.btn-primary-254290:hover {
  filter: brightness(1.05);
}

.btn-outline-white {
  border-color: rgba(255, 255, 255, 0.75) !important;
  color: #ffffff !important;
}

.btn-outline-white:hover {
  background: rgba(255, 255, 255, 0.12) !important;
}
.divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.divider span {
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.45);
}

.divider-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.92);
  white-space: nowrap;
}

.social-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.65);
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  font-weight: 600;
}

.social-btn:hover {
  background: rgba(255, 255, 255, 0.18);
}

.social-icon {
  font-size: 1rem;
  line-height: 1;
}

@media (max-width: 900px) {
  .auth-form-column {
    width: 70%;
  }
}

@media (max-width: 640px) {
  .register-page {
    padding: 1rem 0.75rem;
  }

  .register-card {
    padding: 1.25rem;
  }

  .auth-form-column {
    width: 100%;
  }
}
</style>
