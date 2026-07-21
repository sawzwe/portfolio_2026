<!-- pages/projects/[id].vue -->
<template>
  <div v-if="proj" class="min-h-screen box-border" style="padding: 150px 44px 100px">
    <div style="max-width: 1180px; margin: 0 auto">
      <div
        class="text-[12px] tracking-[0.22em] text-grey-700 uppercase"
        style="margin-bottom: 22px"
      >
        {{ proj.cats.join(" / ") }} · {{ proj.year }}
      </div>
      <h1
        class="m-0 font-bold"
        style="
          font-size: clamp(40px, 5.6vw, 84px);
          line-height: 1.02;
          letter-spacing: -0.03em;
        "
      >
        {{ proj.title }}
      </h1>

      <!-- Meta -->
      <div
        class="grid gap-8"
        style="
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          margin-top: 56px;
          border-top: 1px solid #e4e4e0;
          padding-top: 28px;
        "
      >
        <div>
          <div
            class="text-[11px] tracking-[0.18em] text-grey-700 uppercase"
            style="margin-bottom: 10px"
          >
            Role
          </div>
          <div class="text-[15px] font-semibold">{{ proj.role }}</div>
        </div>
        <div>
          <div
            class="text-[11px] tracking-[0.18em] text-grey-700 uppercase"
            style="margin-bottom: 10px"
          >
            Year
          </div>
          <div class="text-[15px] font-semibold">{{ proj.year }}</div>
        </div>
        <div>
          <div
            class="text-[11px] tracking-[0.18em] text-grey-700 uppercase"
            style="margin-bottom: 10px"
          >
            Stack
          </div>
          <div class="text-[15px] font-semibold" style="line-height: 1.5">
            {{ proj.stack }}
          </div>
        </div>
      </div>

      <p
        class="text-[19px]"
        style="line-height: 1.7; color: #3c3c3a; max-width: 760px; margin: 56px 0 0"
      >
        {{ proj.desc }}
      </p>

      <!-- Points -->
      <div
        v-if="proj.points.length"
        class="flex flex-col"
        style="margin-top: 40px; max-width: 760px"
      >
        <div
          v-for="(pt, i) in proj.points"
          :key="i"
          class="flex"
          style="
            gap: 18px;
            padding: 18px 0;
            border-top: 1px solid #e9e9e5;
            font-size: 15.5px;
            line-height: 1.6;
            color: #3c3c3a;
          "
        >
          <span
            class="font-mono text-[12px]"
            style="color: #b3b3af; padding-top: 3px"
            >{{ String(i + 1).padStart(2, "0") }}</span
          >
          <span>{{ pt }}</span>
        </div>
      </div>

      <!-- Hero shot -->
      <div
        class="flex items-center justify-center"
        style="margin-top: 72px; height: 460px"
        :style="{ background: proj.tint }"
      >
        <span class="font-mono text-[11px]" style="color: #a3a39e"
          >{{ proj.ph }} — hero shot / illustration</span
        >
      </div>

      <!-- Detail shots -->
      <div
        class="grid"
        style="grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 32px"
      >
        <div
          class="flex items-center justify-center"
          style="height: 320px; background: #f0f0ec"
        >
          <span class="font-mono text-[11px]" style="color: #a3a39e"
            >detail shot 1</span
          >
        </div>
        <div
          class="flex items-center justify-center"
          style="height: 320px; background: #f0f0ec"
        >
          <span class="font-mono text-[11px]" style="color: #a3a39e"
            >detail shot 2</span
          >
        </div>
      </div>

      <!-- Footer nav -->
      <div
        class="flex justify-between items-center"
        style="
          margin-top: 80px;
          border-top: 1px solid #e4e4e0;
          padding-top: 28px;
        "
      >
        <NuxtLink
          to="/projects"
          class="text-[13px] tracking-[0.14em] uppercase font-bold"
          >← All projects</NuxtLink
        >
        <NuxtLink
          :to="`/projects/${next.id}`"
          class="text-[13px] tracking-[0.14em] uppercase font-bold"
          >Next: {{ next.title }} →</NuxtLink
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, createError } from "#imports";
import { projects } from "~/data/projects";
import type { Project } from "~/types/site";

const route = useRoute();

const proj = projects.find((p) => p.id === route.params.id);

if (!proj) {
  throw createError({
    statusCode: 404,
    statusMessage: "Project not found",
    fatal: true,
  });
}

const idx = projects.findIndex((p) => p.id === proj.id);
const next: Project = projects[(idx + 1) % projects.length]!;

useHead({
  title: `${proj.title} — Saw Zwe Wai Yan`,
  meta: [{ name: "description", content: proj.desc }],
});
</script>
