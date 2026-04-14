// ─────────────────────────────────────────────────────────────────────────────
//  CONFIGURACIÓN DE SUPABASE — Morrey Detailing
//  Seguí los pasos de abajo antes de usar el sistema de turnos
// ─────────────────────────────────────────────────────────────────────────────
//
//  PASO 1 — Crear proyecto en Supabase
//    → Entrá a https://supabase.com y creá una cuenta gratuita
//    → Creá un nuevo proyecto (cualquier nombre, ej: "morrey-detailing")
//
//  PASO 2 — Crear la tabla de turnos
//    → En tu proyecto, andá a "SQL Editor" y ejecutá este SQL:
//
//    create table bookings (
//      id              text primary key,
//      service         text,
//      date            text,
//      time            text,
//      name            text,
//      phone           text,
//      vehicle         text,
//      email           text,
//      status          text default 'pending',
//      notes           text,
//      payment_status  text,
//      payment_amount  numeric,
//      payment_method  text,
//      payment_notes   text,
//      price_estimate  numeric,
//      payment_date    timestamptz,
//      created_at      timestamptz default now()
//    );
//
//    alter table bookings enable row level security;
//
//    create policy "public_insert" on bookings for insert with check (true);
//    create policy "public_select" on bookings for select using (true);
//    create policy "public_update" on bookings for update using (true);
//    create policy "public_delete" on bookings for delete using (true);
//
//  PASO 3 — Obtener tus credenciales
//    → En tu proyecto andá a Settings → API
//    → Copiá "Project URL" y "anon public" key
//    → Pegalos abajo reemplazando los valores de ejemplo
//
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL      = 'https://YOUR-PROJECT-ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY-HERE';
