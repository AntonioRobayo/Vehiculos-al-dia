-- Vehículo al Día — Initial Schema
-- Run this in Supabase SQL Editor or via: supabase db push

-- =====================
-- EXTENSIONS
-- =====================
create extension if not exists "uuid-ossp";

-- =====================
-- CATALOG TABLES (public read)
-- =====================

create table vehicle_types (
  id   uuid primary key default uuid_generate_v4(),
  name text not null,
  icon text,
  created_at timestamptz default now()
);

create table brands (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  vehicle_type_id uuid references vehicle_types(id) on delete cascade,
  created_at      timestamptz default now()
);

create table vehicle_references (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  brand_id   uuid references brands(id) on delete cascade,
  created_at timestamptz default now()
);

create table maintenance_actions (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  category   text,
  created_at timestamptz default now()
);

create table supplies (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  unit       text,
  created_at timestamptz default now()
);

create table ads (
  id           uuid primary key default uuid_generate_v4(),
  image_url    text,
  link_url     text,
  sponsor_name text not null,
  active       boolean default true,
  created_at   timestamptz default now()
);

-- =====================
-- USER DATA TABLES
-- =====================

create table profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  full_name          text,
  avatar_url         text,
  stripe_customer_id text unique,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

create table vehicles (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  name              text not null,
  description       text,
  brand_id          uuid references brands(id),
  vehicle_type_id   uuid references vehicle_types(id),
  reference_id      uuid references vehicle_references(id),
  plate             text,
  model_year        int,
  current_km        int default 0,
  soat_expiry       date,
  inspection_expiry date,
  oil_reference     text,
  image_url         text,
  is_active         boolean default true,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create table vehicle_licenses (
  id                     uuid primary key default uuid_generate_v4(),
  user_id                uuid not null references auth.users(id) on delete cascade,
  vehicle_id             uuid references vehicles(id) on delete set null,
  stripe_subscription_id text,
  stripe_item_id         text,
  status                 text not null default 'active'
                           check (status in ('active', 'canceled', 'past_due', 'trialing')),
  valid_until            timestamptz,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

create table km_updates (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  vehicle_id  uuid not null references vehicles(id) on delete cascade,
  km_value    int not null,
  notes       text,
  recorded_at timestamptz default now()
);

create table maintenances (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  vehicle_id    uuid not null references vehicles(id) on delete cascade,
  date          date not null default current_date,
  km_at_service int,
  workshop      text,
  notes         text,
  total_cost    numeric(12,2) default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table maintenance_details (
  id             uuid primary key default uuid_generate_v4(),
  maintenance_id uuid not null references maintenances(id) on delete cascade,
  action_id      uuid references maintenance_actions(id),
  supply_id      uuid references supplies(id),
  detail         text,
  cost           numeric(12,2) default 0,
  created_at     timestamptz default now()
);

-- =====================
-- TRIGGERS
-- =====================

-- Auto-create profile row on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- updated_at helper
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on profiles
  for each row execute procedure handle_updated_at();

create trigger set_vehicles_updated_at
  before update on vehicles
  for each row execute procedure handle_updated_at();

create trigger set_vehicle_licenses_updated_at
  before update on vehicle_licenses
  for each row execute procedure handle_updated_at();

create trigger set_maintenances_updated_at
  before update on maintenances
  for each row execute procedure handle_updated_at();

-- =====================
-- ROW LEVEL SECURITY
-- =====================

-- Catalog tables: enable RLS, allow public read, block writes from clients
alter table vehicle_types enable row level security;
alter table brands enable row level security;
alter table vehicle_references enable row level security;
alter table maintenance_actions enable row level security;
alter table supplies enable row level security;
alter table ads enable row level security;

create policy "public_read_vehicle_types"    on vehicle_types    for select using (true);
create policy "public_read_brands"           on brands           for select using (true);
create policy "public_read_vehicle_refs"     on vehicle_references for select using (true);
create policy "public_read_actions"          on maintenance_actions for select using (true);
create policy "public_read_supplies"         on supplies         for select using (true);
create policy "public_read_active_ads"       on ads              for select using (active = true);

-- User data tables: users can only access their own rows
alter table profiles enable row level security;
alter table vehicles enable row level security;
alter table vehicle_licenses enable row level security;
alter table km_updates enable row level security;
alter table maintenances enable row level security;
alter table maintenance_details enable row level security;

-- profiles
create policy "profiles_select" on profiles for select using (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- vehicles
create policy "vehicles_select" on vehicles for select using (auth.uid() = user_id);
create policy "vehicles_insert" on vehicles for insert with check (auth.uid() = user_id);
create policy "vehicles_update" on vehicles for update using (auth.uid() = user_id);
create policy "vehicles_delete" on vehicles for delete using (auth.uid() = user_id);

-- vehicle_licenses: users can read their own; only service role writes (via webhooks)
create policy "licenses_select" on vehicle_licenses for select using (auth.uid() = user_id);

-- km_updates
create policy "km_select" on km_updates for select using (auth.uid() = user_id);
create policy "km_insert" on km_updates for insert with check (auth.uid() = user_id);
create policy "km_delete" on km_updates for delete using (auth.uid() = user_id);

-- maintenances
create policy "maintenances_select" on maintenances for select using (auth.uid() = user_id);
create policy "maintenances_insert" on maintenances for insert with check (auth.uid() = user_id);
create policy "maintenances_update" on maintenances for update using (auth.uid() = user_id);
create policy "maintenances_delete" on maintenances for delete using (auth.uid() = user_id);

-- maintenance_details: access via parent maintenance ownership
create policy "details_select" on maintenance_details for select
  using (exists (
    select 1 from maintenances m
    where m.id = maintenance_details.maintenance_id
      and m.user_id = auth.uid()
  ));

create policy "details_insert" on maintenance_details for insert
  with check (exists (
    select 1 from maintenances m
    where m.id = maintenance_details.maintenance_id
      and m.user_id = auth.uid()
  ));

create policy "details_update" on maintenance_details for update
  using (exists (
    select 1 from maintenances m
    where m.id = maintenance_details.maintenance_id
      and m.user_id = auth.uid()
  ));

create policy "details_delete" on maintenance_details for delete
  using (exists (
    select 1 from maintenances m
    where m.id = maintenance_details.maintenance_id
      and m.user_id = auth.uid()
  ));
