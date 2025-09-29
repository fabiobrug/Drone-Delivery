-- Atualização do esquema das zonas no-fly para incluir informações de área
-- Este script adiciona colunas para calcular e armazenar a área das zonas no-fly

-- Adicionar colunas para área e limites das zonas no-fly
DO $$ 
BEGIN
    -- Adicionar coluna area se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'no_fly_zones' AND column_name = 'area'
    ) THEN
        ALTER TABLE no_fly_zones ADD COLUMN area INTEGER DEFAULT 0;
    END IF;
    
    -- Adicionar coluna min_x se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'no_fly_zones' AND column_name = 'min_x'
    ) THEN
        ALTER TABLE no_fly_zones ADD COLUMN min_x INTEGER DEFAULT 0;
    END IF;
    
    -- Adicionar coluna max_x se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'no_fly_zones' AND column_name = 'max_x'
    ) THEN
        ALTER TABLE no_fly_zones ADD COLUMN max_x INTEGER DEFAULT 0;
    END IF;
    
    -- Adicionar coluna min_y se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'no_fly_zones' AND column_name = 'min_y'
    ) THEN
        ALTER TABLE no_fly_zones ADD COLUMN min_y INTEGER DEFAULT 0;
    END IF;
    
    -- Adicionar coluna max_y se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'no_fly_zones' AND column_name = 'max_y'
    ) THEN
        ALTER TABLE no_fly_zones ADD COLUMN max_y INTEGER DEFAULT 0;
    END IF;
    
    -- Adicionar coluna width se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'no_fly_zones' AND column_name = 'width'
    ) THEN
        ALTER TABLE no_fly_zones ADD COLUMN width INTEGER DEFAULT 0;
    END IF;
    
    -- Adicionar coluna height se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'no_fly_zones' AND column_name = 'height'
    ) THEN
        ALTER TABLE no_fly_zones ADD COLUMN height INTEGER DEFAULT 0;
    END IF;
    
    -- Adicionar coluna cell_count se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'no_fly_zones' AND column_name = 'cell_count'
    ) THEN
        ALTER TABLE no_fly_zones ADD COLUMN cell_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Função para calcular e atualizar a área de uma zona no-fly
CREATE OR REPLACE FUNCTION update_no_fly_zone_area(zone_id UUID)
RETURNS VOID AS $$
DECLARE
    zone_min_x INTEGER;
    zone_max_x INTEGER;
    zone_min_y INTEGER;
    zone_max_y INTEGER;
    zone_width INTEGER;
    zone_height INTEGER;
    zone_area INTEGER;
    zone_cell_count INTEGER;
BEGIN
    -- Calcular limites da zona baseado nos pontos
    SELECT 
        MIN(x), MAX(x), MIN(y), MAX(y)
    INTO 
        zone_min_x, zone_max_x, zone_min_y, zone_max_y
    FROM no_fly_zone_points 
    WHERE zone_id = update_no_fly_zone_area.zone_id;
    
    -- Calcular dimensões
    zone_width := zone_max_x - zone_min_x + 1;
    zone_height := zone_max_y - zone_min_y + 1;
    zone_area := zone_width * zone_height;
    
    -- Contar células únicas na zona
    SELECT COUNT(DISTINCT CONCAT(x, ',', y))
    INTO zone_cell_count
    FROM no_fly_zone_points 
    WHERE zone_id = update_no_fly_zone_area.zone_id;
    
    -- Atualizar a zona com os novos valores
    UPDATE no_fly_zones 
    SET 
        min_x = zone_min_x,
        max_x = zone_max_x,
        min_y = zone_min_y,
        max_y = zone_max_y,
        width = zone_width,
        height = zone_height,
        area = zone_area,
        cell_count = zone_cell_count,
        updated_at = NOW()
    WHERE id = zone_id;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se um ponto está dentro de uma zona no-fly
CREATE OR REPLACE FUNCTION is_point_in_no_fly_zone(check_x INTEGER, check_y INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    zone_exists BOOLEAN := FALSE;
BEGIN
    -- Verificar se o ponto está dentro de alguma zona no-fly
    SELECT EXISTS(
        SELECT 1 
        FROM no_fly_zones nfz
        WHERE nfz.min_x <= check_x 
        AND nfz.max_x >= check_x 
        AND nfz.min_y <= check_y 
        AND nfz.max_y >= check_y
    ) INTO zone_exists;
    
    RETURN zone_exists;
END;
$$ LANGUAGE plpgsql;

-- Função para obter todas as zonas no-fly que contêm um ponto específico
CREATE OR REPLACE FUNCTION get_no_fly_zones_for_point(check_x INTEGER, check_y INTEGER)
RETURNS TABLE(zone_id UUID, zone_name VARCHAR, zone_area INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        nfz.id,
        nfz.name,
        nfz.area
    FROM no_fly_zones nfz
    WHERE nfz.min_x <= check_x 
    AND nfz.max_x >= check_x 
    AND nfz.min_y <= check_y 
    AND nfz.max_y >= check_y;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar automaticamente a área quando pontos são adicionados/removidos
CREATE OR REPLACE FUNCTION trigger_update_no_fly_zone_area()
RETURNS TRIGGER AS $$
BEGIN
    -- Se é uma operação de INSERT ou UPDATE
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_no_fly_zone_area(NEW.zone_id);
        RETURN NEW;
    END IF;
    
    -- Se é uma operação de DELETE
    IF TG_OP = 'DELETE' THEN
        PERFORM update_no_fly_zone_area(OLD.zone_id);
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS update_no_fly_zone_area_trigger ON no_fly_zone_points;
CREATE TRIGGER update_no_fly_zone_area_trigger
    AFTER INSERT OR UPDATE OR DELETE ON no_fly_zone_points
    FOR EACH ROW EXECUTE FUNCTION trigger_update_no_fly_zone_area();

-- Atualizar áreas das zonas existentes
DO $$
DECLARE
    zone_record RECORD;
BEGIN
    FOR zone_record IN SELECT id FROM no_fly_zones LOOP
        PERFORM update_no_fly_zone_area(zone_record.id);
    END LOOP;
END $$;

-- Verificar a estrutura final da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'no_fly_zones'
ORDER BY ordinal_position;

-- Mostrar estatísticas das zonas no-fly
SELECT 
    id,
    name,
    min_x,
    max_x,
    min_y,
    max_y,
    width,
    height,
    area,
    cell_count,
    created_at
FROM no_fly_zones
ORDER BY created_at DESC;
