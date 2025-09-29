-- Script para atualizar a estrutura da tabela de drones no Supabase
-- Execute este script no SQL Editor do Supabase

-- Verificar se a tabela drones existe e suas colunas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'drones'
ORDER BY ordinal_position;

-- Adicionar colunas que podem estar faltando na tabela drones
-- (Execute apenas se as colunas não existirem)

-- Adicionar coluna current_load se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drones' AND column_name = 'current_load'
    ) THEN
        ALTER TABLE drones ADD COLUMN current_load DECIMAL(10,2) DEFAULT 0.0;
    END IF;
END $$;

-- Adicionar coluna target_x se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drones' AND column_name = 'target_x'
    ) THEN
        ALTER TABLE drones ADD COLUMN target_x DECIMAL(10,2);
    END IF;
END $$;

-- Adicionar coluna target_y se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drones' AND column_name = 'target_y'
    ) THEN
        ALTER TABLE drones ADD COLUMN target_y DECIMAL(10,2);
    END IF;
END $$;

-- Adicionar coluna battery se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drones' AND column_name = 'battery'
    ) THEN
        ALTER TABLE drones ADD COLUMN battery DECIMAL(5,2) DEFAULT 100.0;
    END IF;
END $$;

-- Adicionar coluna capacity se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drones' AND column_name = 'capacity'
    ) THEN
        ALTER TABLE drones ADD COLUMN capacity DECIMAL(10,2) NOT NULL;
    END IF;
END $$;

-- Adicionar coluna status se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drones' AND column_name = 'status'
    ) THEN
        ALTER TABLE drones ADD COLUMN status VARCHAR(20) DEFAULT 'idle';
    END IF;
END $$;

-- Adicionar coluna x se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drones' AND column_name = 'x'
    ) THEN
        ALTER TABLE drones ADD COLUMN x DECIMAL(10,2) DEFAULT 25.0;
    END IF;
END $$;

-- Adicionar coluna y se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drones' AND column_name = 'y'
    ) THEN
        ALTER TABLE drones ADD COLUMN y DECIMAL(10,2) DEFAULT 25.0;
    END IF;
END $$;

-- Adicionar coluna type_id se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drones' AND column_name = 'type_id'
    ) THEN
        ALTER TABLE drones ADD COLUMN type_id UUID REFERENCES drone_types(id);
    END IF;
END $$;

-- Adicionar coluna serial_number se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'drones' AND column_name = 'serial_number'
    ) THEN
        ALTER TABLE drones ADD COLUMN serial_number VARCHAR(100) UNIQUE NOT NULL;
    END IF;
END $$;

-- Verificar a estrutura final da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'drones'
ORDER BY ordinal_position;

-- Atualizar valores padrão para drones existentes que podem ter valores NULL
UPDATE drones 
SET current_load = 0.0 
WHERE current_load IS NULL;

UPDATE drones 
SET battery = 100.0 
WHERE battery IS NULL;

UPDATE drones 
SET status = 'idle' 
WHERE status IS NULL;

UPDATE drones 
SET x = 25.0 
WHERE x IS NULL;

UPDATE drones 
SET y = 25.0 
WHERE y IS NULL;
