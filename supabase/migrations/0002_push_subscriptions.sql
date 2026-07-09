-- Push subscriptions for Web Push notifications
create table push_subscriptions (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz default now()
);

alter table push_subscriptions enable row level security;

create policy "push_select" on push_subscriptions for select using (auth.uid() = user_id);
create policy "push_insert" on push_subscriptions for insert with check (auth.uid() = user_id);
create policy "push_delete" on push_subscriptions for delete using (auth.uid() = user_id);
