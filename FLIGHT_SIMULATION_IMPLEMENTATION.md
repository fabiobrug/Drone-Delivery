# Implementação de Simulação de Voo de Drones

## Funcionalidades Implementadas

### 1. Redução Automática de Bateria

- **Frequência**: A cada 20 segundos
- **Redução**: 1% por intervalo
- **Status**: Apenas quando o drone está "flying"
- **Pouso de Emergência**: Quando bateria chega a 0%

### 2. Tempo Real de Entrega

- **Atualização**: A cada 5 segundos
- **Informações mostradas**:
  - Tempo restante para entrega
  - Distância até o destino
  - Posição atual do drone
  - Posição de destino
  - Bateria atual

### 3. Conclusão de Entrega

- **Trigger**: Quando drone chega ao destino (tolerância de 0.1 unidades)
- **Ações**:
  - Marca pedidos como "delivered"
  - Atualiza estatísticas do tipo de drone
  - Muda status para "returning"

### 4. Estatísticas de Tipos de Drone

- **Campos adicionados**:
  - `delivered_orders`: Pedidos entregues
  - `total_orders`: Total de pedidos atribuídos
- **Formato**: "X/Y" (entregues/total)

### 5. Retorno à Base

- **Status**: "returning"
- **Destino**: Central (25, 25)
- **Ações ao chegar**:
  - Status volta para "idle"
  - Bateria recarrega para 100%
  - Posição resetada para (25, 25)
  - Destino limpo

## Como Usar

### Backend

1. Execute o script SQL `add_drone_stats_columns.sql` no Supabase
2. Reinicie o servidor backend
3. Os novos endpoints estarão disponíveis:
   - `POST /api/drones/:id/start-flight` - Iniciar voo
   - `GET /api/drones/:id/delivery-time` - Info de entrega
   - `POST /api/drones/:id/stop-simulation` - Parar simulação

### Frontend

1. Na lista de drones, você verá:

   - Botão "Iniciar Voo" para drones em status "loading"
   - Botão "Parar Simulação" para drones "flying" ou "returning"
   - Informações de entrega em tempo real para drones voando

2. Na página de tipos de drone:
   - Estatísticas de pedidos entregues no formato "X/Y"

## Fluxo Completo

1. **Alocar pedido** → Drone fica "loading"
2. **Clicar "Iniciar Voo"** → Drone fica "flying"
3. **Simulação automática**:
   - Bateria reduz a cada 20s
   - Posição atualiza a cada 5s
   - Tempo de entrega atualiza a cada 5s
4. **Chegada ao destino** → Pedidos marcados como "delivered"
5. **Retorno automático** → Drone volta para central
6. **Chegada à base** → Drone volta para "idle" com bateria 100%

## Arquivos Modificados

### Backend

- `backend/services/FlightSimulationService.js` (novo)
- `backend/services/DroneService.js`
- `backend/controllers/DroneController.js`
- `backend/routes/DroneRoutes.js`
- `backend/models/DroneTypeModel.js`

### Frontend

- `frontend/DroneOps/src/services/api.js`
- `frontend/DroneOps/src/components/features/DroneList.jsx`
- `frontend/DroneOps/src/pages/DroneTypes.jsx`

### Database

- `add_drone_stats_columns.sql` (novo)

## Notas Técnicas

- As simulações usam `setInterval` e `setTimeout` para timing
- Polling de informações de entrega é iniciado/parado automaticamente
- Bateria não pode ficar negativa (mínimo 0%)
- Posição é atualizada suavemente em direção ao destino
- Todas as operações são assíncronas e incluem tratamento de erro
