<!-- pages/admin/reset.vue -->
<!--
  Step 2 of a password reset: the page the recovery email links to. Supabase's
  browser client exchanges the code in the URL for a session on load (PKCE, so
  the link has to be opened in the browser that requested it). With a session,
  the user sets a new password; without one, the link was invalid or expired.
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
        New password.
      </h1>

      <p
        v-if="status === 'checking'"
        class="text-center"
        style="margin-top: 24px; font-size: 13px; letter-spacing: 0.2em; text-transform: uppercase; color: #b3b3af"
      >
        Checking your link…
      </p>

      <div v-else-if="status === 'invalid'" class="text-center" style="margin-top: 24px">
        <p style="font-size: 14px; line-height: 1.6; color: #3a3a37">
          This reset link is invalid or has expired. Links work once, for an
          hour, and only in the browser where you asked for them.
        </p>
        <NuxtLink
          to="/admin/forgot"
          class="inline-block text-[13px] font-bold tracking-[0.12em] uppercase"
          style="margin-top: 20px; color: #111"
          >Send a new link →</NuxtLink
        >
      </div>

      <form
        v-else-if="status === 'ready'"
        class="flex flex-col"
        style="gap: 16px; margin-top: 40px"
        @submit.prevent="savePassword"
      >
        <input
          v-model="password"
          type="password"
          required
          :minlength="MIN_LENGTH"
          placeholder="New password"
          autocomplete="new-password"
          class="w-full bbox"
          style="
            padding: 14px 16px;
            border: 1px solid #d9d9d5;
            border-radius: 6px;
            font-size: 15px;
            outline: none;
          "
        />
        <input
          v-model="confirm"
          type="password"
          required
          :minlength="MIN_LENGTH"
          placeholder="Repeat new password"
          autocomplete="new-password"
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
          {{ loading ? "Saving…" : "Save password" }}
        </button>
      </form>

      <p
        v-else-if="status === 'done'"
        class="text-center"
        role="status"
        style="margin-top: 24px; font-size: 14px; line-height: 1.6; color: #3a3a37"
      >
        Password updated. Taking you to the dashboard…
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
import { ref, onMounted, onBeforeUnmount } from "vue";

definePageMeta({ layout: false });

const MIN_LENGTH = 8;

const supabase = useSupabaseClient();
const router = useRouter();
const route = useRoute();

const status = ref<"checking" | "ready" | "invalid" | "done">("checking");
const password = ref("");
const confirm = ref("");
const loading = ref(false);
const errorMsg = ref("");

let unsubscribe: (() => void) | undefined;

onMounted(async () => {
  // Supabase puts the reason in the URL when a link is rejected.
  const urlError = (route.query.error_description ?? route.hash.match(/error_description=([^&]+)/)?.[1]) as
    | string
    | undefined;
  if (urlError) {
    status.value = "invalid";
    return;
  }

  // The client fires PASSWORD_RECOVERY once it has exchanged the link's code.
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY" || (session && status.value === "checking")) {
      status.value = "ready";
    }
  });
  unsubscribe = () => data.subscription.unsubscribe();

  // If the exchange already happened (or there is no code), decide from the
  // current session; a code in the URL still needs a moment to be exchanged.
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session) {
    status.value = "ready";
  } else if (!route.query.code) {
    status.value = "invalid";
  } else {
    setTimeout(() => {
      if (status.value === "checking") status.value = "invalid";
    }, 8000);
  }
});

onBeforeUnmount(() => unsubscribe?.());

async function savePassword() {
  errorMsg.value = "";
  if (password.value !== confirm.value) {
    errorMsg.value = "The two passwords don't match.";
    return;
  }
  loading.value = true;
  const { error } = await supabase.auth.updateUser({ password: password.value });
  loading.value = false;
  if (error) {
    errorMsg.value = error.message;
    return;
  }
  status.value = "done";
  setTimeout(() => router.replace("/admin"), 1200);
}

useHead({ title: "Admin — New password" });
</script>
