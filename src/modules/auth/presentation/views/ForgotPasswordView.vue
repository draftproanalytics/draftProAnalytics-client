<!-- src/modules/auth/presentation/views/ForgotPasswordView.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { forgotPasswordUseCase } from '../../application/usecases/forgotPasswordUseCase';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';


const router = useRouter();
const emailAddress = ref<string>('');
const loading = ref<boolean>(false);
const errorMessage = ref<string>('');
const successMessage = ref<string>('');

async function onSubmit(): Promise<void> {
  errorMessage.value = '';
  successMessage.value = '';

  if (!emailAddress.value.trim()) {
    errorMessage.value = 'Please enter your email address.';
    return;
  }

  loading.value = true;
  try {
    await forgotPasswordUseCase({ emailAddress: emailAddress.value });
    successMessage.value =
      'If an account exists for that email, a reset link has been sent.';
  } catch {
    errorMessage.value = 'Unable to send reset email. Please try again.';
  } finally {
    loading.value = false;
  }
}

function goToLogin(): void {
  void router.push({ name: 'Login' });
}
</script>

<template>
  <div class="forgot-page">
    <div class="forgot-container">
      <div class="forgot-card">
        <div class="mb-6 text-center">
          <div class="auth-brand" aria-label="RosterTheory by DraftProAnalytics">
            <p class="product-brand"><span class="brand-roster">Roster</span><span class="brand-theory">Theory<sup>™</sup></span></p>
            <p class="parent-brand">by DraftProAnalytics<sup>™</sup></p>
          </div>
          <h2 class="mt-3 text-2xl font-semibold">
            Forgot password
          </h2>
          <p class="mt-1 text-sm">
            Enter your email and we’ll send a reset link.
          </p>
        </div>

        <div class="auth-form-column">
          <div class="field-group">
          <form class="space-y-4" @submit.prevent="onSubmit">
            <div class="form-row">
              <label for="emailAddress" class="form-label">Email</label>
              <InputText
                id="emailAddress"
                v-model="emailAddress"
                autocomplete="email"
                inputmode="email"
              />
            </div>

            <Message v-if="successMessage" severity="success" :closable="false">
              {{ successMessage }}
            </Message>

            <Message v-if="errorMessage" severity="error" :closable="false">
              {{ errorMessage }}
            </Message>

            <Button
              label="Send reset link"
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
        </div>
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

.forgot-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background-color: #b66e00;
  color: #ffffff;
}

.forgot-container {
  width: min(92vw, 1100px);
}

.forgot-card {
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

@media (max-width: 900px) {
  .auth-form-column {
    width: 70%;
  }
}

@media (max-width: 640px) {
  .forgot-page {
    padding: 1rem 0.75rem;
  }

  .forgot-card {
    padding: 1.25rem;
  }

  .auth-form-column {
    width: 100%;
  }
}
</style>
