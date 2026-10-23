<!-- pages/admin/forgot.vue -->
<!--
  Step 1 of a password reset: ask Supabase to email a recovery link that lands
  on /admin/reset. The confirmation is the same whether or not the address has
  an account, so the page never reveals which emails exist.
-->
<template>
  <div
    class="min-h-screen flex items-center justify-center box-border"
    style="padding: 44px"
  >
    <div class="w-full" style="max-width: 380px">
      <div
        class="text-[12px] tracking-[0.22em] text-grey-700 uppercase text-center"
        style="margin-bottom: 28px"
      >
        Admin
      </div>
      <h1
        class="m-0 font-bold text-center"
        style="font-size: clamp(32px, 4vw, 44px); letter-spacing: -0.02em"
      >
        Reset password.
      </h1>

      <template v-if="!sent">
        <p class="text-center" style="margin-top: 18px; font-size: 14px; line-height: 1.5; color: #6b6b67">
          Enter your email and we'll send you a link to set a new password.
        </p>
        <form class="flex flex-col" style="gap: 16px; margin-top: 32px" @submit.prevent="sendLink">
          <input
            v-model="email"
            type="email"
            required
            placeholder="Email"
            autocomplete="email"
            class="w-full bbox"
            style="
              padding: 14px 16px;
              border: 1px solid #d9d9d5;
              border-radius: 6px;
              font-size: 15px;
              outline: none;
            "
          />
          <button
            type="submit"
            :disabled="loading"
            class="w-full text-[13px] font-bold tracking-[0.12em] uppercase transition-opacity"
            style="
              background: #111;
              color: #fff;
              padding: 15px;
              border-radius: 99px;
              border: 0;
              cursor: pointer;
            "
            :style="{ opacity: loading ? 0.6 : 1 }"
          >
            {{ loading ? "Sending…" : "Send reset link" }}
          </button>
        </form>
      </template>

      <p
        v-else
        class="text-center"
        role="status"
        style="margin-top: 24px; font-size: 14px; line-height: 1.6; color: #3a3a37"
      >
        If an account exists for <strong>{{ email }}</strong>, a reset link is on
        its way. Open it in this browser; the link works once and expires after
        an hour.
      </p>

      <p
        v-if="errorMsg"
        class="text-center"
        role="alert"
        style="margin-top: 18px; color: #b00020; font-size: 13px"
      >
        {{ errorMsg }}
      </p>

      <div class="text-center" style="margin-top: 32px">
        <NuxtLink
          to="/admin/login"
          class="text-[12px] tracking-[0.14em] uppercase"
          style="color: #b3b3af"
          >← Back to sign in</NuxtLink
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

definePageMeta({ layout: false });

const supabase = useSupabaseClient();
const route = useRoute();

// Prefill from the sign-in form if it passed the email along.
const email = ref(typeof route.query.email === "string" ? route.query.email : "");
const loading = ref(false);
const sent = ref(false);
const errorMsg = ref("");

async function sendLink() {
  loading.value = true;
  errorMsg.value = "";
  // The link must come back to this site (the reset page reads it), so it
  // is built from the current origin. This URL has to be in the Supabase
  // project's allowed Redirect URLs.
  const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: `${window.location.origin}/admin/reset`,
  });
  loading.value = false;
  // Supabase reports unknown emails as success too; real errors are things
  // like rate limits or a bad redirect URL.
  if (error) {
    errorMsg.value = error.message;
    return;
  }
  sent.value = true;
}

useHead({ title: "Admin — Reset password" });
</script>
