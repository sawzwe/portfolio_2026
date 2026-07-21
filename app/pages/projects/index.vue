<!-- pages/projects/index.vue -->
<template>
  <div class="min-h-screen box-border" style="padding: 150px 0 80px">
    <!-- Header -->
    <div style="padding: 0 44px">
      <div
        class="text-[12px] tracking-[0.22em] text-grey-700 uppercase"
        style="margin-bottom: 22px"
      >
        Projects
      </div>
      <h2
        class="m-0 font-bold"
        style="
          font-size: clamp(36px, 4.6vw, 68px);
          line-height: 1.06;
          letter-spacing: -0.028em;
          max-width: 820px;
        "
      >
        Projects across development, data, and SEO.
      </h2>

      <!-- Filters -->
      <div class="flex" style="gap: 28px; margin-top: 44px">
        <button
          v-for="f in filtersWithCount"
          :key="f.key"
          type="button"
          class="whitespace-nowrap flex-none text-[13px] tracking-[0.12em] uppercase transition-colors duration-200 bg-transparent border-0 cursor-pointer p-0"
          :style="{
            fontWeight: filter === f.key ? 700 : 400,
            color: filter === f.key ? '#111' : '#b3b3af',
          }"
          @click="filter = f.key"
        >
          {{ f.label }}
          <span class="text-[11px]" style="color: #c4c4c0">{{ f.count }}</span>
        </button>
      </div>
    </div>

    <!-- Horizontal gallery -->
    <div
      class="flex items-center overflow-x-auto"
      style="gap: 64px; padding: 60px 44px 40px; min-height: 560px"
    >
      <NuxtLink
        v-for="p in shown"
        :key="p.id"
        :to="`/projects/${p.id}`"
        class="flex-none flex flex-col group"
        style="gap: 16px"
        :style="{ width: p.w + 'px', transform: `translateY(${p.off}px)`, color: '#111' }"
      >
        <div
          class="flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]"
          :style="{ height: p.h + 'px', background: p.tint }"
        >
          <span
            class="font-mono text-[11px] tracking-[0.06em]"
            style="color: #a3a39e"
            >{{ p.ph }}</span
          >
        </div>
        <div>
          <div
            class="text-[11px] tracking-[0.14em] text-grey-700 uppercase"
          >
            {{ p.cats.join(" / ") }}
          </div>
          <div
            class="text-[16px] font-bold tracking-[0.04em] uppercase"
            style="margin-top: 6px"
          >
            {{ p.title }}
          </div>
        </div>
      </NuxtLink>
    </div>

    <div
      class="text-[12px] tracking-[0.14em] uppercase"
      style="padding: 0 44px; color: #b3b3af"
    >
      Scroll sideways · Click a project to open it
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { projects, projectFilters } from "~/data/projects";

type FilterKey = (typeof projectFilters)[number]["key"];

const filter = ref<FilterKey>("all");

const filtersWithCount = computed(() =>
  projectFilters.map((f) => ({
    ...f,
    count:
      f.key === "all"
        ? projects.length
        : projects.filter((p) => p.group === f.key).length,
  }))
);

const shown = computed(() =>
  projects.filter((p) => filter.value === "all" || p.group === filter.value)
);

useHead({
  title: "Projects — Saw Zwe Wai Yan",
  meta: [
    {
      name: "description",
      content:
        "Selected projects across development, data, and technical SEO.",
    },
  ],
});
</script>
