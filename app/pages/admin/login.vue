<!-- pages/admin/login.vue -->
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
        Sign in.
      </h1>

      <form class="flex flex-col" style="gap: 16px; margin-top: 40px" @submit.prevent="signIn">
        <input
          v-model="email"
          type="email"
          required
          placeholder="Email"
          autocomplete="email"
          class="w-full border bbox"
          style="
            padding: 14px 16px;
            border: 1px solid #d9d9d5;
            border-radius: 6px;
            font-size: 15px;
            outline: none;
          "
        />
        <input
          v-model="password"
          type="password"
          required
          placeholder="Password"
          autocomplete="current-password"
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
          {{ loading ? "Signing in…" : "Sign in" }}
        </button>
      </form>

      <p
        v-if="errorMsg"
        class="text-center"
        style="margin-top: 18px; color: #b00020; font-size: 13px"
      >
        {{ errorMsg }}
      </p>

      <div class="text-center" style="margin-top: 32px">
        <NuxtLink
          to="/"
          class="text-[12px] tracking-[0.14em] uppercase"
          style="color: #b3b3af"
          >← Back to site</NuxtLink
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

definePageMeta({ layout: false });

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMsg = ref("");

// If already signed in, go straight to the dashboard.
watchEffect(() => {
  if (user.value) router.replace("/admin");
});

async function signIn() {
  loading.value = true;
  errorMsg.value = "";
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  loading.value = false;
  if (error) {
    errorMsg.value = error.message;
    return;
  }
  router.replace("/admin");
}

useHead({ title: "Admin — Sign in" });
</script>
