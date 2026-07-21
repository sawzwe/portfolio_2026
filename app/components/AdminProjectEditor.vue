<!-- components/AdminProjectEditor.vue -->
<template>
  <div
    class="bbox"
    style="
      border: 1px solid #e4e4e0;
      border-radius: 10px;
      padding: 22px;
      margin-bottom: 16px;
    "
  >
    <!-- Collapsed header -->
    <div class="flex justify-between items-center">
      <button
        type="button"
        class="flex items-center bg-transparent border-0 cursor-pointer p-0 text-left"
        style="gap: 12px"
        @click="open = !open"
      >
        <span style="color: #b3b3af; font-size: 12px">{{
          open ? "▾" : "▸"
        }}</span>
        <span class="font-bold" style="font-size: 15px">{{
          local.title || "Untitled"
        }}</span>
        <span class="text-[12px]" style="color: #b3b3af"
          >{{ local.group }} · {{ local.year }}</span
        >
      </button>
      <div class="flex items-center" style="gap: 16px">
        <button
          type="button"
          class="text-[12px] tracking-[0.1em] uppercase bg-transparent border-0 cursor-pointer p-0"
          style="color: #b00020"
          @click="$emit('delete', local.id)"
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
          @click="$emit('save', normalized())"
        >
          Save
        </button>
      </div>
    </div>

    <!-- Expanded form -->
    <div v-show="open" style="margin-top: 22px">
      <div
        class="grid"
        style="grid-template-columns: 1fr 1fr; gap: 16px 24px"
      >
        <label class="admin-field">
          <span>Slug / id</span>
          <input v-model="local.id" type="text" />
        </label>
        <label class="admin-field">
          <span>Title</span>
          <input v-model="local.title" type="text" />
        </label>
        <label class="admin-field">
          <span>Year</span>
          <input v-model="local.year" type="text" />
        </label>
        <label class="admin-field">
          <span>Group</span>
          <select v-model="local.group">
            <option value="dev">dev</option>
            <option value="data">data</option>
            <option value="seo">seo</option>
          </select>
        </label>
        <label class="admin-field">
          <span>Role</span>
          <input v-model="local.role" type="text" />
        </label>
        <label class="admin-field">
          <span>Categories (comma separated)</span>
          <input v-model="catsStr" type="text" />
        </label>
        <label class="admin-field" style="grid-column: 1 / -1">
          <span>Stack</span>
          <input v-model="local.stack" type="text" />
        </label>
        <label class="admin-field">
          <span>Tint (hex)</span>
          <input v-model="local.tint" type="text" />
        </label>
        <label class="admin-field">
          <span>Placeholder caption</span>
          <input v-model="local.ph" type="text" />
        </label>
        <label class="admin-field">
          <span>Card width (px)</span>
          <input v-model.number="local.w" type="number" />
        </label>
        <label class="admin-field">
          <span>Card height (px)</span>
          <input v-model.number="local.h" type="number" />
        </label>
        <label class="admin-field">
          <span>Vertical offset (px)</span>
          <input v-model.number="local.off" type="number" />
        </label>
        <label class="admin-field">
          <span>Sort order</span>
          <input v-model.number="local.sortOrder" type="number" />
        </label>
        <label class="admin-field" style="grid-column: 1 / -1">
          <span>Description</span>
          <textarea v-model="local.desc" rows="3"></textarea>
        </label>
        <label class="admin-field" style="grid-column: 1 / -1">
          <span>Highlights (one per line)</span>
          <textarea v-model="pointsStr" rows="4"></textarea>
        </label>
      </div>

      <!-- Images -->
      <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 18px">
        <div
          class="text-[11px] tracking-[0.14em] uppercase"
          style="color: #a8a8a8; margin-bottom: 12px"
        >
          Images
        </div>
        <div class="flex items-center" style="gap: 20px; flex-wrap: wrap">
          <div>
            <div class="text-[12px]" style="margin-bottom: 6px; color: #6f6f6f">
              Hero
            </div>
            <img
              v-if="local.heroImage"
              :src="local.heroImage"
              class="object-cover"
              style="width: 140px; height: 90px; border-radius: 6px"
            />
            <div v-else class="admin-imgph">no image</div>
            <input
              type="file"
              accept="image/*"
              style="margin-top: 8px; font-size: 12px"
              @change="onHero"
            />
          </div>
          <div>
            <div class="text-[12px]" style="margin-bottom: 6px; color: #6f6f6f">
              Detail shots
            </div>
            <div class="flex" style="gap: 8px">
              <img
                v-for="(img, i) in local.detailImages"
                :key="i"
                :src="img"
                class="object-cover"
                style="width: 90px; height: 60px; border-radius: 6px"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              style="margin-top: 8px; font-size: 12px"
              @change="onDetails"
            />
          </div>
        </div>
        <p v-if="uploading" class="text-[12px]" style="color: #b3b3af; margin-top: 8px">
          Uploading…
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import type { Project } from "~/types/site";

const props = defineProps<{ project: Project }>();
const emit = defineEmits<{
  save: [project: Project];
  delete: [id: string];
}>();

const admin = useAdmin();

const open = ref(false);
const uploading = ref(false);
const local = reactive<Project>({ ...props.project });

// keep in sync if parent replaces the project
watch(
  () => props.project,
  (p) => Object.assign(local, p)
);

const catsStr = computed({
  get: () => local.cats.join(", "),
  set: (v: string) =>
    (local.cats = v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)),
});

const pointsStr = computed({
  get: () => (local.points ?? []).join("\n"),
  set: (v: string) =>
    (local.points = v
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)),
});

function normalized(): Project {
  return { ...local };
}

async function onHero(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  uploading.value = true;
  try {
    local.heroImage = await admin.uploadImage(file, local.id);
  } finally {
    uploading.value = false;
  }
}

async function onDetails(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? []);
  if (!files.length) return;
  uploading.value = true;
  try {
    const urls: string[] = [];
    for (const f of files) urls.push(await admin.uploadImage(f, local.id));
    local.detailImages = [...(local.detailImages ?? []), ...urls];
  } finally {
    uploading.value = false;
  }
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
.admin-field select,
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
.admin-field select:focus,
.admin-field textarea:focus {
  border-color: #111;
}
.admin-imgph {
  width: 140px;
  height: 90px;
  border: 1px dashed #d2d2ce;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #b3b3af;
}
</style>
