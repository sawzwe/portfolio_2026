<!-- pages/about.vue -->
<template>
  <div class="min-h-screen box-border" style="padding: 170px 44px 100px">
    <!-- Intro -->
    <div style="max-width: 960px; margin: 0 auto; text-align: center">
      <div
        class="text-[12px] tracking-[0.22em] text-grey-700 uppercase"
        style="margin-bottom: 36px"
      >
        About
      </div>
      <h1
        class="m-0 font-bold"
        style="
          font-size: clamp(40px, 5.4vw, 80px);
          line-height: 1.06;
          letter-spacing: -0.028em;
        "
      >
        From writing the code to deciding what gets built.
      </h1>
      <div
        style="height: 1px; background: #e4e4e0; margin: 64px auto; max-width: 880px"
      ></div>
      <p
        class="text-[19px]"
        style="line-height: 1.75; color: #3c3c3a; max-width: 720px; margin: 0 auto"
      >
        {{ site.intro }}
      </p>

      <!-- Facts -->
      <div
        class="grid gap-8"
        style="
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          margin-top: 72px;
          text-align: left;
          max-width: 880px;
          margin-left: auto;
          margin-right: auto;
        "
      >
        <div style="border-top: 1px solid #d9d9d5; padding-top: 16px">
          <div
            class="text-[11px] tracking-[0.18em] text-grey-700 uppercase"
            style="margin-bottom: 10px"
          >
            Name
          </div>
          <div
            class="text-[14px] font-semibold tracking-[0.06em] uppercase"
          >
            {{ site.name }}
          </div>
        </div>
        <div style="border-top: 1px solid #d9d9d5; padding-top: 16px">
          <div
            class="text-[11px] tracking-[0.18em] text-grey-700 uppercase"
            style="margin-bottom: 10px"
          >
            Role
          </div>
          <div
            class="text-[14px] font-semibold tracking-[0.06em] uppercase"
          >
            {{ site.role }}
          </div>
        </div>
        <div style="border-top: 1px solid #d9d9d5; padding-top: 16px">
          <div
            class="text-[11px] tracking-[0.18em] text-grey-700 uppercase"
            style="margin-bottom: 10px"
          >
            Education
          </div>
          <div
            class="text-[14px] font-semibold tracking-[0.06em] uppercase"
          >
            {{ site.education }}
          </div>
        </div>
      </div>
    </div>

    <!-- Timeline -->
    <div style="max-width: 760px; margin: 140px auto 0">
      <div
        class="text-[12px] tracking-[0.22em] text-grey-700 uppercase text-center"
        style="margin-bottom: 80px"
      >
        Growth — 2020 → Now
      </div>
      <div class="relative" style="padding-left: 72px">
        <div
          class="absolute"
          style="
            left: 24px;
            top: 6px;
            bottom: 6px;
            width: 2px;
            background: #111;
            transform-origin: top;
          "
          :style="{ transform: lineVisible ? 'scaleY(1)' : 'scaleY(0)', transition: 'transform 1.2s ease' }"
        ></div>
        <div
          v-for="(t, i) in timeline"
          :key="t.year"
          :ref="(el) => setEntryRef(el, i)"
          class="relative"
          style="margin-bottom: 88px"
          :style="{
            opacity: entryVisible[i] ? 1 : 0,
            transform: entryVisible[i] ? 'none' : 'translateY(42px)',
            transition: 'opacity .6s ease, transform .6s ease',
          }"
        >
          <div
            class="absolute rounded-full"
            style="
              left: -55px;
              top: 8px;
              width: 12px;
              height: 12px;
              border: 2px solid #fcfcfb;
              box-shadow: 0 0 0 2px #111;
            "
            :style="{ background: t.dot }"
          ></div>
          <div
            class="text-[13px] font-mono tracking-[0.1em]"
            style="color: #a8a8a8"
          >
            {{ t.year }}
          </div>
          <div
            class="text-[26px] font-bold"
            style="letter-spacing: -0.015em; margin-top: 10px; line-height: 1.15"
          >
            {{ t.title }}
          </div>
          <div
            class="text-[16px]"
            style="line-height: 1.7; color: #6f6f6f; margin-top: 12px; max-width: 560px"
          >
            {{ t.text }}
          </div>
        </div>
      </div>

      <div class="text-center" style="margin-top: 20px">
        <NuxtLink
          to="/contact"
          class="inline-flex items-center rounded-full text-[13px] font-bold tracking-[0.12em] uppercase transition-transform duration-200 hover:scale-105"
          style="gap: 12px; background: #111; color: #fff; padding: 16px 28px"
        >
          Get in touch <span>→</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from "vue";
import siteData from "~/data/site.json";
import { timeline } from "~/data/timeline";
import type { SiteData } from "~/types/site";

const site = siteData as SiteData;

const lineVisible = ref(false);
const entryVisible = reactive<boolean[]>(timeline.map(() => false));
const entryEls: (Element | null)[] = [];

function setEntryRef(el: Element | null, i: number) {
  entryEls[i] = el;
}

let observer: IntersectionObserver | null = null;

onMounted(async () => {
  await nextTick();
  lineVisible.value = true;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    entryVisible.forEach((_, i) => (entryVisible[i] = true));
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const i = entryEls.indexOf(entry.target);
          if (i !== -1) entryVisible[i] = true;
          observer?.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );

  entryEls.forEach((el) => el && observer?.observe(el));
});

onBeforeUnmount(() => observer?.disconnect());

useHead({
  title: "About — Saw Zwe Wai Yan",
  meta: [{ name: "description", content: site.intro }],
});
</script>
