-- Migration: admin role + ads management

-- 1. Add role to profiles
alter table profiles add column if not exists role text not null default 'user'
  check (role in ('user', 'admin'));

-- 2. Helper function — checks if the calling user is an admin
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- 3. Ads RLS — drop old read-only policy, replace with role-aware ones
drop policy if exists "public_read_active_ads" on ads;

create policy "ads_select"  on ads for select using (active = true or is_admin());
create policy "ads_insert"  on ads for insert with check (is_admin());
create policy "ads_update"  on ads for update using (is_admin());
create policy "ads_delete"  on ads for delete using (is_admin());

-- 4. Profiles — allow admin to read all profiles (for future user management)
create policy "profiles_admin_select" on profiles for select using (is_admin());
