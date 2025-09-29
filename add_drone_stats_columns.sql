-- Script para adicionar colunas de estatísticas na tabela drone_types
-- Execute este script no seu banco de dados Supabase

-- Adicionar colunas de estatísticas de pedidos entregues
ALTER TABLE drone_types 
ADD COLUMN IF NOT EXISTS delivered_orders INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0;

-- Comentários para documentar as novas colunas
COMMENT ON COLUMN drone_types.delivered_orders IS 'Número total de pedidos entregues por drones deste tipo';
COMMENT ON COLUMN drone_types.total_orders IS 'Número total de pedidos atribuídos a drones deste tipo';

-- Atualizar valores existentes para 0 se forem NULL
UPDATE drone_types 
SET delivered_orders = 0, total_orders = 0 
WHERE delivered_orders IS NULL OR total_orders IS NULL;
