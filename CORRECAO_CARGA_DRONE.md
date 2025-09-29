# Correção do Problema de Persistência da Carga do Drone

## Problema Identificado

A informação da carga do drone não estava sendo persistida no banco de dados. Após alocar um pedido, a carga aparecia corretamente na interface, mas ao atualizar a página, voltava a 0kg.

## Soluções Implementadas

### 1. Correção no Frontend (DroneContext.jsx)

- ✅ Removida a chamada desnecessária para `api.getDrone()` após alocação
- ✅ Implementada atualização local do estado do drone com a nova carga
- ✅ Corrigida a função `removeOrderFromDrone` para atualizar a carga localmente

### 2. Verificação do Banco de Dados

O código do backend está correto e usa a coluna `current_load` na tabela `drones`.

## Passos para Resolver

### Passo 1: Verificar Estrutura do Banco

Execute o script `check_drone_columns.sql` no SQL Editor do Supabase para verificar se a coluna `current_load` existe:

```sql
-- Verificar se a coluna current_load existe
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'drones' AND column_name = 'current_load';
```

### Passo 2: Criar Coluna se Necessário

Se a coluna `current_load` não existir, execute:

```sql
ALTER TABLE drones ADD COLUMN current_load DECIMAL(10,2) DEFAULT 0.0;
```

### Passo 3: Atualizar Dados Existentes

Se houver drones com carga NULL, execute:

```sql
UPDATE drones SET current_load = 0.0 WHERE current_load IS NULL;
```

### Passo 4: Testar a Persistência

Execute o script `test_drone_persistence.js` no console do navegador para testar se a persistência está funcionando.

## Estrutura Esperada da Tabela Drones

A tabela `drones` deve ter as seguintes colunas:

```sql
CREATE TABLE drones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    type_id UUID REFERENCES drone_types(id),
    x DECIMAL(10,2) DEFAULT 25.0,
    y DECIMAL(10,2) DEFAULT 25.0,
    status VARCHAR(20) DEFAULT 'idle',
    battery DECIMAL(5,2) DEFAULT 100.0,
    capacity DECIMAL(10,2) NOT NULL,
    current_load DECIMAL(10,2) DEFAULT 0.0,  -- ← Esta é a coluna importante
    target_x DECIMAL(10,2),
    target_y DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Verificação Final

Após executar os passos acima:

1. ✅ A carga do drone deve ser exibida corretamente na interface
2. ✅ A carga deve ser persistida no banco de dados
3. ✅ Ao atualizar a página, a carga deve continuar correta
4. ✅ Ao alocar/remover pedidos, a carga deve ser atualizada corretamente

## Arquivos Modificados

- `frontend/DroneOps/src/context/DroneContext.jsx` - Correção na atualização local do estado
- `database_schema_update.sql` - Script completo para atualizar a estrutura do banco
- `check_drone_columns.sql` - Script simples para verificar colunas
- `test_drone_persistence.js` - Script de teste para verificar persistência
