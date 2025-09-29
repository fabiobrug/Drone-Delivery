-- Script para verificar e corrigir a coluna current_load
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a coluna current_load existe
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'drones' AND column_name = 'current_load';

-- 2. Se não retornar nenhuma linha, a coluna não existe
-- Execute o comando abaixo para criá-la:

-- ALTER TABLE drones ADD COLUMN current_load DECIMAL(10,2) DEFAULT 0.0;

-- 3. Verificar todas as colunas da tabela drones
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'drones'
ORDER BY ordinal_position;

-- 4. Verificar dados atuais da tabela drones
SELECT id, serial_number, status, current_load, created_at, updated_at
FROM drones
ORDER BY updated_at DESC
LIMIT 5;

-- 5. Se a coluna existir mas estiver NULL, atualizar valores
-- UPDATE drones SET current_load = 0.0 WHERE current_load IS NULL;

-- 6. Verificar se há algum problema de permissão
-- Verificar se o usuário tem permissão para ver a coluna
SELECT has_column_privilege('drones', 'current_load', 'SELECT') as can_select,
       has_column_privilege('drones', 'current_load', 'UPDATE') as can_update;
