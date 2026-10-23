-- =============================================================
-- Timeline: one source of truth for the About page and the
-- sawmill hero. Adds the organisation shown on each plank's card.
--   year  : label printed on the plank ("2024", "now", "2020–24")
--   title : role / milestone
--   org   : company, school or "Project"
--   text  : one-line detail
-- sort_order is chronological (oldest first); the sawmill reverses it so the
-- newest entry is the slice under the saw.
-- =============================================================
alter table public.timeline
  add column if not exists org text not null default '';
