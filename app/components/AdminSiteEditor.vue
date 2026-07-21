<!-- components/AdminSiteEditor.vue -->
<template>
  <div class="bbox" style="max-width: 760px">
    <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px 24px">
      <label class="admin-field">
        <span>Name</span>
        <input v-model="local.name" type="text" />
      </label>
      <label class="admin-field">
        <span>Role</span>
        <input v-model="local.role" type="text" />
      </label>
      <label class="admin-field">
        <span>Location</span>
        <input v-model="local.location" type="text" />
      </label>
      <label class="admin-field">
        <span>Availability</span>
        <input v-model="local.availability" type="text" />
      </label>
      <label class="admin-field">
        <span>Education</span>
        <input v-model="local.education" type="text" />
      </label>
      <label class="admin-field">
        <span>Focus</span>
        <input v-model="local.focus" type="text" />
      </label>
      <label class="admin-field" style="grid-column: 1 / -1">
        <span>Intro</span>
        <textarea v-model="local.intro" rows="4"></textarea>
      </label>
      <label class="admin-field">
        <span>Email</span>
        <input v-model="local.socials.email" type="text" />
      </label>
      <label class="admin-field">
        <span>LinkedIn URL</span>
        <input v-model="local.socials.linkedin" type="text" />
      </label>
      <label class="admin-field">
        <span>CV URL</span>
        <input v-model="local.socials.cv" type="text" />
      </label>
    </div>
    <div style="margin-top: 24px">
      <button
        type="button"
        class="text-[12px] font-bold tracking-[0.1em] uppercase"
        style="
          background: #111;
          color: #fff;
          padding: 12px 24px;
          border-radius: 99px;
          border: 0;
          cursor: pointer;
        "
        @click="$emit('save', deepCopy())"
      >
        Save site settings
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import type { SiteData } from "~/types/site";

const props = defineProps<{ site: SiteData }>();
defineEmits<{ save: [site: SiteData] }>();

const local = reactive<SiteData>(JSON.parse(JSON.stringify(props.site)));
watch(
  () => props.site,
  (s) => Object.assign(local, JSON.parse(JSON.stringify(s)))
);

function deepCopy(): SiteData {
  return JSON.parse(JSON.stringify(local));
}
</script>

<style scoped>
.admin-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.admin-field span {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #a8a8a8;
}
.admin-field input,
.admin-field textarea {
  border: 1px solid #d9d9d5;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
}
.admin-field input:focus,
.admin-field textarea:focus {
  border-color: #111;
}
</style>
