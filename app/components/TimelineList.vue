<!-- components/TimelineList.vue -->
<!--
  The career timeline as plain semantic HTML, from the same CMS data as the
  sawmill planks and the About page. Newest first, like the sawmill. Server-rendered, so it is crawlable
  and read by screen readers (the canvas is aria-hidden). Visible on mobile;
  visually hidden but still accessible from 768px up, where the sawmill shows
  the same content.
-->
<template>
  <section class="timeline-list" aria-labelledby="timeline-list-heading">
    <h2 id="timeline-list-heading" class="timeline-list__heading">Timeline</h2>
    <ol class="timeline-list__items">
      <li v-for="(entry, i) in newestFirst" :key="entry.id ?? i" class="timeline-list__item">
        <p class="timeline-list__meta">{{ [entry.year, entry.org].filter(Boolean).join(" · ") }}</p>
        <h3 class="timeline-list__title">{{ entry.title }}</h3>
        <p class="timeline-list__detail">{{ entry.text }}</p>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import type { TimelineEntry } from "~/types/site";

// Stored oldest first (as on the About page); listed newest first.
const props = defineProps<{ timeline: readonly TimelineEntry[] }>();
const newestFirst = computed(() => [...props.timeline].reverse());
</script>

<style scoped>
.timeline-list {
  padding: 40px 0 8px;
}
.timeline-list__heading {
  margin: 0 0 18px;
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #6b6b67;
}
.timeline-list__items {
  margin: 0;
  padding: 0;
  list-style: none;
}
.timeline-list__item {
  border-top: 1px solid #d9d9d5;
  padding: 14px 0 18px;
}
.timeline-list__meta {
  margin: 0 0 6px;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #6b6b67;
}
.timeline-list__title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.timeline-list__detail {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #3a3a37;
}

/* Desktop: visually hidden, still in the accessibility tree. */
@media (min-width: 768px) {
  .timeline-list {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}
</style>
