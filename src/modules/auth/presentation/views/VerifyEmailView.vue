<!-- src/modules/auth/presentation/views/VerifyEmailView.vue -->
<template>
  <div class="verify-page">
    <div class="verify-container">
      <div class="verify-card">
        <!-- Header -->
        <div class="mb-6 text-center">
          <div class="auth-brand" aria-label="RosterTheory by DraftProAnalytics">
            <p class="product-brand"><span class="brand-roster">Roster</span><span class="brand-theory">Theory<sup>™</sup></span></p>
            <p class="parent-brand">by DraftProAnalytics<sup>™</sup></p>
          </div>
          <h2 class="mt-3 text-2xl font-semibold text-slate-900">
            Verify your email
          </h2>
          <p class="mt-1 text-sm text-slate-800">
            We’re confirming your email address. This only takes a moment.
          </p>
        </div>

        <div class="auth-form-column">
          <div class="field-group">
        <!-- Pending -->
        <div v-if="status === 'pending'" class="text-center text-sm text-slate-900">
          <p class="mb-3">
            Verifying your email address&hellip;
          </p>
          <p class="text-xs text-slate-700">
            Please wait, do not close this window.
          </p>
        </div>

        <!-- Success -->
        <div v-else-if="status === 'success'" class="space-y-4 text-center">
          <p class="text-sm text-green-800 font-medium">
            Your email has been successfully verified.
          </p>
          <p class="text-xs text-slate-800">
            You can now sign in to your Sports Management account.
          </p>

          <Button
            label="Go to login"
            class="btn-primary-254290 w-full p-button-lg"
            @click="goToLogin"
          />
        </div>

        <!-- Error -->
        <div v-else class="space-y-4 text-center">
          <p class="text-sm text-red-700 font-medium">
            We could not verify your email.
          </p>
          <p class="text-xs text-slate-800">
            {{ errorMessage }}
          </p>

          <Button
            label="Back to login"
            class="btn-primary-254290 w-full p-button-lg"
            @click="goToLogin"
          />
        </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import { verifyEmailUseCase } from '../../application/usecases/verifyEmailUseCase';

type VerifyStatus = 'pending' | 'success' | 'error';

const route = useRoute();
const router = useRouter();

const status = ref<VerifyStatus>('pending');
const errorMessage = ref<string>('An unknown error occurred while verifying your email.');

function resolveTokenParam(): string | null {
  const param = route.params.token;
  if (Array.isArray(param)) {
    return param[0] ?? null;
  }
  return typeof param === 'string' ? param : null;
}

async function runVerification(): Promise<void> {
  const token = resolveTokenParam();

  if (!token) {
    status.value = 'error';
    errorMessage.value = 'Verification token is missing or invalid.';
    return;
  }

  try {
    await verifyEmailUseCase(token);
    status.value = 'success';

    // Optional: auto-redirect after a short delay
    window.setTimeout(() => {
      void router.push({ name: 'Login' });
    }, 2000);
  } catch (err: unknown) {
    status.value = 'error';

    if (err instanceof Error && err.message.trim().length > 0) {
      errorMessage.value = err.message;
    } else {
      errorMessage.value =
        'The verification link may be invalid or expired. Please request a new one.';
    }
  }
}

function goToLogin(): void {
  void router.push({ name: 'Login' });
}

onMounted(() => {
  void runVerification();
});
</script>

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

.verify-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background-color: #b66e00;
  color: #ffffff;
}

.verify-container {
  width: min(92vw, 1100px);
}

.verify-card {
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
/* Normalize text colors from utility classes used elsewhere */
.verify-card :deep(*) {
  color: #ffffff;
}

.btn-primary-254290 {
  background-color: #254290 !important;
  border-color: #254290 !important;
  color: #ffffff !important;
}

@media (max-width: 900px) {
  .auth-form-column {
    width: 70%;
  }
}

@media (max-width: 640px) {
  .verify-page {
    padding: 1rem 0.75rem;
  }

  .verify-card {
    padding: 1.25rem;
  }

  .auth-form-column {
    width: 100%;
  }
}
</style>
