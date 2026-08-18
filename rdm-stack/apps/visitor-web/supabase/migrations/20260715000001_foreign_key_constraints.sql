-- Add explicit FOREIGN KEY constraints for referential integrity
-- Previously, FKs were only implicit via inline REFERENCES

-- profiles references
alter table if exists public.mineral_balances
  add constraint mineral_balances_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

alter table if exists public.game_memberships
  add constraint game_memberships_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

alter table if exists public.reward_redemptions
  add constraint reward_redemptions_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

-- catalog references
alter table if exists public.reward_redemptions
  add constraint reward_redemptions_reward_id_fkey
  foreign key (reward_id) references public.rewards_catalog(id) on delete restrict;

-- commerce references
alter table if exists public.tour_bookings
  add constraint tour_bookings_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

alter table if exists public.commerce_subscriptions
  add constraint commerce_subscriptions_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

alter table if exists public.subscriptions_premium
  add constraint subscriptions_premium_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

-- content references
alter table if exists public.forum_posts
  add constraint forum_posts_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

alter table if exists public.forum_comments
  add constraint forum_comments_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

alter table if exists public.forum_comments
  add constraint forum_comments_post_id_fkey
  foreign key (post_id) references public.forum_posts(id) on delete cascade;

-- telemetry
alter table if exists public.telemetry_logs
  add constraint telemetry_logs_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete set null;
