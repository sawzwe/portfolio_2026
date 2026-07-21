<!-- pages/admin/confirm.vue -->
<!-- Landing page for Supabase auth redirects; sends the user on to the dashboard. -->
<template>
  <div
    class="min-h-screen flex items-center justify-center"
    style="padding: 44px"
  >
    <div class="text-[13px] tracking-[0.2em] uppercase" style="color: #b3b3af">
      Signing you in…
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });

const user = useSupabaseUser();
const router = useRouter();

watchEffect(() => {
  if (user.value) router.replace("/admin");
});
</script>
