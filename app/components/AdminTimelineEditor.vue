<!-- components/AdminTimelineEditor.vue -->
<template>
  <div
    class="bbox"
    style="
      border: 1px solid #e4e4e0;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 12px;
    "
  >
    <div class="grid" style="grid-template-columns: 120px 1fr; gap: 14px 20px">
      <label class="admin-field">
        <span>Year</span>
        <input v-model="local.year" type="text" />
      </label>
      <label class="admin-field">
        <span>Title</span>
        <input v-model="local.title" type="text" />
      </label>
      <label class="admin-field">
        <span>Dot color</span>
        <input v-model="local.dot" type="text" />
      </label>
      <label class="admin-field">
        <span>Sort order</span>
        <input v-model.number="local.sortOrder" type="number" />
      </label>
      <label class="admin-field" style="grid-column: 1 / -1">
        <span>Text</span>
        <textarea v-model="local.text" rows="2"></textarea>
      </label>
    </div>
    <div class="flex justify-end items-center" style="gap: 16px; margin-top: 14px">
      <button
        type="button"
        class="text-[12px] tracking-[0.1em] uppercase bg-transparent border-0 cursor-pointer p-0"
        style="color: #b00020"
        @click="$emit('delete', local)"
      >
        Delete
      </button>
      <button
        type="button"
        class="text-[12px] font-bold tracking-[0.1em] uppercase"
        style="
          background: #111;
          color: #fff;
          padding: 8px 16px;
          border-radius: 99px;
          border: 0;
          cursor: pointer;
        "
        @click="$emit('save', { ...local })"
      >
        Save
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import type { TimelineEntry } from "~/types/site";

const props = defineProps<{ entry: TimelineEntry }>();
defineEmits<{
  save: [entry: TimelineEntry];
  delete: [entry: TimelineEntry];
}>();

const local = reactive<TimelineEntry>({ ...props.entry });
watch(
  () => props.entry,
  (e) => Object.assign(local, e)
);
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
