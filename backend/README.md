# Drone Operations Backend API

Backend API para o sistema de gerenciamento de operações de drones.

## 🚀 Funcionalidades

- **Gestão de Drones**: CRUD completo para drones
- **Gestão de Tipos de Drones**: CRUD para tipos de drones
- **Gestão de Pedidos**: CRUD para pedidos de entrega
- **Zonas de Exclusão**: Gerenciamento de zonas de não voo
- **Configurações do Sistema**: Configurações globais
- **Estatísticas**: Dashboard e métricas em tempo real
- **Roteamento**: Cálculo de rotas com algoritmo A\*
- **Otimização**: Algoritmos de otimização de rotas

## 📋 Pré-requisitos

- Node.js >= 18.0.0
- npm >= 8.0.0
- Conta no Supabase
- PostgreSQL (via Supabase)

## 🛠️ Instalação

1. Clone o repositório
2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:

   ```bash
   cp env.example .env
   ```

4. Edite o arquivo `.env` com suas credenciais do Supabase:
   ```env
   NODE_ENV=development
   PORT=3001
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_KEY=your_supabase_service_role_key_here
   ENCRYPTION_KEY=your_32_character_encryption_key_here
   FRONTEND_URL=http://localhost:5173
   ```

## 🚀 Execução

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm start
```

## 📚 API Endpoints

### Drones

- `GET /api/drones` - Listar todos os drones
- `GET /api/drones/:id` - Buscar drone específico
- `POST /api/drones` - Criar novo drone
- `PUT /api/drones/:id` - Atualizar drone
- `DELETE /api/drones/:id` - Excluir drone
- `PUT /api/drones/:id/status` - Atualizar status do drone
- `GET /api/drones/:id/orders` - Pedidos do drone
- `POST /api/drones/:id/orders` - Alocar pedido ao drone
- `DELETE /api/drones/:id/orders/:orderId` - Remover pedido do drone
- `GET /api/drones/:id/route` - Calcular rota do drone

### Tipos de Drones

- `GET /api/drone-types` - Listar todos os tipos
- `GET /api/drone-types/:id` - Buscar tipo específico
- `POST /api/drone-types` - Criar novo tipo
- `PUT /api/drone-types/:id` - Atualizar tipo
- `DELETE /api/drone-types/:id` - Excluir tipo
- `GET /api/drone-types/:id/stats` - Estatísticas do tipo

### Pedidos

- `GET /api/orders` - Listar todos os pedidos
- `GET /api/orders/:id` - Buscar pedido específico
- `POST /api/orders` - Criar novo pedido
- `PUT /api/orders/:id` - Atualizar pedido
- `DELETE /api/orders/:id` - Excluir pedido
- `PUT /api/orders/:id/status` - Atualizar status do pedido
- `GET /api/orders/filter/pending` - Pedidos pendentes
- `GET /api/orders/filter/allocated` - Pedidos alocados
- `GET /api/orders/filter/delivered` - Pedidos entregues

### Zonas de Exclusão

- `GET /api/no-fly-zones` - Listar todas as zonas
- `GET /api/no-fly-zones/:id` - Buscar zona específica
- `POST /api/no-fly-zones` - Criar nova zona
- `PUT /api/no-fly-zones/:id` - Atualizar zona
- `DELETE /api/no-fly-zones/:id` - Excluir zona
- `POST /api/no-fly-zones/:id/points` - Adicionar pontos à zona
- `DELETE /api/no-fly-zones/:id/points` - Remover pontos da zona
- `GET /api/no-fly-zones/check/:x/:y` - Verificar se ponto está em zona

### Configurações

- `GET /api/config` - Buscar configurações
- `PUT /api/config` - Atualizar configurações
- `GET /api/config/optimization` - Configurações de otimização
- `PUT /api/config/optimization` - Atualizar otimização
- `GET /api/config/system` - Configurações do sistema
- `PUT /api/config/system` - Atualizar configurações do sistema

### Estatísticas

- `GET /api/stats` - Estatísticas gerais
- `GET /api/stats/drones` - Estatísticas dos drones
- `GET /api/stats/orders` - Estatísticas dos pedidos
- `GET /api/stats/delivery` - Estatísticas de entrega
- `GET /api/stats/efficiency` - Eficiência do sistema
- `GET /api/stats/real-time` - Estatísticas em tempo real
- `GET /api/stats/dashboard` - Dados para dashboard

### Roteamento

- `POST /api/routing/calculate` - Calcular rota entre pontos
- `POST /api/routing/optimize` - Otimizar rotas
- `GET /api/routing/avoid-zones` - Verificar zonas de exclusão
- `POST /api/routing/check-route` - Verificar se rota evita zonas
- `GET /api/routing/waypoints/:droneId` - Obter waypoints do drone
- `POST /api/routing/update-waypoints/:droneId` - Atualizar waypoints

## 🗄️ Banco de Dados

O sistema usa PostgreSQL via Supabase. Execute os scripts SQL fornecidos para criar as tabelas necessárias.

## 🧪 Testes

```bash
npm test
```

## 📝 Logs

Os logs são gerados automaticamente e incluem:

- Requests HTTP
- Erros do sistema
- Atividades importantes
- Métricas de performance

## 🔧 Configuração

### Variáveis de Ambiente

| Variável            | Descrição                    | Padrão                  |
| ------------------- | ---------------------------- | ----------------------- |
| `NODE_ENV`          | Ambiente de execução         | `development`           |
| `PORT`              | Porta do servidor            | `3001`                  |
| `SUPABASE_URL`      | URL do Supabase              | -                       |
| `SUPABASE_ANON_KEY` | Chave anônima do Supabase    | -                       |
| `SUPABASE_KEY`      | Chave de serviço do Supabase | -                       |
| `ENCRYPTION_KEY`    | Chave de criptografia        | -                       |
| `FRONTEND_URL`      | URL do frontend              | `http://localhost:5173` |

## 📊 Monitoramento

O sistema inclui:

- Health check em `/health`
- Métricas de performance
- Logs estruturados
- Alertas de sistema

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
