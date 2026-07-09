-- Seed data for Vehículo al Día
-- Catalog: vehicle types, brands, references, actions, supplies

-- =====================
-- VEHICLE TYPES
-- =====================
insert into vehicle_types (id, name, icon) values
  ('a1000000-0000-0000-0000-000000000001', 'Automóvil',   'car'),
  ('a1000000-0000-0000-0000-000000000002', 'Motocicleta', 'bike'),
  ('a1000000-0000-0000-0000-000000000003', 'Camioneta',   'truck'),
  ('a1000000-0000-0000-0000-000000000004', 'Campero/SUV', 'suv'),
  ('a1000000-0000-0000-0000-000000000005', 'Bus/Buseta',  'bus')
on conflict do nothing;

-- =====================
-- BRANDS (Automóvil)
-- =====================
insert into brands (name, vehicle_type_id) values
  ('Chevrolet',   'a1000000-0000-0000-0000-000000000001'),
  ('Renault',     'a1000000-0000-0000-0000-000000000001'),
  ('Mazda',       'a1000000-0000-0000-0000-000000000001'),
  ('Toyota',      'a1000000-0000-0000-0000-000000000001'),
  ('Kia',         'a1000000-0000-0000-0000-000000000001'),
  ('Hyundai',     'a1000000-0000-0000-0000-000000000001'),
  ('Nissan',      'a1000000-0000-0000-0000-000000000001'),
  ('Volkswagen',  'a1000000-0000-0000-0000-000000000001'),
  ('Ford',        'a1000000-0000-0000-0000-000000000001'),
  ('Peugeot',     'a1000000-0000-0000-0000-000000000001'),
  ('Suzuki',      'a1000000-0000-0000-0000-000000000001');

-- Brands (Motocicleta)
insert into brands (name, vehicle_type_id) values
  ('Honda',       'a1000000-0000-0000-0000-000000000002'),
  ('Yamaha',      'a1000000-0000-0000-0000-000000000002'),
  ('Suzuki',      'a1000000-0000-0000-0000-000000000002'),
  ('AKT',         'a1000000-0000-0000-0000-000000000002'),
  ('Bajaj',       'a1000000-0000-0000-0000-000000000002'),
  ('Kawasaki',    'a1000000-0000-0000-0000-000000000002'),
  ('KTM',         'a1000000-0000-0000-0000-000000000002'),
  ('TVS',         'a1000000-0000-0000-0000-000000000002'),
  ('Auteco',      'a1000000-0000-0000-0000-000000000002');

-- Brands (Camioneta / Campero)
insert into brands (name, vehicle_type_id) values
  ('Toyota',      'a1000000-0000-0000-0000-000000000003'),
  ('Ford',        'a1000000-0000-0000-0000-000000000003'),
  ('Chevrolet',   'a1000000-0000-0000-0000-000000000003'),
  ('Nissan',      'a1000000-0000-0000-0000-000000000003'),
  ('Toyota',      'a1000000-0000-0000-0000-000000000004'),
  ('Hyundai',     'a1000000-0000-0000-0000-000000000004'),
  ('Kia',         'a1000000-0000-0000-0000-000000000004'),
  ('Jeep',        'a1000000-0000-0000-0000-000000000004'),
  ('Mitsubishi',  'a1000000-0000-0000-0000-000000000004');

-- =====================
-- MAINTENANCE ACTIONS
-- =====================
insert into maintenance_actions (name, category) values
  ('Cambio de aceite',                  'Motor'),
  ('Cambio de filtro de aceite',        'Motor'),
  ('Cambio de filtro de aire',          'Motor'),
  ('Cambio de filtro de combustible',   'Combustible'),
  ('Cambio de bujías',                  'Motor'),
  ('Cambio de correa de distribución',  'Motor'),
  ('Cambio de líquido de frenos',       'Frenos'),
  ('Cambio de pastillas de freno',      'Frenos'),
  ('Cambio de discos de freno',         'Frenos'),
  ('Cambio de banda de freno',          'Frenos'),
  ('Alineación y balanceo',             'Llantas'),
  ('Rotación de llantas',               'Llantas'),
  ('Cambio de llantas',                 'Llantas'),
  ('Cambio de batería',                 'Eléctrico'),
  ('Revisión del sistema eléctrico',    'Eléctrico'),
  ('Cambio de líquido refrigerante',    'Refrigeración'),
  ('Cambio de termostato',              'Refrigeración'),
  ('Mantenimiento de transmisión',      'Transmisión'),
  ('Cambio de aceite de caja',          'Transmisión'),
  ('Cambio de cadena y piñones',        'Transmisión'),
  ('Limpieza de inyectores',            'Combustible'),
  ('Revisión de frenos',                'Frenos'),
  ('Revisión de suspensión',            'Suspensión'),
  ('Cambio de amortiguadores',          'Suspensión'),
  ('Diagnóstico computarizado',         'Diagnóstico'),
  ('Peritaje técnico',                  'Diagnóstico'),
  ('Mantenimiento preventivo',          'General');

-- =====================
-- SUPPLIES
-- =====================
insert into supplies (name, unit) values
  ('Aceite de motor 20W-50',  'Lt'),
  ('Aceite de motor 10W-40',  'Lt'),
  ('Aceite de motor 5W-30',   'Lt'),
  ('Aceite sintético 5W-40',  'Lt'),
  ('Filtro de aceite',        'und'),
  ('Filtro de aire',          'und'),
  ('Filtro de combustible',   'und'),
  ('Filtro de habitáculo',    'und'),
  ('Bujías',                  'und'),
  ('Pastillas de freno',      'juego'),
  ('Discos de freno',         'und'),
  ('Líquido de frenos DOT4',  'Lt'),
  ('Líquido refrigerante',    'Lt'),
  ('Batería',                 'und'),
  ('Correa de distribución',  'und'),
  ('Kit de distribución',     'kit'),
  ('Aceite de caja',          'Lt'),
  ('Cadena de transmisión',   'und'),
  ('Piñón conductor',         'und'),
  ('Piñón conducido',         'und'),
  ('Llanta',                  'und'),
  ('Amortiguador',            'und');
