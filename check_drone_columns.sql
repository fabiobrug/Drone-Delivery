-- Script simples para verificar as colunas da tabela drones
-- Execute este script no SQL Editor do Supabase

-- Verificar se a coluna current_load existe
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'drones' AND column_name = 'current_load';

-- Se não retornar nenhuma linha, a coluna não existe
-- Nesse caso, execute o comando abaixo para criá-la:

-- ALTER TABLE drones ADD COLUMN current_load DECIMAL(10,2) DEFAULT 0.0;

-- Verificar todas as colunas da tabela drones
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'drones'
ORDER BY ordinal_position;
